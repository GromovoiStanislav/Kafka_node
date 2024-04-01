import Redis from 'ioredis';
import { randomUUID } from 'node:crypto';
import eventProducer from '../event-produce.js';
import { NewConnection } from '../types/workflow.typs.js';
const redis = new Redis(process.env.REDIS_URL);
export class NewConnectionService {
    async getConnectionStatus(passportNumber, activationId) {
        const redisKey = `codelabs:newconn-service:connrequest:${passportNumber}:${activationId}`;
        const connection = await redis.get(redisKey);
        console.debug(connection, ' cached output');
        if (connection) {
            return connection;
        }
        else {
            throw new Error('invalid parameters');
        }
    }
    async initiateNewConnection(passportNumber) {
        const workflow = new NewConnection({
            history: { cableTV: 'pending', fixedLine: 'pending' },
            financeApproval: 'pending',
            activationStatus: 'pending',
        });
        const uniqueKey = randomUUID();
        const redisKey = `codelabs:newconn-service:connrequest:${passportNumber}:${uniqueKey}`;
        await redis
            .set(redisKey, JSON.stringify(workflow))
            .catch((e) => console.error(e));
        //emmit message to verification listners
        const event = {
            from: process.env.SERVICE_NAME,
            type: 'NEW_CONNECTION',
            key: passportNumber,
            result: 'pending',
        };
        await eventProducer(process.env.PRODUCE_TOPIC || 'error', event).catch((e) => console.error(e));
        return uniqueKey;
    }
}

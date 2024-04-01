import { Kafka } from 'kafkajs';
import Redis from 'ioredis';
import eventProducer from './event-produce.js';
import { NewConnection } from './types/workflow.typs.js';
const redis = new Redis(process.env.REDIS_URL);
const eventListner = async () => {
    //config Kafka
    const kafka = new Kafka({
        clientId: process.env.CLIENT_ID,
        brokers: [process.env.KAFKA_HOSTNAME],
        sasl: {
            mechanism: 'scram-sha-256',
            username: process.env.KAFKA_USERNAME,
            password: process.env.KAFKA_PASSWORD,
        },
        ssl: true,
    });
    //config consumer
    const consumer = kafka.consumer({
        groupId: process.env.CONSUMER_GROUP || 'default',
        retry: { retries: 0 },
    });
    //subscribe consumer
    await consumer
        .subscribe({
        topic: process.env.LISTEN_TOPIC || 'error',
        fromBeginning: true,
    })
        .catch((e) => console.error(e));
    //process messages
    await consumer.run({
        autoCommit: false,
        eachMessage: async ({ topic, partition, message }) => {
            console.debug(`new message : ${message.value?.toString()}`);
            const newMessage = JSON.parse(message.value?.toString() || '{}');
            //get from redis and check
            const keyPattern = `codelabs:newconn-service:connrequest:${newMessage.key}:*`;
            const redisKey = await redis.keys(keyPattern);
            /** need to validate if key exsist */
            const workflow = new NewConnection(JSON.parse((await redis.get(redisKey[0])) || '{}').workflow);
            console.debug(workflow, 'message from cache');
            if (newMessage.type === 'cableTV' || newMessage.type === 'fixedLine') {
                switch (newMessage.type) {
                    case 'cableTV':
                        workflow.history.cableTV = newMessage.result;
                        break;
                    case 'fixedLine':
                        workflow.history.fixedLine = newMessage.result;
                        break;
                    default:
                        break;
                }
                console.debug(workflow, 'updated status');
                if (workflow.historyStatus()) {
                    //this mean all verification pass. so continue to next step
                    console.info('all activation completed. moving to next step');
                    await redis.set(redisKey[0], JSON.stringify(workflow));
                    const event = {
                        from: process.env.SERVICE_NAME,
                        type: 'VERIFICATION_COMPLETE',
                        key: newMessage.key,
                        result: 'pending',
                    };
                    await eventProducer(process.env.PRODUCE_TOPIC || 'error', event).catch((e) => console.error(e));
                }
                else {
                    //need to store updated message
                    console.info('all activation NOT completed. waiting further');
                    await redis.set(redisKey[0], JSON.stringify(workflow));
                }
            }
            else {
                switch (newMessage.type) {
                    case 'payment-complete':
                        workflow.financeApproval = 'success';
                        console.debug(workflow, ' is after payment complete');
                        await redis.set(redisKey[0], JSON.stringify(workflow));
                        console.info('payment is completed. moving to activation');
                        const event = {
                            from: process.env.SERVICE_NAME,
                            type: 'FINANCE_COMPLETE',
                            key: newMessage.key,
                            result: 'pending',
                        };
                        await eventProducer(process.env.PRODUCE_TOPIC || 'error', event).catch((e) => console.error(e)); // here need to throw to avoif the offset commit
                        break;
                    case 'activation-complete':
                        workflow.activationStatus = 'success';
                        await redis.set(redisKey[0], JSON.stringify(workflow));
                        console.info('activation is completed.');
                        const completeevent = {
                            from: process.env.SERVICE_NAME,
                            type: 'ACTIVATION_COMPLETE',
                            key: newMessage.key,
                            result: 'pending',
                        };
                        await eventProducer(process.env.PRODUCE_TOPIC || 'error', completeevent).catch((e) => console.error(e)); // here need to throw to avoif the offset commit
                        const newWorkflow = new NewConnection(JSON.parse((await redis.get(redisKey[0])) || '{}').workflow);
                        console.debug(newWorkflow, 'process completed and notification sent');
                        //ideally record need to removed from cache and move to db. other wise if new request come it will cinflict with this
                        break;
                    default:
                        break;
                }
            }
            await consumer.commitOffsets([
                {
                    topic,
                    partition,
                    offset: (Number(message.offset) + 1).toString(),
                },
            ]);
        },
    });
};
export default eventListner;

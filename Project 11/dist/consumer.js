import { Kafka, } from 'kafkajs';
export class MyKafkaConsumer {
    kafkaConsumer;
    clientId;
    topicName;
    hostName;
    userName;
    password;
    constructor(hostName, userName, password, clientId, topicName) {
        this.clientId = clientId;
        this.topicName = topicName;
        this.hostName = hostName;
        this.userName = userName;
        this.password = password;
        this.kafkaConsumer = this.#createKafkaConsumer();
    }
    async startConsumer() {
        const topic = {
            topics: [this.topicName],
            fromBeginning: false,
        };
        try {
            await this.kafkaConsumer.connect();
            await this.kafkaConsumer.subscribe(topic);
            await this.kafkaConsumer.run({
                eachMessage: async (messagePayload) => {
                    const { message } = messagePayload;
                    console.log(` [/] Message successfully received from Kafka`);
                    console.log(JSON.parse(message?.value?.toString()));
                },
            });
        }
        catch (error) {
            console.log(' [X] Error: ', error);
        }
    }
    async shutdown() {
        await this.kafkaConsumer.disconnect();
    }
    #createKafkaConsumer() {
        const kafka = new Kafka({
            clientId: this.clientId,
            brokers: [this.hostName],
            sasl: {
                mechanism: 'scram-sha-256',
                username: this.userName,
                password: this.password,
            },
            ssl: true,
        });
        const consumer = kafka.consumer({ groupId: 'consumer-group' });
        return consumer;
    }
}

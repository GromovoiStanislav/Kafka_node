import { Kafka, Partitioners } from 'kafkajs';
export class MyKafkaProducer {
    clientId;
    topicName;
    hostName;
    userName;
    password;
    producer;
    constructor(hostName, userName, password, clientId, topicName) {
        this.clientId = clientId;
        this.topicName = topicName;
        this.hostName = hostName;
        this.userName = userName;
        this.password = password;
        this.producer = this.#createProducer();
    }
    async connect() {
        try {
            await this.producer.connect();
        }
        catch (error) {
            console.log('Error connecting the producer: ', error);
        }
    }
    async sendMessage(msg) {
        await this.producer.send({
            topic: this.topicName,
            messages: [{ value: msg }],
        });
    }
    async shutdown() {
        await this.producer.disconnect();
    }
    #createProducer() {
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
        return kafka.producer({
            createPartitioner: Partitioners.DefaultPartitioner,
        });
    }
}

import {
  Consumer,
  ConsumerSubscribeTopics,
  EachMessagePayload,
  Kafka,
} from 'kafkajs';

export class MyKafkaConsumer {
  private kafkaConsumer: Consumer;
  private clientId: string;
  private topicName: string;
  private hostName: string;
  private userName: string;
  private password: string;

  public constructor(
    hostName: string,
    userName: string,
    password: string,
    clientId: string,
    topicName: string
  ) {
    this.clientId = clientId;
    this.topicName = topicName;

    this.hostName = hostName;
    this.userName = userName;
    this.password = password;

    this.kafkaConsumer = this.#createKafkaConsumer();
  }

  public async startConsumer(): Promise<void> {
    const topic: ConsumerSubscribeTopics = {
      topics: [this.topicName],
      fromBeginning: false,
    };

    try {
      await this.kafkaConsumer.connect();
      await this.kafkaConsumer.subscribe(topic);

      await this.kafkaConsumer.run({
        eachMessage: async (messagePayload: EachMessagePayload) => {
          const { message } = messagePayload;
          console.log(` [/] Message successfully received from Kafka`);
          console.log(JSON.parse(message?.value?.toString()));
        },
      });
    } catch (error) {
      console.log(' [X] Error: ', error);
    }
  }

  public async shutdown(): Promise<void> {
    await this.kafkaConsumer.disconnect();
  }

  #createKafkaConsumer(): Consumer {
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

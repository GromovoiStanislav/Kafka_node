import { Kafka, Partitioners, Producer } from 'kafkajs';

export class MyKafkaProducer {
  private clientId: string;
  private topicName: string;
  private hostName: string;
  private userName: string;
  private password: string;

  private producer: Producer;

  constructor(
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

    this.producer = this.#createProducer();
  }

  async connect(): Promise<void> {
    try {
      await this.producer.connect();
    } catch (error) {
      console.log('Error connecting the producer: ', error);
    }
  }

  async sendMessage(msg: string): Promise<void> {
    await this.producer.send({
      topic: this.topicName,
      messages: [{ value: msg }],
    });
  }

  async shutdown(): Promise<void> {
    await this.producer.disconnect();
  }

  #createProducer(): Producer {
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

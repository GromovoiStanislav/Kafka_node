import { Injectable } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { ConfigService } from "@nestjs/config";


export interface EventProducer {
  produce(topic: string, event: Record<string, any>): void;
}

@Injectable()
export class KafkaProducer implements EventProducer {

  private kafka: Kafka;
  private producer: Producer;

  constructor(
    private configService: ConfigService
  ) {
    this.kafka = new Kafka({
      clientId: 'my-app',
      brokers: [this.configService.get<string>('KAFKA_HOSTNAME')],
      sasl: {
        mechanism: 'scram-sha-256',
        username: this.configService.get<string>('KAFKA_USERNAME'),
        password: this.configService.get<string>('KAFKA_PASSWORD'),
      },
      ssl: true,
    });

    this.producer = this.kafka.producer();
    this.producer.connect();
  }

  public produce<T>(topic: string, event: T): void {
    this.producer.send({ topic: topic, messages: [{ value: JSON.stringify(event) }] });
  }
}
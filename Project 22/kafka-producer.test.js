const { createKafkaProducer } = require('./producer-test');
describe('Kafka Producer Automation Test', () => {
  let producer;

  beforeAll(async () => {
    producer = await createKafkaProducer();
  });

  afterAll(async () => {
    if (producer) {
      await producer.disconnect();
    }
  });

  it('should produce a message to a Kafka topic', async () => {
    const topic = 'kafka-test';

    const message = {
      key: 'test-key',
      value: 'Test Kafka Message',
    };

    await producer.send({
      topic,
      messages: [message],
    });
  });
});

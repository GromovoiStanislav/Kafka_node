const { createKafkaConsumer } = require('./consumer-test');
describe('Kafka Consumer Tests', () => {
  let kafkaConsumer;

  beforeAll(async () => {
    kafkaConsumer = await createKafkaConsumer();
  });

  afterAll(async () => {
    if (kafkaConsumer) {
      await kafkaConsumer.disconnect();
    }
  }, 10000);

  test('should receive and process a Kafka message', async () => {
    const mockMessage = {
      topic: 'kafka-test',
      partition: 0,
      message: {
        key: 'test-key',
        value: 'Test Kafka Message',
      },
    };

    await kafkaConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        expect(topic).toBe(mockMessage.topic);
        expect(partition).toBe(mockMessage.partition);
        expect(message.key.toString()).toBe(mockMessage.message.key);
        expect(message.value.toString()).toBe(mockMessage.message.value);
      },
    });
  });
});

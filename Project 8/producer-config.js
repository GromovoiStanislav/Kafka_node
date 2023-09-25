require('dotenv').config();
const { Kafka, Partitioners } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'simply-app',
  brokers: [process.env.KAFKA_HOSTNAME],
  sasl: {
    mechanism: 'scram-sha-256',
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  },
  ssl: true,
});

const startProducer = async () => {
  const producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner, // Используем старый разделитель
  });

  await producer.connect();

  /*
    Опция acks (Acknowledgment) в Kafka определяет, сколько подтверждений должен получить производитель (producer) от брокеров (brokers) Kafka,
    прежде чем считать операцию отправки сообщения успешной. Варианты для этой опции включают:
    
    acks: 0: Производитель не ожидает подтверждений от брокеров и считает операцию успешной сразу после отправки сообщения.
    Этот режим самый быстрый, но может привести к потере данных, если брокер не сможет получить сообщение.
    
    acks: 1: Производитель ожидает подтверждение от лидера (leader) брокера, куда отправлено сообщение.
    Этот режим обеспечивает некоторый уровень надежности без необходимости получения подтверждений от всех реплик.
    
    acks: all или acks: -1: Производитель ожидает подтверждение от всех реплик (всех брокеров) для партиции, куда отправлено сообщение.
    Этот режим обеспечивает наивысший уровень надежности, так как гарантирует, что сообщение будет сохранено даже при сбоях брокеров.
    
    Выбор подходящего значения для acks зависит от баланса между производительностью и надежностью, который необходим вашему приложению.
    Если скорость отправки сообщений важнее, вы можете использовать acks: 0, но это повышает риск потери данных.
    Если надежность критически важна, то acks: all обеспечивает наивысший уровень надежности,
    но может замедлить производительность из-за ожидания подтверждений от всех реплик.
   */

  await producer.send({
    topic: 'my-topic',
    acks: -1,
    messages: [
      {
        key: 'key1',
        value: 'first message',
        headers: {
          'correlation-id': 'uuid',
        },
      },
      {
        key: 'key2',
        value: 'second message',
      },
    ],
  });

  await producer.disconnect();
};

const startConsumer = async () => {
  const consumer = kafka.consumer({ groupId: 'simply-group' });
  await consumer.connect();
  await consumer.subscribe({ topic: 'my-topic', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        key: message.key.toString(),
        value: message.value.toString(),
        headers: message.headers,
        topic,
        partition,
      });
    },
  });
};

startProducer().then(startConsumer);

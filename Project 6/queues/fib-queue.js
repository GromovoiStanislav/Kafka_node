const {
  connectToKafka,
  closeConnection,
  sendMessage,
} = require('./kafkaConnection');

let kafkaConnected = false;

async function sendValueInFabQueue(num) {
  try {
    if (!kafkaConnected) {
      await connectToKafka();
      kafkaConnected = true;
    }

    const topic = 'fib-topic';
    await sendMessage(topic, num.toString());
    console.log(`Message sent to ${topic}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    // Не закрываем соединение, оставляем его открытым для повторного использования
    // Если вы хотите закрыть соединение, то вызовите
    // await closeConnection();
  }
}

module.exports = sendValueInFabQueue;

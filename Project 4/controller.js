import KafkaClient from './kafka.js';

const sendMessageToKafka = async (req, res) => {
  try {
    const { message } = req.body;

    const messages = [{ key: 'key1', value: message }];
    KafkaClient.produce('my-topic', messages);

    res.status(200).json({
      status: 'Ok!',
      message: 'Message successfully send!',
    });
  } catch (error) {
    console.log(error);
  }
};

const constrollers = { sendMessageToKafka };

export default constrollers;

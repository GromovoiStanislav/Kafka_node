import express from 'express';
import { CompressionTypes } from 'kafkajs';

const routes = express.Router();

routes.post('/certifications', async (req, res) => {
  const message = {
    user: { id: 1, name: 'Diego' },
    course: 'Kafka in Node.js',
    grade: 10,
  };

  // call microservice
  await req.producer.send({
    topic: 'issue-certificate',
    compression: CompressionTypes.GZIP,
    messages: [
      { value: JSON.stringify(message) },
      {
        value: JSON.stringify({
          user: { id: 2, name: 'Tomas' },
          course: 'Kafka in Node.js',
          grade: 10,
        }),
      },
    ],
  });

  return res.json({ ok: true });
});

export default routes;

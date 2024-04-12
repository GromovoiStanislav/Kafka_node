const { kafka } = require('./client');

const init = async () => {
  const admin = kafka.admin();
  console.log('Admin connecting...');
  admin.connect();
  console.log('Admin Connection Success...');

  console.log('Creating Topic [rider-updates]');

  const result = await admin.createTopics({
    topics: [
      {
        topic: 'rider-updates',
        numPartitions: 2,
      },
    ],
  });

  if (result) {
    console.log('Topic Created Success [rider-updates]');
  } else {
    console.log("Don't created!");
  }

  console.log('Disconnecting Admin..');
  await admin.disconnect();
};

init();

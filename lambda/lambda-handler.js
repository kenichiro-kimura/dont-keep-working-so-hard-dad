const { getNotifyTimeToTakeBreak, getLocalTimeStringRoundUpSeconds, getLastStartTimeAndEndTimeOfSensorStatus } = require('dkwshd');

exports.run = async () => {
  const time = getLocalTimeStringRoundUpSeconds(new Date().getTime());
  console.log(`Your cron function ran at ${time}`);
};

exports.run();

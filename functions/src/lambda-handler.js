const { getNotifyTimeToTakeBreak } = require('libs/scheduleCheck');
const { getLocalTimeStringRoundUpSeconds } = require('libs/timeFunction');
const { getLastStartTimeAndEndTimeOfSensorStatus } = require('libs/sensorStatus');

exports.run = async () => {
  const time = getLocalTimeStringRoundUpSeconds(new Date().getTime());
  console.log(`Your cron function ran at ${time}`);
};

exports.run();


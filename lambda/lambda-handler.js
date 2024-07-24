const { getNextBreakTime } = require('dkwshd');

exports.run = async () => {
  const sensorStatusHistory = [];
  const schedules = [];
  const distanceThreshold = process.env.distanceThreshold ? process.env.distanceThreshold : 100;
  const consecutiveTimes = process.env.consecutiveTimes ? process.env.consecutiveTimes : 5;
  const breakDuration = (process.env.breakDuration ? process.env.breakDuration : 300) * 1000;
  const workDuration = (process.env.workDuration ? process.env.workDuration : 1800) * 1000;

  const toNotify = getNextBreakTime(sensorStatusHistory, schedules, workDuration, breakDuration, distanceThreshold, consecutiveTimes);

  console.log(`toNotify: ${toNotify}`);

  /**
   * IoTCoreにメッセージを送信
   */
};

exports.run();

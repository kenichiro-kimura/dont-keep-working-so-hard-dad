const { getNextBreakTime } = require('dkwshd');

exports.run = async () => {
  const sensorStatusHistory = await getSensorStatusHistory();
  const schedules = await getSchedules();
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

const getSensorStatusHistory = () => {
  return [];
};

const getSchedules = async () => {
  const url = process.env.schedulesUrl;

  if (url === undefined) {
    return [];
  }

  const response = await fetch(url);
  if (!response.ok) {
    console.error('Network response was not ok');
    return [];
  } else {
    return response.json();
  }
};

exports.run();

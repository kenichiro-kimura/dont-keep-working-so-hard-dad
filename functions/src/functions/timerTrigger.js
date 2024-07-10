const { app, input } = require('@azure/functions');
const { getNotifyTimeToTakeBreak, getLocalTimeStringRoundUpSeconds } = require('../libs/scheduleCheck');
const { getLastStartTimeAndEndTimeOfSensorStatus } = require('../libs/sensorStatus');
const { sendC2DMessage } = require('../libs/sendMessage');

const today = new Date();
const year = today.getUTCFullYear();
const month = (today.getUTCMonth() + 1).toString().padStart(2, '0');
const day = today.getUTCDate().toString().padStart(2, '0');
const partitionKey = `${year}-${month}-${day}`;
const targetDevice = process.env.IoTHuBDeviceId;
console.log(`targetDevice: ${targetDevice}`);
console.log(`partitionKey: ${partitionKey}`);

const cosmosInput = input.cosmosDB({
  databaseName: 'DontKeepWorkingSoHardDad',
  containerName: 'SensorData',
  sqlQuery: `SELECT c.Body FROM c WHERE c.partitionKey = "${targetDevice}-${partitionKey}"`,
  connection: 'CosmosDbConnectionSetting'
});

const cosmosScueduleInput = input.cosmosDB({
  databaseName: 'DontKeepWorkingSoHardDad',
  containerName: 'Schedules',
  sqlQuery: `SELECT * FROM c WHERE c.partitionKey = "${partitionKey}"`,
  connection: 'CosmosDbConnectionSetting'
});

app.timer('timerTrigger', {
  schedule: '0 */5 0-9 * * 1-5',
  runOnStartup: true,
  extraInputs: [cosmosInput, cosmosScueduleInput],
  handler: (myTimer, context) => {
    const sensorStatusHistory = [...context.extraInputs.get(cosmosInput).map((x) => { return { unixTime: x.Body.unixTime * 1000, distance: x.Body.distance }; })].sort((a, b) => a.unixtime - b.unixtime);
    const schedules = [...context.extraInputs.get(cosmosScueduleInput).map((x) => { return { start: x.start * 1000, end: x.end * 1000, subject: x.subject }; })].sort((a, b) => a.start - b.start);

    if (process.env.DEBUG === 1) {
      for (const sensorStatus of sensorStatusHistory) {
        console.log(sensorStatus);
      }
      for (const schedule of schedules) {
        console.log(schedule);
      }
    }

    const lastBreak = getLastStartTimeAndEndTimeOfSensorStatus(sensorStatusHistory, 100, 5, (a, b) => a.distance >= b);
    console.log('lastBreak: ' + JSON.stringify(lastBreak));

    const breakDuration = (process.env.breakDuration ? process.env.breakDuration : 300) * 1000; // 休憩時間(sec)
    const workDuration = (process.env.workDuration ? process.env.workDuration : 1800) * 1000; // 連続作業時間(sec)

    const lastBreakTime = lastBreak !== undefined ? lastBreak.endTime : 0;
    const toNotify = getLocalTimeStringRoundUpSeconds(getNotifyTimeToTakeBreak(schedules, lastBreakTime, workDuration, breakDuration));

    console.log(`toNotify: ${toNotify}`);
    context.log('Timer function processed request.');

    sendC2DMessage(toNotify);
  }
});

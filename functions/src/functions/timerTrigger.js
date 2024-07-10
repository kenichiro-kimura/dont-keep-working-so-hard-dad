const { app, input } = require('@azure/functions');
const { getNotifyTimeToTakeBreak, getLocalTimeStringRoundUpSeconds } = require('../libs/scheduleCheck');
const { getLastStartTimeAndEndTimeOfSensorStatus } = require('../libs/sensorStatus');
const { sendC2DMessage } = require('../libs/sendMessage');

/*
  SensorDataのパーティションキーは、IoTHubのデバイスIDと日付を組み合わせたもの
  例: "sensorId-yyyy-mm-dd"
  Scheduleのパーティションキーは、日付のみ
  例: "yyyy-mm-dd"
  今日の日付を取得し、パーティションキーを生成する
 */
const today = new Date();
const year = today.getUTCFullYear();
const month = (today.getUTCMonth() + 1).toString().padStart(2, '0');
const day = today.getUTCDate().toString().padStart(2, '0');
const partitionKey = `${year}-${month}-${day}`;
const targetDevice = process.env.IoTHuBDeviceId;
console.log(`targetDevice: ${targetDevice}`);
console.log(`partitionKey: ${partitionKey}`);

const databaseName = process.env.databaseName ? process.env.databaseName : 'DontKeepWorkingSoHardDad';
const sensorDataContainerName = process.env.sensorDataContainerName ? process.env.sensorDataContainerName : 'SensorData';
const schedulesContainerName = process.env.schedulesContainerName ? process.env.schedulesContainerName : 'Schedules';

// CosmosDBからセンサーデータとスケジュールを取得する入力バインディング
const cosmosInput = input.cosmosDB({
  databaseName,
  containerName: sensorDataContainerName,
  sqlQuery: `SELECT c.Body FROM c WHERE c.partitionKey = "${targetDevice}-${partitionKey}"`,
  connection: 'CosmosDbConnectionSetting'
});

const cosmosScueduleInput = input.cosmosDB({
  databaseName,
  containerName: schedulesContainerName,
  sqlQuery: `SELECT * FROM c WHERE c.partitionKey = "${partitionKey}"`,
  connection: 'CosmosDbConnectionSetting'
});

// タイマーのトリガーとして設定。起動時間は平日の午前0時から午前9時まで(UTC。日本時間で9時～18時)の5分間隔で実行する
app.timer('timerTrigger', {
  schedule: '0 */5 0-9 * * 1-5',
  runOnStartup: true,
  extraInputs: [cosmosInput, cosmosScueduleInput],
  handler: (myTimer, context) => {
    /*
      センサーデータはIoTHubからCosmos DBへのルーティングで以下のように格納される
      {
        "id": "guid",
        "partitionKey": "sensor-id-yyyy-mm-dd",
        "Properties": {},
        "SystemProperties": {
          "iothub-connection-device-id": "sensor-id",
          "iothub-connection-auth-method": "{\"scope\":\"device\",\"type\":\"sas\",\"issuer\":\"iothub\"}",
          "iothub-connection-auth-generation-id": "xxxxxxxxxxxxxx",
          "iothub-content-type": "application/json;charset=utf-8",
          "iothub-enqueuedtime": "yyyy-mm-ddTHH:MM:SS.xxxxxxxZ",
          "iothub-message-source": "Telemetry"
        },
        "iothub-name": "iot-hub-name",
        "Body": {
          "distance": distance-cm,
          "unixTime": unix-time-sec
        }
      }
      このBodyを取り出し、内部処理用にunixTimeをmsecに変換して、unixTimeの昇順でソートする

      スケジュールの情報も、start/endを内部処理用にmsecに変換して、startの昇順でソートする
    */
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

    const distanceThreshold = process.env.distanceThreshold ? process.env.distanceThreshold : 100;
    const consecutiveTimes = process.env.consecutiveTimes ? process.env.consecutiveTimes : 5;

    // sensorStatusHistoryの中で、最後にdistanceがdistanceThreshold以上になった時間を取得する
    // sensorStatusHistoryのデータと、引き数で渡したdistanceThresholdの比較関数は a.distance >= b 。この場合のaがsensorStatusHistoryの要素、bがdistanceThresholdとなる
    const lastBreak = getLastStartTimeAndEndTimeOfSensorStatus(sensorStatusHistory, distanceThreshold, consecutiveTimes, (a, b) => a.distance >= b);
    console.log('lastBreak: ' + JSON.stringify(lastBreak));

    const breakDuration = (process.env.breakDuration ? process.env.breakDuration : 300) * 1000; // 休憩時間(msec)。環境変数にはsecで登録する。
    const workDuration = (process.env.workDuration ? process.env.workDuration : 1800) * 1000; // 連続作業時間(msec)。環境変数にはsecで登録する。

    const lastBreakTime = lastBreak !== undefined ? lastBreak.endTime : 0;
    const toNotify = getLocalTimeStringRoundUpSeconds(getNotifyTimeToTakeBreak(schedules, lastBreakTime, workDuration, breakDuration));

    console.log(`toNotify: ${toNotify}`);
    context.log('Timer function processed request.');

    // IoTHubのC2Dメッセージに送信
    sendC2DMessage(toNotify);
  }
});

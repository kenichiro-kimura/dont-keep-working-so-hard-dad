const { app, input, HttpResponse } = require('@azure/functions');

/**
 * SensorDataのパーティションキーは、IoTHubのデバイスIDと日付を組み合わせたもの
 *   例: "sensorId-yyyy-mm-dd"
 * Scheduleのパーティションキーは、日付のみ
 *   例: "yyyy-mm-dd"
 * 今日の日付を取得し、パーティションキーを生成する
 */
const today = new Date();
const year = today.getUTCFullYear();
const month = (today.getUTCMonth() + 1).toString().padStart(2, '0');
const day = today.getUTCDate().toString().padStart(2, '0');
const partitionKey = `${year}-${month}-${day}`;
const targetDevice = process.env.IoTHuBDeviceId;

const databaseName = process.env.databaseName ? process.env.databaseName : 'DontKeepWorkingSoHardDad';
const sensorDataContainerName = process.env.sensorDataContainerName ? process.env.sensorDataContainerName : 'SensorData';
const schedulesContainerName = process.env.schedulesContainerName ? process.env.schedulesContainerName : 'Schedules';

/**
 * CosmosDBからセンサーデータとスケジュールを取得する入力バインディング
 */
const cosmosInput = input.cosmosDB({
  databaseName,
  containerName: sensorDataContainerName,
  sqlQuery: `SELECT c.Body FROM c WHERE c.partitionKey = "${targetDevice}-${partitionKey}"`,
  connection: 'CosmosDbConnectionSetting'
});

const cosmosScheduleInput = input.cosmosDB({
  databaseName,
  containerName: schedulesContainerName,
  sqlQuery: `SELECT * FROM c WHERE c.partitionKey = "${partitionKey}"`,
  connection: 'CosmosDbConnectionSetting'
});

app.http('Schedules', {
  methods: ['GET'],
  authLevel: 'function',
  extraInputs: [cosmosScheduleInput],
  handler: async (request, context) => {
    context.log(`Http function processed request for url "${request.url}"`);

    const schedules = [...context.extraInputs.get(cosmosScheduleInput).map((x) => { return { start: x.start, end: x.end, subject: '******' }; })].sort((a, b) => a.start - b.start);
    const response = new HttpResponse({ body: JSON.stringify(schedules) });
    response.headers.set('content-type', 'application/json');
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  }
});

app.http('SensorStatusHistory', {
  methods: ['GET'],
  authLevel: 'function',
  extraInputs: [cosmosInput],
  handler: async (request, context) => {
    context.log(`Http function processed request for url "${request.url}"`);

    const sensorStatusHistory = [...context.extraInputs.get(cosmosInput).map((x) => { return { unixTime: x.Body.unixTime, distance: x.Body.distance }; })].sort((a, b) => a.unixtime - b.unixtime);

    const response = new HttpResponse({ body: JSON.stringify(sensorStatusHistory) });
    response.headers.set('content-type', 'application/json');
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  }
});

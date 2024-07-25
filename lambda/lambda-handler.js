const { getNextBreakTime } = require('dkwshd');
const { DynamoDBDocumentClient, paginateQuery } = require('@aws-sdk/lib-dynamodb');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { sendC2DMessage } = require('./libs/sendMessage');

const marshallOptions = {
  // Whether to automatically convert empty strings, blobs, and sets to `null`.
  convertEmptyValues: false, // false, by default.
  // Whether to remove undefined values while marshalling.
  removeUndefinedValues: true, // false, by default.
  // Whether to convert typeof object to map attribute.
  convertClassInstanceToMap: false // false, by default.
};

const translateConfig = { marshallOptions };
const DynamoDBclient = new DynamoDBClient({
  region: 'ap-northeast-1'
});
const dynamo = DynamoDBDocumentClient.from(DynamoDBclient, translateConfig);

const today = new Date();
const year = today.getUTCFullYear();
const month = (today.getUTCMonth() + 1).toString().padStart(2, '0');
const day = today.getUTCDate().toString().padStart(2, '0');
const partitionKey = `${year}-${month}-${day}`;
const targetDevice = process.env.IotCoreDeviceId ? process.env.IotCoreDeviceId : 'dwshd-sensor1';

const tableName = process.env.tableName ? process.env.tableName : 'dkwshd-sensor-data';

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

  sendC2DMessage('toNotify');
};

/**
 *
 * @return {Array} - センサーステータスの履歴
 */
const getSensorStatusHistory = async () => {
  const paginatorConfig = {
    client: dynamo,
    pageSize: 100
  };
  const paginator = paginateQuery(paginatorConfig, {
    TableName: tableName,
    KeyConditionExpression: 'partitionKey = :PartitionKey',
    ExpressionAttributeValues: {
      ':PartitionKey': `${targetDevice}-${partitionKey}`
    }
  }
  );
  const items = [];
  for await (const page of paginator) {
    items.push(...page.Items);
  }
  return items;
};

/**
 *
 * @return {Array} - スケジュール
 */
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

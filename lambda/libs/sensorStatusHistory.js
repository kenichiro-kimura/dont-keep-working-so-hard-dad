const { DynamoDBDocumentClient, paginateQuery } = require('@aws-sdk/lib-dynamodb');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');

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

/**
 *
 * @return {Array} - センサーステータスの履歴
 */
exports.getSensorStatusHistory = async () => {
  const today = new Date();
  const year = today.getUTCFullYear();
  const month = (today.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = today.getUTCDate().toString().padStart(2, '0');
  const partitionKey = `${year}-${month}-${day}`;
  const targetDevice = process.env.IotCoreDeviceId ? process.env.IotCoreDeviceId : 'dwshd-sensor1';

  const tableName = process.env.tableName ? process.env.tableName : 'dkwshd-sensor-data';

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

const { mqtt5, iot } = require('aws-iot-device-sdk-v2');
const { once } = require('events');

const iotCoreEndpoint = process.env.iotCoreEndpoint;
const targetDevice = process.env.IotCoreDeviceId ? process.env.IotCoreDeviceId : 'dwshd-sensor1';

/**
 * IoT CoreにIoT Hub互換のC2Dメッセージを送信する
 *
 * @param {string} message - 送信するメッセージ
 */

const sendC2DMessage = async (message) => {
  const wsOptions = { region: 'ap-northeast-1' };

  const clientConfig = iot.AwsIotMqtt5ClientConfigBuilder.newWebsocketMqttBuilderWithSigv4Auth(
    iotCoreEndpoint,
    wsOptions
  ).build();
  const client = new mqtt5.Mqtt5Client(clientConfig);
  client.start();
  await once(client, 'connectionSuccess');

  const qos1PublishResult = await client.publish({
    qos: mqtt5.QoS.AtLeastOnce,
    topicName: `devices/${targetDevice}/messages/devicebound/`,
    payload: JSON.stringify(message)
  });
  console.log('QoS 1 Publish result: ' + JSON.stringify(qos1PublishResult));

  client.stop();
  await once(client, 'stopped');
  client.close();
};

exports.sendC2DMessage = sendC2DMessage;

const Client = require('azure-iothub').Client;
const Message = require('azure-iot-common').Message;

/**
 * IoT HubにC2Dメッセージを送信する
 *
 * @param {string} message - 送信するメッセージ
 */
const sendC2DMessage = (message) => {
  const connectionString = process.env.IoTHubConnectionString;
  const targetDevice = process.env.IoTHuBDeviceId;

  const client = Client.fromConnectionString(connectionString);

  client.open(function (err) {
    if (err) {
      console.error('Could not connect: ' + err.message);
    } else {
      console.log('Client connected');
      const sendMessage = new Message(`${message}`);
      console.log('Sending message: ' + sendMessage.getData());
      client.send(targetDevice, sendMessage, printResultFor('send'));
    }
  });
  client.close();
};

/**
 * Helper function to print results in the console
 * @param {*} op - operation name
 */
function printResultFor (op) {
  return function printResult (err, res) {
    if (err) {
      console.log(op + ' error: ' + err.toString());
    } else {
      console.log(op + ' status: ' + res.constructor.name);
    }
  };
}

exports.sendC2DMessage = sendC2DMessage;

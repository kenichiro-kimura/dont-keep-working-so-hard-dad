const { getSensorStatusHistory } = require('./libs/sensorStatusHistory');

module.exports.httpSensorStatusHistory = async (event) => {
  const sensorStatusHistory = await getSensorStatusHistory();
  console.log(JSON.stringify(sensorStatusHistory));
  return {
    statusCode: 200,
    body: JSON.stringify(sensorStatusHistory)
  };
};

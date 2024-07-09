const defaultCompareFunction = (a, b) => a.status === b;

const getStartTimeAndEndTimeOfSensorStatus = (sensorStatusHistory, status, times, _compareFunction) => {
  // sensorStatusHistoryの中でstatusがstatusである状態がtimes回以上続いた部分を探し、その最初のunixtimeと最後のunixtimeを返す
  // times回以上続いた部分がない場合はundefinedを返す
  // 最初に見つかった該当するシーケンスの情報を返す
  const compareFunction = _compareFunction || defaultCompareFunction;
  let count = 0;
  let startTime;
  let endTime;
  let i = 0;
  for (i = 0; i < sensorStatusHistory.length; i++) {
    if (compareFunction(sensorStatusHistory[i], status)) {
      count++;
    } else {
      if (count >= times) {
        startTime = sensorStatusHistory[i - count].unixTime;
        endTime = sensorStatusHistory[i - 1].unixTime;
        break;
      }
      count = 0;
    }
  }
  // startTimeとendTimeとendTimeのインデックスを返す
  return startTime === undefined ? undefined : { startTime, endTime };
};

const getLastStartTimeAndEndTimeOfSensorStatus = (sensorStatusHistory, status, times, compareFunction) => {
  // 最後に見つかった該当するシーケンスの情報を返す
  const result = getStartTimeAndEndTimeOfSensorStatus([...sensorStatusHistory].reverse(), status, times, compareFunction);
  return result === undefined ? undefined : { startTime: result.endTime, endTime: result.startTime };
};

module.exports = { getStartTimeAndEndTimeOfSensorStatus, getLastStartTimeAndEndTimeOfSensorStatus };

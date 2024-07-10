const defaultCompareFunction = (a, b) => a.status === b;

/**
 * sensorStatusHistoryの中でstatusがstatusである状態がtimes回以上続いた部分を探し、その最初のunixtimeと最後のunixtimeを返す
 * times回以上続いた部分がない場合はundefinedを返す
 * 最初に見つかった該当するシーケンスの情報を返す
 *
 * @param {Array} sensorStatusHistory - センサーステータスの履歴
 * @param {string} Any - 検索するステータス
 * @param {number} times - 連続する回数
 * @param {function} [_compareFunction] - 比較関数,デフォルトはa.status === b
 * @return {object} - { startTime: unixTime, endTime: unixTime }
 */
const getStartTimeAndEndTimeOfSensorStatus = (sensorStatusHistory, status, times, _compareFunction) => {
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
  return startTime === undefined ? undefined : { startTime, endTime };
};

/**
 * 最後に見つかった該当するシーケンスの情報を返す
 * sensorStatusHistorを逆順にしてgetStartTimeAndEndTimeOfSensorStatus()を呼び出す
 *
 * @param {Array} sensorStatusHistory - センサーステータスの履歴
 * @param {string} Any - 検索するステータス
 * @param {number} times - 連続する回数
 * @param {function} [_compareFunction] - 比較関数,デフォルトはa.status === b
 * @return {object} - { startTime: unixTime, endTime: unixTime }
 */
const getLastStartTimeAndEndTimeOfSensorStatus = (sensorStatusHistory, status, times, compareFunction) => {
  const result = getStartTimeAndEndTimeOfSensorStatus([...sensorStatusHistory].reverse(), status, times, compareFunction);
  return result === undefined ? undefined : { startTime: result.endTime, endTime: result.startTime };
};

module.exports = { getStartTimeAndEndTimeOfSensorStatus, getLastStartTimeAndEndTimeOfSensorStatus };

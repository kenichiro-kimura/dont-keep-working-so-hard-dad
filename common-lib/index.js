const { getNotifyTimeToTakeBreak } = require('./libs/scheduleCheck');
const { getLocalTimeStringRoundUpSeconds } = require('./libs/timeFunction');
const { getLastStartTimeAndEndTimeOfSensorStatus } = require('./libs/sensorStatus');

/**
 * 次の休憩開始予定時刻を取得する
 *
 * @param {Array} sensorStatusHistory - センサーステータスの履歴
 * @param {Array} schedules - 今日のスケジュール / 例: [ { start: 1720429200000, end: 1720431000000, subject: "ミーティング" } ]
 * @param {number} workDuration - 作業時間 (msec)
 * @param {number} breakDuration - 休憩時間 (msec)
 * @param {number} distanceThreshold - 距離の閾値 (cm)
 * @param {number} consecutiveTimes - 連続回数。距離がdistanceThreshold以上に連続consecutiveTImes回以上続くと休憩中と判断する
 * @return {string} 次の休憩開始時刻
 */
const getNextBreakTime = (sensorStatusHistory, schedules, workDuration, breakDuration, distanceThreshold, consecutiveTimes) => {
  /**
   * sensorStatusHistoryの中で、最後にdistanceがconsecutiveTimes回以上連続でdistanceThreshold以上になった時間を取得する
   * sensorStatusHistoryのデータと、引き数で渡したdistanceThresholdの比較関数は a.distance >= b 。この場合のaがsensorStatusHistoryの要素、bがdistanceThresholdとなる
   */
  const lastBreak = getLastStartTimeAndEndTimeOfSensorStatus(sensorStatusHistory, distanceThreshold, consecutiveTimes, (a, b) => a.distance >= b);

  if (process.env.DEBUG === 1) {
    for (const sensorStatus of sensorStatusHistory) {
      console.log(sensorStatus);
    }
    for (const schedule of schedules) {
      console.log(schedule);
    }
    console.log('lastBreak: ' + JSON.stringify(lastBreak));
  }

  const lastBreakTime = lastBreak !== undefined ? lastBreak.endTime : 0;
  return getLocalTimeStringRoundUpSeconds(getNotifyTimeToTakeBreak(schedules, lastBreakTime, workDuration, breakDuration));
};

module.exports = { getNextBreakTime };

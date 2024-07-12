/**
  * 今日のスケジュールとセンサーの状態から、次に休憩を取る時間を返す。
  *
  * ルール:
  * - 最後の休憩から workDuration 分後に休憩を取る
  * - イベントの間は休憩を取らず、イベント終了後に休憩を取る
  * - イベント終了後まで働くとworkDuration * 2 分以上仕事をすることになる場合は、イベントの前に休みを取る
  * - イベント前に休もうとしたが前のイベントとの間がbreakDurationより短い場合は前のイベントの終了時刻から休憩を取る
  *
  * @param {Array} _schedules - 今日のスケジュール / 例: [ { start: 1720429200000, end: 1720431000000, subject: "ミーティング" } ]
  * @param {number} lastBreak - 今日の最後の休憩時間(unix time, msec)
  * @param {number} workDuration - 連続作業時間(msec)
  * @param {number} breakDuration - 休憩時間(msec)
  * @param {number} _threshold - イベントの長さの閾値(msec),デフォルト4時間
  * @return {number} - 通知する時間 (unix time, msec)
  */

const getNotifyTimeToTakeBreak = (_schedules, lastBreak, workDuration, breakDuration, _threshold) => {
  const threshold = _threshold || 60 * 60 * 4 * 1000;
  const schedules = sortAndRemoveLongEvents(_schedules, threshold);

  /**
   * lastBreakからworkDuration分後をnextBreakの初期候補とする
   */
  let nextBreak = lastBreak + workDuration;
  /**
   * nextBreakが現在時刻よりも前の場合は、現在時刻をnextBreakの候補とする
   */
  if (nextBreak < Date.now()) {
    nextBreak = Date.now();
  }

  /**
   * nextBreakがschedulesのイベントの間にある場合は、イベントの終了時刻をnextBreakの候補とする
   */
  for (let i = 0; i < schedules.length; i++) {
    const start = new Date(schedules[i].start).getTime();
    const end = new Date(schedules[i].end).getTime();
    if (start <= nextBreak && nextBreak <= end) {
      nextBreak = end;
      /**
       * イベント終了時刻まで働くと workDuration * 2以上働いてしまう場合は、イベント前に休憩を取る
       */
      if (nextBreak - lastBreak >= workDuration * 2) {
        nextBreak = start - breakDuration;
        /**
        * nextBreakをずらした結果、前のイベントの最中になった場合は前のイベントの終了時刻を休憩開始時刻とする
        */
        if (i > 0 && nextBreak < schedules[i - 1].end) {
          nextBreak = schedules[i - 1].end;
        }
      }
      break;
    }
  }

  /**
   * nextBreakが現在時刻よりも前の場合は、現在時刻をnextBreakとする
   */

  if (nextBreak < Date.now()) {
    nextBreak = Date.now();
  }

  return nextBreak;
};

/**
 * schedulesを開始時刻の昇順でソートし、thresholdよりも長いイベントを削除する
 * 引き数で受け取ったschedulesを変更しないように、最初にコピーした新しい配列を作成する。それをソートし、イベントを削除して返す
 *
 * @parram {Array} schedules - スケジュール
 * @param {number} threshold - イベントの長さの閾値
 * @return {Array} - ソートされたスケジュール
 */
const sortAndRemoveLongEvents = (schedules, threshold) => {
  const sortedSchedules = [...schedules].sort((a, b) => a.start - b.start);
  return sortedSchedules.filter((schedule) => {
    return schedule.end - schedule.start < threshold;
  });
};

module.exports = { getNotifyTimeToTakeBreak };

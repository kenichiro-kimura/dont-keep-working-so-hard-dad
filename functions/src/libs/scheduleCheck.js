const getNotifyTimeToTakeBreak = (_schedules, lastBreak, workDuration, breakDuration) => {
  /*
      - _schedules: 今日のスケジュール
        - 例: [ { start: 1720429200, end: 1720431000, subject: "CSOL Team1 もくもく会" } ]
      - lastBreak: 今日の最後の休憩時間(unix time)
        - 例: 1720429200
      - workDuration: 連続作業時間
        - 例: 1800 (sec)
      - breakDuration: 休憩時間
        - 例: 300 (sec)

      - return: 通知する時間
        - 例: 1720429200 (unix time)

      今日のスケジュールとセンサーの状態から、次に休憩を取る時間を返す。
      ルール:
      - 最後の休憩から workDuration 分後に休憩を取る
      - schedulesの要素のstartとendの間は休憩を取らない
      - schedulesの要素と要素の間で workDuration 分以上空いている場合はそこで休憩を取る
      - 最後の休憩から workDuration * 1.5 分以上経過していれば、schedulesの要素と要素の間が workDuration 分以上空いていなくても休憩を取る
      - 最後の休憩から workDuration * 2 分以上経過している場合は、イベントの間であっても休憩を取る

      */

  const schedules = sortAndRemoveLongEvents(_schedules, 60 * 60 * 4 * 1000);
  // lastBreakからworkDuration分後をnextBreakの初期候補とする
  let nextBreak = lastBreak + workDuration;
  // nextBreakが現在時刻よりも前の場合は、現在時刻をnextBreakの候補とする
  if (nextBreak < Date.now()) {
    nextBreak = Date.now();
  }

  // nextBreakがschedulesのイベントの間にある場合は、イベントの終了時刻をnextBreakの候補とする
  for (const schedule of schedules) {
    const start = new Date(schedule.start).getTime();
    const end = new Date(schedule.end).getTime();
    if (start <= nextBreak && nextBreak <= end) {
      nextBreak = end;
      break;
    }
  }

  // nextBreak + breakDurationがschedulesのイベントの間にある場合は、イベントの開始時刻 - breakDurationをnextBreakの候補とする
  // ただし、そのイベントの前のイベントの終了時刻がnextBreakよりも早い場合は、そのイベントの終了時刻をnextBreakの候補とする
  let candidate1;
  let candidate2;
  for (let i = 0; i < schedules.length; i++) {
    const start = new Date(schedules[i].start).getTime();
    const end = new Date(schedules[i].end).getTime();
    if (start <= nextBreak + breakDuration && nextBreak + breakDuration <= end) {
      candidate1 = start - breakDuration;
      if (i > 0) {
        const beforeEnd = new Date(schedules[i - 1].end).getTime();
        if (beforeEnd < nextBreak) {
          candidate2 = beforeEnd;
        }
      }
    }
  }
  if (candidate1 !== undefined) {
    if (candidate2 !== undefined) {
      if (candidate2 < Date.now()) {
        nextBreak = candidate2;
      } else {
        nextBreak = candidate1;
      }
    } else {
      nextBreak = candidate1;
    }
  }

  // nextBreakがlastBreakから1.5 * workDuration以上経過している場合は、schedulesのスタート時刻のbreakDuration前をnextBreakの候補とするが
  // ただし、候補の時刻が現在時刻よりも前の場合は現在時刻とする
  // nextBreakがlastBreakから2 * workDuration以上経過している場合は、lastBreak + breakDurationをnextBreakの候補とする
  if (nextBreak - lastBreak > workDuration * 2) {
    nextBreak = lastBreak + breakDuration;
  } else if (nextBreak - lastBreak > workDuration * 1.5) {
    const candidate = lastBreak + workDuration;
    if (candidate < Date.now()) {
      nextBreak = Date.now();
    } else {
      nextBreak = candidate;
    }
  }

  // nextBreakが現在時刻よりも前の場合は、現在時刻をnextBreakとする
  if (nextBreak < Date.now()) {
    nextBreak = Date.now();
  }

  return nextBreak;
};

const sortAndRemoveLongEvents = (schedules, threshold) => {
  // schedulesを開始時刻の昇順でソートし、thresholdよりも長いイベントを削除する
  // 引き数で受け取ったschedulesを変更しないように、最初にコピーした新しい配列を作成する。それをソートし、イベントを削除して返す
  const sortedSchedules = [...schedules].sort((a, b) => a.start - b.start);
  return sortedSchedules.filter((schedule) => {
    return schedule.end - schedule.start < threshold;
  });
};

const getLocalTimeString = (unixTime) => {
  const date = new Date(unixTime);
  date.setSeconds(date.getSeconds() + 60 - date.getSeconds() % 60);
  return date.toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

module.exports = { getNotifyTimeToTakeBreak, getLocalTimeString };

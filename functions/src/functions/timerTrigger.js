const { app } = require('@azure/functions');

app.timer('timerTrigger', {
  schedule: '0 */5 * * * *',
  handler: (myTimer, context) => {
    const schedules = getSchedules();
    const sensorStatusHistory = getSensorsStatusHistory();
    const lastBreak = getLastBreak();
    const breakDuration = 5; // 休憩時間(分)
    const workDuration = 30; // 連続作業時間(分)
    const toNotify = getNotifyTimeToTakeBreak(schedules, sensorStatusHistory, lastBreak, workDuration, breakDuration);
    console.log(toNotify);
    context.log('Timer function processed request.');
  }
});

const getSchedules = () => {
  // 今日のスケジュールを返す
  return [];
};

const getSensorsStatusHistory = () => {
  // 今日のセンサーの状態を返す
  return [];
};

const getLastBreak = () => {
  // 今日の最後の休憩時間を返す
  return '';
};

const getNotifyTimeToTakeBreak = (schedules, sensorStatusHistory, lastBreak, workDuration, breakDuration) => {
  /*
    - schedules: 今日のスケジュール
      - 例: [ { start: '2024-06-05 09:00:00+09', end: '2024-06-05 18:00:00+09' } ]
    - sensorStatusHistory: 今日のセンサーの状態
      - 例: [ { unixtime: 1620000000, status: 'working' }, { unixtime: 1620000000, status: 'break' } ]
    - lastBreak: 今日の最後の休憩時間
      - 例: '2024-06-05 10:20:00+09'
    - workDuration: 連続作業時間
      - 例: 30 (minutes)
    - breakDuration: 休憩時間
      - 例: 5 (minutes)

    - return: 通知する時間
      - 例: '2024-06-05 10:20:00+09'

    今日のスケジュールとセンサーの状態から、次に休憩を取る時間を返す。
    ルール:
    - sensorStatusHistoryのstatusが最後に'break'になってから workDuration 分後に休憩を取る
    - schedulesのイベントのstart~endの間は休憩を取らない
    - schedulesのイベントとイベントの間で workDuration 分以上空いている場合はそこで休憩を取る
    - 最後の休憩から workDuration * 1.5 分以上経過していれば、schedulesのイベントとイベントの間が workDuration 分以上空いていなくても休憩を取る
    - 最後の休憩から workDuration * 2 分以上経過している場合は、イベントの間であっても休憩を取る

    上記のルール全てを満たす時間を返す。満たす時間がない場合はnullを返す。
    */
};
/*
    // sensorStatusHistoryのstatusが最後に'break'になってから workDuration 分後に休憩を取る
    let lastBreak = undefined;
    for (let i = sensorStatusHistory.length - 1; i >= 0; i--) {
        if (sensorStatusHistory[i].status === 'break') {
            lastBreak = sensorStatusHistory[i].unixtime;
            break;
        }
    }

    // もしlastBreakがundefinedなら、今日はまだ休憩を取っていないので、lastBreakは本日の日付の9:00:00とする。

    if (lastBreak === undefined) {
        lastBreak = new Date.UTC().setHours(now.getHours() + 9).setHours(9, 0, 0, 0);
    }

    // 次の休憩開始時刻の初期候補をlastBreak + workDurationとする
    let nextBreak = lastBreak + workDuration * 60 * 1000;

    // nextBreakが現在時刻よりも遅い場合は、nextBreakを現在時刻にする
    if (nextBreak < Date.now()) {
        nextBreak = Date.now();
    }

    // nextBreakがschedulesのイベントの間にある場合は、nextBreakをイベントの終了時刻にする.このイベントをcurrentEventとする
    let currentEvent = undefined;
    for (let i = 0; i < schedules.length; i++) {
        const start = new Date(schedules[i].start).getTime();
        const end = new Date(schedules[i].end).getTime();
        if (start <= nextBreak && nextBreak <= end) {
            nextBreak = end;
            currentEvent = schedules[i];
            break;
        }
    }

    // nextBreakがlastBreakから workDuration * 1.5 分以上経過していれば、nextBreakをcurrentEventの開始時刻 - breakDurationとする.これをcandidate1とする
    // ただし、candidate1がcurrentEventの前のイベント(beforeEvent)の終了時刻よりも早い場合は、nextBreakをbeforeEventのイベントの終了時刻にする.これをcandidate2とする
    // ただし、candidate2が現在時刻よりも遅い場合は、nextBreakをcandidate1にする.そうでないばあいは、nextBreakをcandidate2にする
    let candidate1 = undefined;
    let candidate2 = undefined;
    if (currentEvent !== undefined) {
        const beforeEvent = schedules[schedules.indexOf(currentEvent) - 1];
        if (beforeEvent !== undefined) {
            const beforeEventEnd = new Date(beforeEvent.end).getTime();
            if (beforeEventEnd < nextBreak - breakDuration * 60 * 1000) {
                candidate1 = beforeEventEnd;
                candidate2 = nextBreak - breakDuration * 60 * 1000;
            }
        }
    }

    // もしcandidate1がundefinedなら、nextBreakをcandidate2にする
    if (candidate1 === undefined) {
        nextBreak = candidate2;
    } else {
        // candidate1が現在時刻よりも遅い場合は、nextBreakをcandidate1にする.そうでないばあいは、nextBreakをcandidate2にする
        if (candidate1 < Date.now()) {
            nextBreak = candidate1;
        } else {
            nextBreak = candidate2;
        }
    }

    return nextBreak;
}
*/

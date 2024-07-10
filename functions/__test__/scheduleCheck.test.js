const { getNotifyTimeToTakeBreak } = require('../src/libs/scheduleCheck');

describe('getNotifyTimeToTakeBreak', () => {
  test('スケジュールが無い場合、前回の休憩の終了時刻からworkDuration後の時間を次の休憩時刻として返す', () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-04-01T10:00:00Z').getTime());
    const lastBreak = new Date('2023-04-01T10:00:00Z').getTime();
    const workDuration = 3600 * 1000; // 1 hour
    const breakDuration = 300 * 1000; // 5 minutes
    const expected = lastBreak + workDuration;
    expect(getNotifyTimeToTakeBreak([], lastBreak, workDuration, breakDuration)).toBe(expected);
  });

  test('もし次の休憩時刻候補が現在時刻よりも前の場合は、現在時刻を次の休憩時刻として返す', () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-04-01T12:00:00Z').getTime());
    const lastBreak = new Date('2023-04-01T10:00:00Z').getTime();
    const workDuration = 3600 * 1000; // 1 hour
    const breakDuration = 300 * 1000; // 5 minutes
    const expected = new Date('2023-04-01T12:00:00Z').getTime();
    expect(getNotifyTimeToTakeBreak([], lastBreak, workDuration, breakDuration)).toBe(expected);
  });

  test('前回の休憩の終了時刻からworkDuration後の時間がイベント中でなければ、それを次の休憩時刻として返す', () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-04-01T10:00:00Z').getTime());
    const lastBreak = new Date('2023-04-01T10:00:00Z').getTime();
    const workDuration = 3600 * 1000; // 1 hour
    const breakDuration = 300 * 1000; // 5 minutes
    const schedules = [{ start: lastBreak + 7200, end: lastBreak + 10800, subject: 'Meeting' }];
    const expected = lastBreak + workDuration;
    expect(getNotifyTimeToTakeBreak(schedules, lastBreak, workDuration, breakDuration)).toBe(expected);
  });

  test('次の休憩時間候補がイベント中の場合、そのイベントの終了時刻を次の休憩時刻として返す', () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-04-01T10:00:00Z').getTime());
    const lastBreak = new Date('2023-04-01T10:00:00Z').getTime();
    const workDuration = 1800 * 1000; // 30 minutes
    const breakDuration = 300 * 1000; // 5 minutes
    const schedules = [{ start: lastBreak + workDuration, end: lastBreak + workDuration + breakDuration, subject: 'Meeting' }];
    const expected = schedules[0].end;
    expect(getNotifyTimeToTakeBreak(schedules, lastBreak, workDuration, breakDuration)).toBe(expected);
  });

  test('次の休憩時間候補 + breakDurationがイベント中の場合、そのイベントの開始時刻 - breakDurationを次の休憩時刻として返す', () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-04-01T10:00:00Z').getTime());
    const lastBreak = new Date('2023-04-01T10:00:00Z').getTime();
    const workDuration = 1800 * 1000; // 30 minutes
    const breakDuration = 300 * 1000; // 5 minutes
    const schedules = [{ start: lastBreak + 1800 * 1000 + 300 * 1000, end: lastBreak + 1800 * 1000 + 5 * 600 * 1000, subject: 'Meeting' }];
    const expected = schedules[0].start - breakDuration;
    expect(getNotifyTimeToTakeBreak(schedules, lastBreak, workDuration, breakDuration)).toBe(expected);
  });

  test('次の休憩時間候補をイベントの開始時刻にしたが、それが前のスケジュール中だった場合は前のスケジュールの終了時刻を次の休憩時刻として返す', () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-04-01T10:00:00Z').getTime());
    const lastBreak = new Date('2023-04-01T10:00:00Z').getTime();
    const workDuration = 1800 * 1000; // 30 minutes
    const breakDuration = 300 * 1000; // 5 minutes
    const schedules = [{ start: lastBreak, end: lastBreak + 1800 * 1000, subject: 'Meeting' }, { start: lastBreak + 1800 * 1000 + 300 * 1000, end: lastBreak + 1800 * 1000 + 5 * 600 * 1000, subject: 'Meeting' }];
    const expected = schedules[0].end;
    expect(getNotifyTimeToTakeBreak(schedules, lastBreak, workDuration, breakDuration)).toBe(expected);
  });

  test('休憩時間候補がイベント中だった場合にイベント終了時刻に調整したが、workDurationの2倍以上働くことになる場合は前回終了時刻+workDurationを返す', () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-04-01T10:00:00Z').getTime());
    const lastBreak = new Date('2023-04-01T10:00:00Z').getTime();
    const workDuration = 1800 * 1000; // 30 minutes
    const breakDuration = 300 * 1000; // 5 minutes
    const schedules = [{ start: lastBreak + workDuration, end: lastBreak + workDuration * 2 + 1000, subject: 'Meeting' }];
    const expected = lastBreak + workDuration;
    expect(getNotifyTimeToTakeBreak(schedules, lastBreak, workDuration, breakDuration)).toBe(expected);
  });

  test('長すぎる予定は除外して調整する', () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-04-01T10:00:00Z').getTime());
    const lastBreak = new Date('2023-04-01T10:00:00Z').getTime();
    const workDuration = 3600 * 1000; // 1 hour
    const breakDuration = 300 * 1000; // 5 minutes
    const schedules = [{ start: lastBreak + 1800, end: lastBreak + 1800 * 1000 + 4 * 60 * 60 * 1000, subject: 'Meeting' }];
    const expected = lastBreak + workDuration;
    expect(getNotifyTimeToTakeBreak(schedules, lastBreak, workDuration, breakDuration)).toBe(expected);
  });
});

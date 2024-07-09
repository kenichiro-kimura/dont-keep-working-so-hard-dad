const { getNotifyTimeToTakeBreak } = require('../src/libs/scheduleCheck');

describe('getNotifyTimeToTakeBreak', () => {
  test('returns next break time with no schedules', () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-04-01T10:00:00Z').getTime());
    const lastBreak = new Date('2023-04-01T10:00:00Z').getTime();
    const workDuration = 3600 * 1000; // 1 hour
    const breakDuration = 300 * 1000; // 5 minutes
    const expected = lastBreak + workDuration;
    expect(getNotifyTimeToTakeBreak([], lastBreak, workDuration, breakDuration)).toBe(expected);
  });

  test('returns now as next break time with no schedules and candidate of next break is older than now', () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-04-01T12:00:00Z').getTime());
    const lastBreak = new Date('2023-04-01T10:00:00Z').getTime();
    const workDuration = 3600 * 1000; // 1 hour
    const breakDuration = 300 * 1000; // 5 minutes
    const expected = new Date('2023-04-01T12:00:00Z').getTime();
    expect(getNotifyTimeToTakeBreak([], lastBreak, workDuration, breakDuration)).toBe(expected);
  });

  test('returns next break time with a non-interfering schedule', () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-04-01T10:00:00Z').getTime());
    const lastBreak = new Date('2023-04-01T10:00:00Z').getTime();
    const workDuration = 3600 * 1000; // 1 hour
    const breakDuration = 300 * 1000; // 5 minutes
    const schedules = [{ start: lastBreak + 7200, end: lastBreak + 10800, subject: 'Meeting' }];
    const expected = lastBreak + workDuration;
    expect(getNotifyTimeToTakeBreak(schedules, lastBreak, workDuration, breakDuration)).toBe(expected);
  });

  test('adjusts next break time for an interfering schedule', () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-04-01T10:00:00Z').getTime());
    const lastBreak = new Date('2023-04-01T10:00:00Z').getTime();
    const workDuration = 1800 * 1000; // 30 minutes
    const breakDuration = 300 * 1000; // 5 minutes
    const schedules = [{ start: lastBreak + 1800 * 1000, end: lastBreak + 1800 * 1000 + 5 * 60 * 1000, subject: 'Meeting' }];
    const expected = schedules[0].end;
    expect(getNotifyTimeToTakeBreak(schedules, lastBreak, workDuration, breakDuration)).toBe(expected);
  });

  test('adjusts next break time for an interfering schedule, if candidate is past date, return lastbreak + breakduration', () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-04-01T10:00:00Z').getTime());
    const lastBreak = new Date('2023-04-01T10:00:00Z').getTime();
    const workDuration = 1800 * 1000; // 30 minutes
    const breakDuration = 300 * 1000; // 5 minutes
    const schedules = [{ start: lastBreak, end: lastBreak + 3700 * 1000, subject: 'Meeting' }];
    const expected = lastBreak + breakDuration;
    expect(getNotifyTimeToTakeBreak(schedules, lastBreak, workDuration, breakDuration)).toBe(expected);
  });

  test('remove too long schedule, and returns next break time', () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-04-01T10:00:00Z').getTime());
    const lastBreak = new Date('2023-04-01T10:00:00Z').getTime();
    const workDuration = 3600 * 1000; // 1 hour
    const breakDuration = 300 * 1000; // 5 minutes
    const schedules = [{ start: lastBreak + 1800, end: lastBreak + 1800 * 1000 + 4 * 60 * 60 * 1000, subject: 'Meeting' }];
    const expected = lastBreak + workDuration;
    expect(getNotifyTimeToTakeBreak(schedules, lastBreak, workDuration, breakDuration)).toBe(expected);
  });
});

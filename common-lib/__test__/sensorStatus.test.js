const { getStartTimeAndEndTimeOfSensorStatus, getLastStartTimeAndEndTimeOfSensorStatus } = require('../libs/sensorStatus');

const compareIsEqual = (a, b) => {
  return a.status === b;
};

describe('getStartTimeAndEndTimeOfSensorStatus', () => {
  test('指定されたstatusがtimes回以上続いた場合、最初と最後のunixTimeを返す', () => {
    const sensorStatusHistory = [
      { status: 'WORKING', unixTime: 1000 },
      { status: 'WORKING', unixTime: 1001 },
      { status: 'ONBREAK', unixTime: 1002 },
      { status: 'ONBREAK', unixTime: 1003 },
      { status: 'ONBREAK', unixTime: 1004 },
      { status: 'WORKING', unixTime: 1005 }
    ];
    const status = 'ONBREAK';
    const times = 3;
    const expected = { startTime: 1002, endTime: 1004 };
    const result = getStartTimeAndEndTimeOfSensorStatus(sensorStatusHistory, status, times, compareIsEqual);
    expect(result).toEqual(expected);
  });

  test('指定されたstatusがtimes回以上続かない場合、undefinedを返す', () => {
    const sensorStatusHistory = [
      { status: 'WORKING', unixTime: 1000 },
      { status: 'ONBREAK', unixTime: 1001 },
      { status: 'WORKING', unixTime: 1002 },
      { status: 'ONBREAK', unixTime: 1003 },
      { status: 'WORKING', unixTime: 1004 }
    ];
    const status = 'ONBREAK';
    const times = 2;
    const result = getStartTimeAndEndTimeOfSensorStatus(sensorStatusHistory, status, times, compareIsEqual);
    expect(result).toBeUndefined();
  });

  test('指定されたstatusがtimes回以上続くシーケンスが複数ある場合、最初に見つかったシーケンスの最初と最後のunixTimeを返す', () => {
    const sensorStatusHistory = [
      { status: 'WORKING', unixTime: 1000 },
      { status: 'ONBREAK', unixTime: 1001 },
      { status: 'ONBREAK', unixTime: 1002 },
      { status: 'WORKING', unixTime: 1003 },
      { status: 'ONBREAK', unixTime: 1004 },
      { status: 'ONBREAK', unixTime: 1005 },
      { status: 'ONBREAK', unixTime: 1006 },
      { status: 'WORKING', unixTime: 1007 }
    ];
    const status = 'ONBREAK';
    const times = 2;
    const expected = { startTime: 1001, endTime: 1002 };
    const result = getStartTimeAndEndTimeOfSensorStatus(sensorStatusHistory, status, times, compareIsEqual);
    expect(result).toEqual(expected);
  });
});

describe('getLastStartTimeAndEndTimeOfSensorStatus', () => {
  test('指定されたstatusがtimes回以上続くシーケンスが複数ある場合、最後のシーケンスの最初と最後のunixTimeを返す', () => {
    const sensorStatusHistory = [
      { status: 'WORKING', unixTime: 1000 },
      { status: 'ONBREAK', unixTime: 1001 },
      { status: 'ONBREAK', unixTime: 1002 },
      { status: 'ONBREAK', unixTime: 1003 },
      { status: 'WORKING', unixTime: 1004 },
      { status: 'ONBREAK', unixTime: 1005 },
      { status: 'ONBREAK', unixTime: 1006 },
      { status: 'ONBREAK', unixTime: 1007 },
      { status: 'ONBREAK', unixTime: 1008 },
      { status: 'WORKING', unixTime: 1009 }
    ];
    const status = 'ONBREAK';
    const times = 3;
    const expected = { startTime: 1005, endTime: 1008 };
    const result = getLastStartTimeAndEndTimeOfSensorStatus(sensorStatusHistory, status, times, compareIsEqual);
    expect(result).toEqual(expected);
  });

  test('指定されたstatusを関数で処理した結果が死んであるものがtimes回以上続いた場合、最初と最後のunixTimeを返す', () => {
    const sensorStatusHistory = [
      { status: 10, unixTime: 1000 },
      { status: 10, unixTime: 1001 },
      { status: 120, unixTime: 1002 },
      { status: 110, unixTime: 1003 },
      { status: 100, unixTime: 1004 },
      { status: 90, unixTime: 1005 }
    ];
    const status = 100;
    const times = 3;
    const expected = { startTime: 1002, endTime: 1004 };
    const result = getStartTimeAndEndTimeOfSensorStatus(sensorStatusHistory, status, times, (a, b) => a.status >= b);
    expect(result).toEqual(expected);
  });
});

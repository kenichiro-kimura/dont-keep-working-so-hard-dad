const { getStartTimeAndEndTimeOfSensorStatus, getLastStartTimeAndEndTimeOfSensorStatus } = require('../src/libs/sensorStatus');

const compareIsEqual = (a, b) => {
  return a === b;
};

describe('getStartTimeAndEndTimeOfSensorStatus', () => {
  test('指定されたstatusがtimes回以上続いた場合、最初と最後のunixtimeを返す', () => {
    const sensorStatusHistory = [
      { status: 'WORKING', unixtime: 1000 },
      { status: 'WORKING', unixtime: 1001 },
      { status: 'ONBREAK', unixtime: 1002 },
      { status: 'ONBREAK', unixtime: 1003 },
      { status: 'ONBREAK', unixtime: 1004 },
      { status: 'WORKING', unixtime: 1005 }
    ];
    const status = 'ONBREAK';
    const times = 3;
    const expected = { startTime: 1002, endTime: 1004 };
    const result = getStartTimeAndEndTimeOfSensorStatus(sensorStatusHistory, status, times, compareIsEqual);
    expect(result).toEqual(expected);
  });

  test('指定されたstatusがtimes回以上続かない場合、undefinedを返す', () => {
    const sensorStatusHistory = [
      { status: 'WORKING', unixtime: 1000 },
      { status: 'ONBREAK', unixtime: 1001 },
      { status: 'WORKING', unixtime: 1002 },
      { status: 'ONBREAK', unixtime: 1003 },
      { status: 'WORKING', unixtime: 1004 }
    ];
    const status = 'ONBREAK';
    const times = 2;
    const result = getStartTimeAndEndTimeOfSensorStatus(sensorStatusHistory, status, times, compareIsEqual);
    expect(result).toBeUndefined();
  });

  test('指定されたstatusがtimes回以上続くシーケンスが複数ある場合、最初に見つかったシーケンスの最初と最後のunixtimeを返す', () => {
    const sensorStatusHistory = [
      { status: 'WORKING', unixtime: 1000 },
      { status: 'ONBREAK', unixtime: 1001 },
      { status: 'ONBREAK', unixtime: 1002 },
      { status: 'WORKING', unixtime: 1003 },
      { status: 'ONBREAK', unixtime: 1004 },
      { status: 'ONBREAK', unixtime: 1005 },
      { status: 'ONBREAK', unixtime: 1006 },
      { status: 'WORKING', unixtime: 1007 }
    ];
    const status = 'ONBREAK';
    const times = 2;
    const expected = { startTime: 1001, endTime: 1002 };
    const result = getStartTimeAndEndTimeOfSensorStatus(sensorStatusHistory, status, times, compareIsEqual);
    expect(result).toEqual(expected);
  });
});

describe('getLastStartTimeAndEndTimeOfSensorStatus', () => {
  test('指定されたstatusがtimes回以上続くシーケンスが複数ある場合、最後のシーケンスの最初と最後のunixtimeを返す', () => {
    const sensorStatusHistory = [
      { status: 'WORKING', unixtime: 1000 },
      { status: 'ONBREAK', unixtime: 1001 },
      { status: 'ONBREAK', unixtime: 1002 },
      { status: 'ONBREAK', unixtime: 1003 },
      { status: 'WORKING', unixtime: 1004 },
      { status: 'ONBREAK', unixtime: 1005 },
      { status: 'ONBREAK', unixtime: 1006 },
      { status: 'ONBREAK', unixtime: 1007 },
      { status: 'ONBREAK', unixtime: 1008 },
      { status: 'WORKING', unixtime: 1009 }
    ];
    const status = 'ONBREAK';
    const times = 3;
    const expected = { startTime: 1005, endTime: 1008 };
    const result = getLastStartTimeAndEndTimeOfSensorStatus(sensorStatusHistory, status, times, compareIsEqual);
    expect(result).toEqual(expected);
  });
});

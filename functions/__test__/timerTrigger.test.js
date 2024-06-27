// timerTrigger.test.js
const { getStartTimeAndEndTimeOfSensorStatus,getLastStartTimeAndEndTime } = require('../src/functions/timerTrigger');

const compareIsEqual = (a, b) => {
    return a === b;
}

describe('getStartTimeAndEndTimeOfSensorStatus', () => {
    test('指定されたstatusがtimes回以上続いた場合、最初と最後のunixtimeを返す', () => {
        const sensorStatusHistory = [
            { status: 'OK', unixtime: 1000 },
            { status: 'OK', unixtime: 1001 },
            { status: 'FAIL', unixtime: 1002 },
            { status: 'FAIL', unixtime: 1003 },
            { status: 'FAIL', unixtime: 1004 },
            { status: 'OK', unixtime: 1005 }
        ];
        const status = 'FAIL';
        const times = 3;
        const expected = { startTime: 1002, endTime: 1004 };
        const result = getStartTimeAndEndTimeOfSensorStatus(sensorStatusHistory, status, times, compareIsEqual);
        expect(result).toEqual(expected);
    });

    test('指定されたstatusがtimes回以上続かない場合、undefinedを返す', () => {
        const sensorStatusHistory = [
            { status: 'OK', unixtime: 1000 },
            { status: 'FAIL', unixtime: 1001 },
            { status: 'OK', unixtime: 1002 },
            { status: 'FAIL', unixtime: 1003 },
            { status: 'OK', unixtime: 1004 }
        ];
        const status = 'FAIL';
        const times = 2;
        const result = getStartTimeAndEndTimeOfSensorStatus(sensorStatusHistory, status, times, compareIsEqual);
        expect(result).toBeUndefined();
    });
});

test('指定されたstatusがtimes回以上続いた場合、最初に見つかったシーケンスの最初と最後のunixtimeを返す', () => {
    const sensorStatusHistory = [
        { status: 'OK', unixtime: 1000 },
        { status: 'FAIL', unixtime: 1001 },
        { status: 'FAIL', unixtime: 1002 },
        { status: 'OK', unixtime: 1003 },
        { status: 'FAIL', unixtime: 1004 },
        { status: 'FAIL', unixtime: 1005 },
        { status: 'FAIL', unixtime: 1006 },
        { status: 'OK', unixtime: 1007 }
    ];
    const status = 'FAIL';
    const times = 2;
    const expected = { startTime: 1001, endTime: 1002 };
    const result = getStartTimeAndEndTimeOfSensorStatus(sensorStatusHistory, status, times, compareIsEqual);
    expect(result).toEqual(expected);
});

test('指定されたstatusがtimes回以上続くシーケンスがある場合、そのシーケンスの最初と最後のunixtimeを返す', () => {
    const sensorStatusHistory = [
        { status: 'OK', unixtime: 1000 },
        { status: 'FAIL', unixtime: 1001 },
        { status: 'FAIL', unixtime: 1002 },
        { status: 'FAIL', unixtime: 1003 },
        { status: 'OK', unixtime: 1004 },
        { status: 'FAIL', unixtime: 1005 },
        { status: 'FAIL', unixtime: 1006 },
        { status: 'FAIL', unixtime: 1007 },
        { status: 'FAIL', unixtime: 1008 },
        { status: 'OK', unixtime: 1009 }
    ];
    const status = 'FAIL';
    const times = 3;
    const expected = { startTime: 1001, endTime: 1003 };
    const result = getStartTimeAndEndTimeOfSensorStatus(sensorStatusHistory, status, times, compareIsEqual);
    expect(result).toEqual(expected);
});

test('指定されたstatusがtimes回以上続くシーケンスが複数ある場合、最後のシーケンスの最初と最後のunixtimeを返す', () => {
    const sensorStatusHistory = [
        { status: 'OK', unixtime: 1000 },
        { status: 'FAIL', unixtime: 1001 },
        { status: 'FAIL', unixtime: 1002 },
        { status: 'FAIL', unixtime: 1003 },
        { status: 'OK', unixtime: 1004 },
        { status: 'FAIL', unixtime: 1005 },
        { status: 'FAIL', unixtime: 1006 },
        { status: 'FAIL', unixtime: 1007 },
        { status: 'FAIL', unixtime: 1008 },
        { status: 'OK', unixtime: 1009 }
    ];
    const status = 'FAIL';
    const times = 3;
    const expected = { startTime: 1005, endTime: 1008 };
    const result = getLastStartTimeAndEndTime(sensorStatusHistory, status, times, compareIsEqual);
    expect(result).toEqual(expected);
});

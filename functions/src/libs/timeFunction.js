/*
 unixTime(msec)の時刻の秒を切り上げ、指定されたlocaleとtimeZoneで文字列に変換して返す

    @param {number} unixTime - 時刻(unix time, msec)
    @param {string} [_locale] - ロケール,デフォルトはja-JP
    @param {string} [_timeZone] - タイムゾーン,デフォルトはAsia/Tokyo
    @return {string} - 時刻の文字列
*/
const getLocalTimeStringRoundUpSeconds = (unixTime, _locale, _timeZone) => {
  const date = new Date(unixTime);
  const locale = _locale || 'ja-JP';
  const targetTimeZone = _timeZone || 'Asia/Tokyo';
  date.setSeconds(date.getSeconds() + 60 - date.getSeconds() % 60);
  return date.toLocaleString(locale, {
    timeZone: targetTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

module.exports = { getLocalTimeStringRoundUpSeconds };

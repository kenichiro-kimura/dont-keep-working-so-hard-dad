function dateString(unixTimeInMs) {
    return (new Date(unixTimeInMs)).toLocaleString('ja-JP', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });

}

function getStartTime(unixTimeInMs) {
    const date = new Date(unixTimeInMs);
    const hour = parseInt(date.getHours());
    const minutes = parseInt(date.getMinutes()) / 60;
    return hour + minutes;
}

async function fetchData(url) {
    const response = await fetch(url);
    return response.json();
}

async function schedule() {
    var schedules = await fetchData('http://localhost:7071/api/Schedules');
    console.log(schedules);
    var tasks = [...schedules.map(
        (x) => {
            return {
                startTimeString: dateString(x.start * 1000),
                endTimeString: dateString(x.end * 1000),
                startTime: getStartTime(x.start * 1000),
                duration: (x.end - x.start) / 60 / 60,
                column: 0,
                title: x.subject
            }
        })];
    console.log(tasks);
    $("#skeduler-container").skeduler({
        headers: ["Specialist 1"],
        tasks,
        cardTemplate: '<div><div>${title}</div></div>'
    });

    for (var i = 0; i < tasks.length; i++) {
        var li = document.createElement('li');
        li.textContent = "スケジュール" + (i + 1) + ':' + tasks[i].startTimeString + '～' + tasks[i].endTimeString;
        document.getElementById('schedules').appendChild(li);
    }
}

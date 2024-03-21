// function in case of most days
function normalDay(time) {
    let dayInc = 0;
    if (time.getDay() == 5 || time.getDay() == 6) {
        return;
    }

    dayInc = time.getHours() < 7 ? 0:1;

    const nextDay = new Date(time.getFullYear(), 
        time.getMonth(), time.getDate() + dayInc, 7);
    return nextDay;
}

// function in case the day is friday
function friday(time) {
    let dayInc;
    if (time.getDay() != 5) {
        return;
    }

    dayInc = time.getHours() < 9 ? 0:1;

    const nextDay = new Date(time.getFullYear(), 
        time.getMonth(), time.getDate() + dayInc, 9);
    return nextDay;
}

// function in case the day is saturday
function saturday(time) {
    let dayInc;
    if (time.getDay() != 5) {
        return;
    }

    dayInc = time.getHours() < 11 ? 0:1;

    const nextDay = new Date(time.getFullYear(), 
        time.getMonth(), time.getDate() + dayInc, 11);
    return nextDay;
}

// constant variables for no. of seconds in a day
// or day plus 2 hours
const day = 86400 * 1_000;
const dayPlus2Hours = (86400 + 3600) * 1_000;
let difference;

// find the difference between now and the next 
// time the SU opens
function findCurrentDifference() {
    const now = new Date();
    const currentDay = now.getDay();
    let tmrOpening;

    switch (currentDay) {
        case 5:
            tmrOpening = friday(now);
            break;

        case 6:
            tmrOpening = saturday(now);
            break;

        default:
            tmrOpening = normalDay(now);
            break;
    }

    difference = tmrOpening.getTime() - now.getTime();

    return difference;
}

// send message and then recurse the function with 
// a delay
async function sendMessage(client, schedule) {
    let sec, min, hour;
    const date = new Date();
    const channel = await client
        .channels
        .cache
        .get('763248812558778378');
    channel.send(schedule);

    if (date.getDay() == 5 || date.getDay() == 6) {
        difference = dayPlus2Hours;
    } else {
        difference = day;
    }

    setTimeout(sendMessage, difference, client, schedule);

    sec = (difference / 1000) % 60;
    min = (difference / 60000) % 60;
    hour = difference / (3600 * 6000);
    console.log(`Next Schedule Update in ${hour.toPrecision(3)} hrs ${min.toFixed(0)} min and ${sec.toFixed(0)} sec ...`);
}

// list of exports
module.exports = {
    findCurrentDifference,
    sendMessage
}
function normalDay(time) {
    let dayInc = 0;
    if (time.getDay() == 5 || time.getDay() == 6) {
        return;
    }

    dayInc = time.getHours() < 7 ? 0:1;

    const nextDay = new Date(time.getFullYear(), time.getMonth(), time.getDate() + dayInc, 7);
    return nextDay;
}

function friday(time) {
    let dayInc;
    if (time.getDay() != 5) {
        return;
    }

    dayInc = time.getHours() < 9 ? 0:1;

    const nextDay = new Date(time.getFullYear(), time.getMonth(), time.getDate() + dayInc, 9);
    return nextDay;
}

function saturday(time) {
    let dayInc;
    if (time.getDay() != 5) {
        return;
    }

    dayInc = time.getHours() < 11 ? 0:1;

    const nextDay = new Date(time.getFullYear(), time.getMonth(), time.getDate() + dayInc, 11);
    return nextDay;
}

const day = 86400 * 1_000;
const dayPlus2Hours = (86400 + 3600) * 1_000;
let difference;

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

async function sendMessage(client, schedule) {
    const date = new Date();
    const channel = await client.channels.cache.get('763248812558778378');
    channel.send(schedule);

    if (date.getDay() == 5 || date.getDay() == 6) {
        difference = dayPlus2Hours;
    } else {
        difference = day;
    }

    setTimeout(sendMessage, difference, client, schedule);
}

module.exports = {
    findCurrentDifference,
    sendMessage
}
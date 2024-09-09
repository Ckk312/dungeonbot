const { authorize, reauth } = require('./googlecalendar/googleapi.js');
const { listEvents } = require('./googlecalendar/utility/listevents.js');
const { createMessage } = require('./createmessage.js');

// function in case of most days
function weekDay(time) {
    let dayInc, hour;
    if (time.getDay() == 6 || time.getDay() == 0) {
        return;
    }

    if (time.getHours() < 7) {
        dayInc = 0;
        hour = 7;
    } else {
        dayInc = 1;
        hour = time.getDay() == 5 ? 9 : 7;
    }

    const nextDay = new Date(time.getFullYear(),
        time.getMonth(), time.getDate() + dayInc, hour);
    return nextDay;
}

// function in case the day is friday
function saturday(time) {
    let dayInc, hour;
    if (time.getDay() != 6) {
        return;
    }

    if (time.getHours() < 9) {
        dayInc = 0;
        hour = 9;
    } else {
        dayInc = 1;
        hour = 11;
    }

    const nextDay = new Date(time.getFullYear(),
        time.getMonth(), time.getDate() + dayInc, hour);
    return nextDay;
}

// function in case the day is saturday
function sunday(time) {
    let dayInc, hour;
    if (time.getDay() != 0) {
        return;
    }

    if (time.getHours() < 11) {
        dayInc = 0;
        hour = 11;
    } else {
        dayInc = 1;
        hour = 7;
    }

    const nextDay = new Date(time.getFullYear(),
        time.getMonth(), time.getDate() + dayInc, hour);
    return nextDay;
}

// constant variables for no. of seconds in a day
// or day plus 2 hours
const day = 86400 * 1_000;
const dayPlus2Hours = (86400 + 7200) * 1_000;
const dayMinus4Hours = (86400 - 14400) * 1_000;
let difference;

// find the difference between now and the next
// time the SU opens
function findCurrentDifference() {
    const now = new Date();
    const currentDay = now.getDay();
    let tmrOpening;

    switch (currentDay) {
        case 0:
            tmrOpening = sunday(now);
            break;

        case 6:
            tmrOpening = saturday(now);
            break;

        default:
            tmrOpening = weekDay(now);
            break;
    }

    return tmrOpening;
}

async function msgLoop(client, schedule) {
    if (!schedule) {
        return;
    }

    const channel = await client
        .channels
        .cache
        .get('1144375225488769069');
    channel.send(schedule);
}

/**
 * Sends message and recurses with delay
 *
 * @param {*} client Discord client instance
 * @param { string } schedule Message string
 */
async function sendMessage(client, schedule) {
    msgLoop(client, schedule);

    const value = true;
    while (value) {
        const date = new Date();
        if (date.getDay() == 5 || date.getDay() == 6) {
            difference = dayPlus2Hours;
        }
        else if (date.getDay() == 0) {
            difference = dayMinus4Hours;
        }
        else {
            difference = day;
        }

        const info = {
            auth: await authorize(),
            calendarId: '96b429f6e1f87660f0d72044faae4b65eba175e1edef273abc974b331a8c425e@group.calendar.google.com',
            date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        };

        let newMessage = null;
        try {
            newMessage = createMessage(await listEvents(info));
        } catch (e) {
            console.error(e);
            await reauth();
        }

        await new Promise((resolve) => setTimeout(resolve, difference)).then(() => msgLoop(client, newMessage));

        // print next function call
        const sec = (difference / 1000) % 60;
        const min = (difference / 60000) % 60;
        const hour = difference / (3600000);
        console.log(`Next Schedule Update in ${Math.floor(hour)} hrs ${Math.floor(min)} min and ${Math.round(sec)} sec ...`);
    }
}

// list of exports
module.exports = {
    findCurrentDifference,
    sendMessage,
};
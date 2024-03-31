const { google } = require('googleapis');

/**
 * Lists the next 10 events on calendar.
 *
 * @param { Object } calendarInfo Object containing auth and calendarId and date
 */
async function listEvents(calendarInfo) {
    const calendar = google.calendar({ version: 'v3', auth: calendarInfo.auth });
    const timeStart = new Date(calendarInfo.date);
    const timeEnd = new Date(timeStart.getFullYear(), timeStart.getMonth(), timeStart.getDate(), 23, 59, 59);
    const res = await calendar.events.list({
      calendarId : calendarInfo.calendarId,
      timeMin: timeStart,
      timeMax: timeEnd,
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return res.data.items;
}

module.exports = {
    listEvents,
};
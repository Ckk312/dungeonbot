const { google } = require('googleapis');

/**
 * Lists the next 10 events on calendar.
 * 
 * @param { Object } calendarInfo Object containing auth and calendarId and date
 */
async function listEvents(calendarInfo) {
    const calendar = google.calendar({ version: 'v3', auth: calendarInfo.auth, });
    let timeStart = new Date(calendarInfo.date);
    let timeEnd = new Date(timeStart.getFullYear(), timeStart.getMonth(), timeStart.getDate(), 23, 59, 59);
    const res = await calendar.events.list({
      calendarId : '96b429f6e1f87660f0d72044faae4b65eba175e1edef273abc974b331a8c425e@group.calendar.google.com',
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
}
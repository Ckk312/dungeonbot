const { google } = require('googleapis');

/**
 * Create a Google Calendar Event
 *
 * @param { Object } info Object that must have auth, calendarId, and eventResource
 * (object created with gCal information)
 * @returns { Object } Event Details
 */
async function createEvent(info) {
    // create calendar instance
    const calendar = google.calendar({ version: 'v3', auth: info.auth });
    // insert event into calendar
    return await calendar.events.insert({
        auth: info.auth,
        calendarId: info.calendarId,
        resource: info.eventResource,
    }).catch(console.error);
}

module.exports = createEvent;
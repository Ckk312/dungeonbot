const { google } = require('googleapis');

/**
 * Update a Google Calendar Event
 *
 * @param { Object } info Object that must have auth, calendarId, and resource
 * (object created with gCal information)
 * @returns { Object } Event Details
 */
async function updateEvent(info) {
    // create calendar instance
    const calendar = google.calendar({ version: 'v3', auth: info.auth });
    // insert event into calendar
    return calendar.events.update(info).catch(console.error);
}

module.exports = updateEvent;
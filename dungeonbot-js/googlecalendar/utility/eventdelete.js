const { google } = require('googleapis');

/**
 * Delete a Google Calendar Event
 *
 * @param { Object } info Object that must have auth, calendarId, and eventResource
 * (object created with gCal information)
 * @returns { void } Object of event
 */
async function deleteEvent(info) {
    // create calendar instance
    const calendar = google.calendar({ version: 'v3', auth: info.auth });
    // insert event into calendar
    return calendar.events.delete(info, function(err) {
        if (err) {
            console.error(err);
        }
    });
}

module.exports = deleteEvent;
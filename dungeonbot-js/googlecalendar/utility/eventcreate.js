const { google } = require('googleapis');

/**
 * Create a Google Calendar Event
 *
 * @param { Object } info Object that must have auth, calendarId, and eventResource
 * (object created with gCal information)
 */
async function createEvent(info) {
    // create calendar instance
    const calendar = google.calendar({ version: 'v3', auth: info.auth });
    // insert event into calendar
    calendar.events.insert({
        auth: info.auth,
        calendarId: info.calendarId,
        resource: info.eventResource,
    }, function(err, event) {
        if (err) {
            throw new Error('There was an error contacting the Calendar service: ' + err);
        }
        console.log('Event created: %s', event.htmlLink);
    });
    return true;
}

exports.createEvent = createEvent;
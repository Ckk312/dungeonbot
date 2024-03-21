// eslint-disable-next-line no-unused-vars
const match = require('./eventbuilder.js');
const { google } = require('googleapis');

/**
 * Create a Google Calendar Event
 *
 * @param { google.auth.OAuth2 } auth
 * @param { match.gCalEvent } eventResource
 */
async function createEvent(info) {
    console.log(info.auth);
    const calendar = google.calendar({ version: 'v3', auth: info.auth });
    calendar.events.insert({
        auth: info.auth,
        calendarId: '309c74357dd09db96919f94f3f07dae0ae1a331bbf00fd32a1cb7b3e81acb9e8@group.calendar.google.com',
        resource: info.eventResource,
    }, function(err, event) {
        if (err) {
            console.log('There was an error contacting the Calendar service: ' + err);
            return;
        }
        console.log('Event created: %s', event.htmlLink);
    });
}

exports.createEvent = createEvent;
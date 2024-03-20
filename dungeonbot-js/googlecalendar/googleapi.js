const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), './googlecalendar/credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Lists the next 10 events on calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */

async function listEvents(auth) {
  const calendar = google.calendar({version: 'v3', auth});
  let timeStart = new Date();
  let timeEnd, ret;
  switch (timeStart.getDay()) {
    case 5:
      timeStart = new Date(timeStart.getFullYear(), timeStart.getMonth(), timeStart.getDate(), 9);
      timeEnd = new Date(timeStart.getFullYear(), timeStart.getMonth(), timeStart.getDate(), 23, 59, 59);
      break;
    case 6:
      timeStart = new Date(timeStart.getFullYear(), timeStart.getMonth(), timeStart.getDate(), 11);
      timeEnd = new Date(timeStart.getFullYear(), timeStart.getMonth(), timeStart.getDate(), 21, 59, 59);
      break;
    default:
      timeStart = new Date(timeStart.getFullYear(), timeStart.getMonth(), timeStart.getDate(), 7);
      timeEnd = new Date(timeStart.getFullYear(), timeStart.getMonth(), timeStart.getDate(), 23, 59, 59);
      break;
  }
  const res = await calendar.events.list({
    calendarId : '309c74357dd09db96919f94f3f07dae0ae1a331bbf00fd32a1cb7b3e81acb9e8@group.calendar.google.com',
    timeMin: timeStart,
    timeMax: timeEnd,
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime'
  });
  const events = res.data.items;
  if (!events || events.length === 0) {
    console.log('No upcoming events found.');
    return;
  } else {
    ret = events.map((event) => {
      let string = `Reservation \"${event.summary()}\"
      From ${event.start.dateTime()}
      To ${event.end.dateTime()}`;
      return string;
    });
    console.log(`Upcoming Events for ${timeStart.toDateString()} documented.`);

    return ret;
  }
}

module.exports = {
    activate() {
        authorize();
    },
    listEvents
};
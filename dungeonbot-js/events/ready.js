const { Events } = require('discord.js');
const { authorize, reauth } = require('../googlecalendar/googleapi.js');
const { listEvents } = require('../googlecalendar/utility/listevents.js');
const { createMessage } = require('../createmessage.js');
const reminderSched = require('../susched.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        const today = new Date();
        console.log(`Ready! Logged in as ${client.user.tag} \n ${today}`);

        // start recursive daily function
        const date = reminderSched.findCurrentDifference();
        const msDiff = date.getTime() - today.getTime();

        setTimeout(await reminderSched.sendMessage, msDiff, client);

        // print next function call
        const sec = (msDiff / 1000) % 60;
        const min = (msDiff / 60000) % 60;
        const hour = msDiff / (3600000);
        console.log(`Next Schedule Update in ${Math.floor(hour)} hrs ${Math.floor(min)} min and ${Math.round(sec)} sec ...`);
    },
};
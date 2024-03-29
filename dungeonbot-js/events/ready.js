const { Events } = require('discord.js');
const { authorize } = require('../googlecalendar/googleapi.js');
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
        const eventList = await authorize().then((a) => {
            return {
                auth: a,
                calendarId: '96b429f6e1f87660f0d72044faae4b65eba175e1edef273abc974b331a8c425e@group.calendar.google.com',
                date: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
            };
        }).then(listEvents).catch(console.error());

        console.log(eventList);

        setTimeout(reminderSched.sendMessage, msDiff, client, createMessage(eventList));

        // print next function call
        const sec = (msDiff / 1000) % 60;
        const min = (msDiff / 60000) % 60;
        const hour = msDiff / (3600000);
        console.log(`Next Schedule Update in ${hour.toPrecision(3)} hrs ${min.toFixed(0)} min and ${sec.toFixed(0)} sec.`);
    },
};
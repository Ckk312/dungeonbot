const { Events } = require('discord.js');
const { findCurrentDifference, scheduler } = require('../susched.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        const today = new Date();
        console.log(`Ready! Logged in as ${client.user.tag} \n ${today}`);

        // start recursive daily function

        const date = findCurrentDifference();
        const msDiff = date.getTime() - today.getTime();
        const auth = await authorize();
        const eventInfo = {
            auth: auth,
            calendarId: '96b429f6e1f87660f0d72044faae4b65eba175e1edef273abc974b331a8c425e@group.calendar.google.com',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        };
        try {
            eventList = await listEvents(eventInfo);
        } catch (e) {
            console.error(e);
            eventInfo.auth = await reauth();
        }

        setTimeout(await scheduler, msDiff, client);

        // print next function call
        const sec = (msDiff / 1000) % 60;
        const min = (msDiff / 60000) % 60;
        const hour = msDiff / (3600000);
        console.log(`Next Schedule Update in ${Math.floor(hour)} hrs ${Math.floor(min)} min and ${Math.round(sec)} sec ...`);
    },
};
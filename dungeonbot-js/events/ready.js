const { Events } = require('discord.js');
const reminderSched = require('../susched.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        let msDiff, hour, min, sec;
        console.log(`Ready! Logged in as ${client.user.tag}`);

        msDiff = reminderSched.findCurrentDifference();
        setTimeout(reminderSched.sendMessage, msDiff, client, 'WAKE UP <@115690432351961095>. THE DUNGEON IS OPEN');

        sec = (msDiff / 1000) % 60;
        min = (msDiff / 60000) % 60;
        hour = msDiff / (3600000);
        console.log(`Next Schedule Update in ${hour.toPrecision(3)} hrs ${min.toFixed(0)} min and ${sec.toFixed(0)} sec.`);
    }
}
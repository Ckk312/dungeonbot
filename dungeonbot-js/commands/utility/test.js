const { SlashCommandBuilder } = require('discord.js');
const { createMessage } = require('../../createmessage.js');
const { authorize } = require('../../googlecalendar/googleapi.js');
const { listEvents } = require('../../googlecalendar/utility/listevents.js');

const data = new SlashCommandBuilder()
    .setName('test')
    .setDescription('Command to test experimental new features');

async function execute(interaction) {
    try {
        interaction.reply(createMessage(await authorize().then((a) => {
            return {
                auth: a,
                calendarId: '96b429f6e1f87660f0d72044faae4b65eba175e1edef273abc974b331a8c425e@group.calendar.google.com',
                date: new Date(),
            };
        }).then(listEvents).catch(console.error())));
    } catch (e) {
        console.log('Empty list prob.' + e);
    }
}

module.exports = {
    data,
    execute,
};
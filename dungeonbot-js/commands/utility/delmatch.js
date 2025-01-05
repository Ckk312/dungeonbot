const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const deleteEvent = require('../../googlecalendar/utility/eventdelete.js');
const { authorize } = require('../../googlecalendar/googleapi.js');
const loadTitleAssets = require('../assets/loadassets.js');
const MatchTag = require('../../models');


const data = new SlashCommandBuilder()
    .setName('deletematch')
    .setDescription('Deletes a match')
    .addStringOption(option =>
        option
            .setName('match-id')
            .setDescription('The ID of the match')
            .setRequired(true));

async function execute(interaction) {
    const response = await interaction.deferReply({ ephemeral: true });

    const eventModel = await MatchTag.findByPk(interaction.options.getString('match-id'));
    const eventInfo = eventModel.toJSON();

    if (!eventInfo) {
        await interaction.editReply({ content: 'Event with this ID could not be found.' });
    } else {
        const assets = await loadTitleAssets(eventInfo.game);
        // buttons
        const confirm = new ButtonBuilder()
            .setCustomId('confirm')
            .setLabel('Confirm')
            .setStyle(ButtonStyle.Danger);

        const deny = new ButtonBuilder()
            .setCustomId('deny')
            .setLabel('Deny')
            .setStyle(ButtonStyle.Primary);

        const confirmationRow = new ActionRowBuilder()
            .addComponents(confirm, deny);

        // respond and adapt based on actual input
        const date = new Date(eventInfo.date);
        await interaction.editReply({
            content: `**Is this correct?**
            \n\`\`\`Title: ${eventInfo.title}
            \nGame: ${assets.fullName}
            \nDate/Time: ${date.toString()} <t:${date.getTime() / 1000}:F>
            \nID: ${eventInfo.matchId}\`\`\``,
            components: [confirmationRow],
        });

        // wait for message button and react based on input
        let confirmation;
        try {
            confirmation = await response.awaitMessageComponent({ filter: null, time: 120_000 });
        } catch (e) {
            console.log(e);
            await interaction.editReply({
                content: 'Confirm action timeout.\nPlease re-enter the command to continue.',
                components: [],
                ephemeral: true,
            });
            return;
        }

        // confirm button case
        if (confirmation?.customId === 'confirm') {
            // google api
            const gCalEventInfo = {
                auth: await authorize().catch(console.error),
                calendarId: '309c74357dd09db96919f94f3f07dae0ae1a331bbf00fd32a1cb7b3e81acb9e8@group.calendar.google.com',
                eventId: eventInfo.eventId1,
            };

            await deleteEvent(gCalEventInfo);

            gCalEventInfo.calendarId = assets.calendar;
            gCalEventInfo.eventId = eventInfo.eventId2;

            await deleteEvent(gCalEventInfo);

            // database
            eventModel.destroy();

            confirmation.update({
                content: 'Event has been deleted.',
                components: [],
                ephemeral: true,
            });
        } else {
            await confirmation.update({
                content: 'Command cancelled.\nPlease re-enter the command to continue.',
                components: [],
                ephemeral: true,
            });
        }
    }
}

module.exports = {
    data,
    execute,
};
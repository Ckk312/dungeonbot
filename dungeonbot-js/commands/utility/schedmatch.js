const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { EventBuilder } = require('../../googlecalendar/utility/eventbuilder.js');
const { createEvent } = require('../../googlecalendar/utility/eventcreate.js');
const { authorize } = require('../../googlecalendar/googleapi.js');

// slash command
const data = new SlashCommandBuilder()
    .setName('schedmatch')
    .setDescription('Schedule an upcoming Match')
    .addStringOption(option =>
        option
            .setName('game')
            .setDescription('The game for which this match is for')
            .setRequired(true)
            .addChoices(
                { name: 'Apex Legends', value: 'al' },
                { name: 'Call of Duty', value: 'cod' },
                { name: 'Counterstrike', value: 'cs' },
                { name: 'League of Legends', value: 'lol' },
                { name: 'Overwatch', value: 'ow' },
                { name: 'Rainbow Six: Siege', value: 'r6' },
                { name: 'Rocket League', value: 'rl' },
                { name: 'Splatoon', value: 'spl' },
                { name: 'Super Smash Bros.', value: 'ssb' },
                { name: 'Valorant', value: 'val' },
            ))
    .addIntegerOption(option =>
        option
            .setName('month')
            .setDescription('Month of event')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(12))
    .addIntegerOption(option =>
        option
            .setName('day')
            .setDescription('Number day of the month')
            .setRequired(true)
            .setMinValue(0)
            .setMaxValue(31))
    .addIntegerOption(option =>
        option
            .setName('hour')
            .setDescription('hour based on 12 hour system')
            .setRequired(true)
            .setMinValue(0)
            .setMaxValue(12))
    .addIntegerOption(option =>
        option
            .setName('minute')
            .setDescription('set minute of hour')
            .setRequired(true)
            .setMinValue(0)
            .setMaxValue(59))
    .addStringOption(option =>
        option
            .setName('am-pm')
            .setDescription('true for pm and false for am')
            .setRequired(true)
            .addChoices(
                { name: 'AM', value: 'am' },
                { name: 'PM', value: 'pm' },
            ))
    .addStringOption(option =>
        option
            .setName('title')
            .setDescription('Title of Event')
            .setRequired(true))
    .addStringOption(option =>
        option
            .setName('event-league')
            .setDescription('Tournament or League of Match')
            .setRequired(true))
    .addStringOption(option =>
        option
            .setName('opponent')
            .setDescription('Name of College/University and Team Name')
            .setRequired(true))
    .addStringOption(option =>
        option
            .setName('bracket-link')
            .setDescription('enter the link to the bracket')
            .setRequired(true))
    .addStringOption(option =>
        option
            .setName('stream-link')
            .setDescription('Enter the link for anyone who plans on streaming the match'));

// execute function
async function execute(interaction) {
    // set the hour based on am or pm
    let hour = interaction.options.getInteger('hour');
    if (interaction.options.getString('am-pm') === 'pm') {
        hour += 12;
    }

    // take the current date to find the year and construct a new date with given information
    const date = new Date();

    const dateStr = new Date(date.getFullYear(), (interaction.options.getInteger('month') - 1), interaction.options.getInteger('day'),
        hour, interaction.options.getInteger('minute'));

    // use the date and rest of information to construct matchInfo object
    const matchInfo = {
        date: dateStr,
        game: interaction.options.getString('game'),
        title: interaction.options.getString('title'),
        eventLeague: interaction.options.getString('event-league'),
        opponent: interaction.options.getString('opponent'),
        bracket: interaction.options.getString('bracket-link'),
        stream: interaction.options.getString('stream-link'),
    };

    // string to reply with and it's editions
    let replyStr = `\`\`\`yaml\nDate/Time: ${dateStr.toString()} <t:${dateStr.getTime()}:F>\nTitle: ${matchInfo.title}
        \nEvent/League and Description: ${matchInfo.eventLeague}\nOpponent: ${matchInfo.opponent}\nBracket: ${matchInfo.bracket}\nStream:`;

    if (matchInfo.stream) {
        replyStr += ` ${matchInfo.stream}\n`;
    }

    replyStr += '```';

    // button configuration
    const confirm = new ButtonBuilder()
        .setCustomId('confirm')
        .setLabel('Confirm Match')
        .setStyle(ButtonStyle.Success);

    const deny = new ButtonBuilder()
        .setCustomId('deny')
        .setLabel('Make Changes')
        .setStyle(ButtonStyle.Danger);

    const confirmationRow = new ActionRowBuilder()
        .addComponents(confirm, deny);

    // respond and adapt based on button presses
    const response = await interaction.reply({
        content: `Is this correct?\n${replyStr}`,
        components: [confirmationRow],
        ephemeral: true,
    });

    try {
        const confirmation = await response.awaitMessageComponent({ filter: null, time: 120_000 });

        if (confirmation.customId === 'confirm') {
            await interaction.channel.send(replyStr);
            // google stuff
            const eb = new EventBuilder(matchInfo);
            authorize().then((a) => {
                return {
                    auth: a,
                    eventResource: eb.build(),
                };
            }).then(createEvent);
            interaction.editReply({
                content: 'event made',
                components: [],
                ephemeral: true,
            });
        }
        else if (confirmation.customId === 'deny') {
            await confirmation.update({
                content: 'Command cancelled.\nPlease re-enter the command to continue.',
                components: [],
                ephemeral: true,
            });
        }
    } catch (e) {
        console.log(e);
        await interaction.editReply({
            content: 'Confirm action timeout.\nPlease re-enter the command to continue.',
            components: [],
            ephemeral: true,
        });
    }
}

module.exports = {
    data,
    execute,
};
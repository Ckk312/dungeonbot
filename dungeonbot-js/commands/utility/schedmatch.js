const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('schedmatch')
    .setDescription('Schedule an upcoming Match')
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

module.exports = {
    data,
    async execute(interaction) {
        let hour = interaction.options.getInteger('hour');
        if (interaction.options.getString('am-pm') === 'pm') {
            hour += 12;
        }

        const date = new Date();
        const title = interaction.options.getString('title');
        const eventleague = interaction.options.getString('event-league');
        const opponent = interaction.options.getString('opponent');
        const bracket = interaction.options.getString('bracket-link');
        const stream = interaction.options.getString('stream-link');
        const dateStr = new Date(date.getFullYear(), (interaction.options.getInteger('month') - 1), interaction.options.getInteger('day'),
                                    hour, interaction.options.getInteger('minute'));

        let replyStr = `\`\`\`yaml\nDate/Time: ${dateStr.toString()} <t:${dateStr.getTime()}:F>\nTitle: ${title}
        \nEvent/League and Description: ${eventleague}\nOpponent: ${opponent}\nBracket: ${bracket}\nStream:`;

        if (stream) {
            replyStr += ` ${stream}\n`;
        }

        replyStr += '```';
        await interaction.reply(replyStr);
    },
};
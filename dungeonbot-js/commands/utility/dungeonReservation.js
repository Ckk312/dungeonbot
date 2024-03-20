const { SlashCommandBuilder } = require('discord.js');


const data = new SlashCommandBuilder()

    .setName('reserve') // /reserveDungeon
    .setDescription('Reserve the dungeon for a specific date')
    
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
            .setName('startHour')
            .setDescription('start hour based on 12 hour system')
            .setRequired(true)
            .setMinValue(0)
            .setMaxValue(12))
    .addStringOption(option =>
        option
            .setName('am-pm1')
            .setDescription('true for pm and false for am')
            .setRequired(true)
            .addChoices(
                { name: 'AM', value: 'am' },
                { name: 'PM', value: 'pm' },
            ))
    .addIntegerOption(option =>
        option
            .setName('endHour')
            .setDescription('end hour based on 12 hour system')
            .setRequired(true)
            .setMinValue(0)
            .setMaxValue(12))
    .addStringOption(option =>
        option
            .setName('am-pm2')
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



module.exports = {
    data,
    async execute(interaction) {
        let startHour = interaction.options.getInteger('startHour');
        if (interaction.options.getString('am-pm1') === 'pm') {
            startHour += 12;
        }

        let endHour = interaction.options.getInteger('endHour');
        if (interaction.options.getString('am-pm2') === 'pm') {
            endHour += 12;
        }

        const date = new Date();
        const title = interaction.options.getString('title');
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

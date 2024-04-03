const { SlashCommandBuilder } = require('discord.js');
const lister = require ('./googlecalendar/utility/listevents.js');




const data = new SlashCommandBuilder()

    .setName('reserve') // /reserve
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
    .addStringOption(option =>
        option
            .setName('title')
            .setDescription('Title of Event')
            .setRequired(true));

//Function is valid start

//SU open? line 53
//SU close? return 0;

timeInvalidDueToHOO(/* Date type object representing event being made */){
    if(/* Start time of event is before 07:00Hrs or After 9:00PM*/)
        return false;
    else
        return true
}

isTimeDuringEvent(/* Date type object representing event being made*/){
    
    let isTrue = true;
    
    for(/*Each item in the list of events */){
        //Store their start and end time
        if(/*Start is between those times*/)
            return false;
        else if(/*End is between those times*/)
            return false;

        else
            continue;

    }

    return isTrue;
}





module.exports = {
    data,
    async execute(interaction) {

        if(1)
        interaction.reply('Cannot schedule reservation due to schedule conflict!');


        let startHour = interaction.options.getInteger('startHour');
        if (interaction.options.getString('am-pm1') === 'pm') {
            startHour += 12;
        }

        if(startHour < 10){
            var hourStarted = '0' + Integer.toString(startHour);
        }

        const date = new Date();
        const title = interaction.options.getString('title');
        const startDateStr = new Date(date.getFullYear() + '-' + (interaction.options.getInteger('month') - 1) + '-' + interaction.options.getInteger('day') + 'T' + hourStarted + ":00:00");





        let replyStr = `\`\`\`yaml\nDate/Time: ${dateStr.toString()} <t:${dateStr.getTime()}:F>\nTitle: ${title}
        \nEvent/League and Description: ${eventleague}\nOpponent: ${opponent}\nBracket: ${bracket}\nStream:`;
        

        if (stream) {
            replyStr += ` ${stream}\n`;
        }

        replyStr += '```';
        await interaction.reply(replyStr);
    },
};

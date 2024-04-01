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

//Loop through event list and check if starting time is between event times
//Example

//Event 0
//New event starts same as Event 0? Yes
//Return False

//New event before Event 0
//New event start 9am Event 0 start 12am
//Is the ending of the new event earlier or equal to the start of the new event being made? Yes?
//Event return true
//Else return false

//New event during Event 0
//New event starts at 9am, check if the event on cal starts before it? (8am) Yes 


//First statement false (cal event starts 10am)
//Is ending of new event later start of cal event (ending 12am vs starting 10am) Yes?
//Event invalid return false

//











//Has 1 event

//Start conditions
//Before start of event 0 or After end of event 0

//End conditions
//If before start of event 0
//End also before start of event 0
//true
//else false

//If after start of event 0
//true


//Has 2+ events
//Conditions
//New event start before event 0 start
//New event end before event 0 start

//New event start after event 0 end
//New event start before event 1 start







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

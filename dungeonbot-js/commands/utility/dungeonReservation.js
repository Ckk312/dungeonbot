const { SlashCommandBuilder } = require('discord.js');
const { authorize } = require('../../googlecalendar/googleapi.js');
const { EventBuilder } = require('../../googlecalendar/utility/eventbuilder.js');
const createEvent = require('../../googlecalendar/utility/eventcreate.js');
const lister = require ('../../googlecalendar/utility/listevents.js');

const data = new SlashCommandBuilder()

    .setName('reserve')
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
            .setMinValue(1)
            .setMaxValue(31))
    .addIntegerOption(option =>
        option
            .setName('starthour')
            .setDescription('start hour based on 12 hour system')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(12))
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
            .setRequired(true));

/**
 * Compare a google calendar event and a date to ensure they don't collide
 * @param { Object } gCalEvent
 * @param { Date } Date
 * @return { boolean }
 */
function compare(gCalEvent, date) {
    if (!gCalEvent.start || !gCalEvent.end) {
        return false;
    }

    const gCalStart = new Date(gCalEvent.start.dateTime);
    const gCalEnd = new Date(gCalEvent.end.dateTime);

    if (gCalStart.getHours() < date.getHours()) {
        if (gCalEnd.getHours() < date.getHours()) {
            return true;
        }

        return false;
    }

    else if (gCalStart.getHours() > Date.getHours()) {
        if (gCalStart.getHours() > (Date.getHours() + 3)) {
            return true;
        }

        return false;
    }

    else {
        return false;
    }
}

/**
 * replies with an interaction
 * @param {*} interaction
 * @param { number } code
 */
async function invalidResponse(interaction, code) {
    const errCode = '**This event could not be created:**';
    switch (code) {
        case 0:
            await interaction.editReply(errCode + 'This event exists outside of Student Union hours');
            break;
        case 1:
            await interaction.editReply(errCode + 'There is a conflict with another reservation. Contact the *General Manager* for any reservation conflicts.');
            break;
        default:
            break;
    }
}

module.exports = {
    cooldown: 60,
    data,
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const options = interaction.options;
        const timeConstants = {
            normalDay: {
                DAY_START: 7,
                DAY_END_HOUR: 11,
                DAY_END_MINUTE: 59,
            },
            saturday: {
                DAY_START: 9,
                DAY_END_HOUR: 11,
                DAY_END_MINUTE: 59,
            },
            sunday: {
                DAY_START: 11,
                DAY_END_HOUR: 9,
                DAY_END_START: 59,
            },
        };

        // determine hour based on am-pm
        let hour = options.getInteger('starthour');

        if (options.getString('am-pm') === 'pm' && hour < 11) {
            hour += 12;
        }

        if (options.getString('am-pm') === 'am' && hour === 12) {
            hour = 0;
        }

        // create dates and event info to get events
        const curDate = new Date();
        const resDate = new Date(curDate.getFullYear(), options.getInteger('month') - 1, options.getInteger('day'), hour);

        const eventInfo = {
            auth: await authorize(),
            date: new Date(resDate.getFullYear(), resDate.getMonth(), resDate.getDate()),
            calendarId: '96b429f6e1f87660f0d72044faae4b65eba175e1edef273abc974b331a8c425e@group.calendar.google.com',
        };

        const events = await lister.listEvents(eventInfo);

        // check if the event is within SU hours
        if (resDate.getDay() === 5) {
            if (resDate.getHours() < timeConstants.saturday.DAY_START) {
                await invalidResponse(interaction, 0);
                return;
            }
        }

        else if (resDate.getDay() === 6) {
            if (resDate.getHours() < timeConstants.sunday.DAY_START) {
                await invalidResponse(interaction, 0);
                return;
            }
        }

        else if (resDate.getDay() < 5) {
            if (resDate.getHours() < timeConstants.normalDay.DAY_START) {
                await invalidResponse(interaction, 0);
                return;
            }
        }

        // check that all events in the list don't conflict with the desired event
        try {
            for (const event of events) {
                if (!compare(event, resDate)) {
                    await invalidResponse(interaction, 1);
                    return;
                }
            }
        } catch (e) {
            // probably just an empty list
            console.error(e);
        }

        // create the event on google calendar
        try {
            const info = {
                auth: eventInfo.auth,
                calendarId: '96b429f6e1f87660f0d72044faae4b65eba175e1edef273abc974b331a8c425e@group.calendar.google.com',
                eventResource: new EventBuilder()
                    .setSummary(options.getString('title'))
                    .setDescription('Event Created by ' + interaction.user.username)
                    .setStartTime(resDate.toISOString())
                    .setEndTime((new Date(resDate.getFullYear(), resDate.getMonth(), resDate.getDate(), resDate.getHours() + 3, resDate.getMinutes())).toISOString())
                    .toJSON(),
            };
            await createEvent(info);
        } catch (e) {
            await interaction.editReply('Adding event to Google Calendar failed...');
            console.error(e);
            return;
        }

        // respond
        await interaction.editReply({ content: 'Reservation has been saved on Google Calendar. Check the [calendar](https://calendar.google.com/calendar/embed?src=96b429f6e1f87660f0d72044faae4b65eba175e1edef273abc974b331a8c425e%40group.calendar.google.com&ctz=America%2FNew_York) to find your reservation', ephemeral: true });
        return;
    },
};
const { SlashCommandBuilder } = require('discord.js');
const { authorize } = require('./googlecalendar/googleapi.js');
const { EventBuilder } = require('../../googlecalendar/utility/eventbuilder.js');
const { createEvent } = require('../../googlecalendar/utility/eventcreate.js');
const lister = require ('./googlecalendar/utility/listevents.js');

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
            .setName('startHour')
            .setDescription('start hour based on 12 hour system')
            .setRequired(true)
            .setMinValue(1)
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

/**
 * Compare a google calendar event and a date to ensure they don't collide
 * @param { Object } gCalEvent
 * @param { Date } Date
 * @return { boolean }
 */
function compare(gCalEvent, Date) {
    if (!gCalEvent.start || !gCalEvent.end) {
        return false;
    }

    const gCalStart = new Date(gCalEvent.start.dateTime);
    const gCalEnd = new Date(gCalEvent.end.dateTime);

    if (gCalStart.getHour() < Date.getHour()) {
        if (gCalEnd.getHour() < Date.getHour()) {
            return true;
        }

        return false;
    }

    else if (gCalStart.getHour() > Date.getHour()) {
        if (gCalStart.getHour() > (Date.getHour() + 3)) {
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
    switch (code) {
        case 0:
            await interaction.editReply('This event could not be created.\nThe event exists outside of Student Union hours');
            break;
        case 1:
            await interaction.editReply('This event could not be created.\nThere is a conflict with another reservation. Contact the General Manager for any reservation conflicts.');
            break;
        default:
            break;
    }
}

module.exports = {
    data,
    async execute(interaction) {
        interaction.deferReply();
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
        let hour = options.getInteger('startHour');

        if (options.getString('am-pm1') === 'pm' && hour < 11) {
            hour += 12;
        }

        if (options.getString('am-pm1') === 'am' && hour === 12) {
            hour = 0;
        }

        // create dates and event info to get events
        const curDate = new Date();
        const resDate = new Date(curDate.getFullYear(), options.getInteger('month') - 1, options.getInteger('day'), hour);

        const eventInfo = {
            auth: authorize(),
            date: new Date(resDate.getFullYear(), resDate.getMonth(), resDate.getDate()),
            id: '96b429f6e1f87660f0d72044faae4b65eba175e1edef273abc974b331a8c425e@group.calendar.google.com',
        };

        const events = lister.listEvents(eventInfo);

        // check that all events in the list don't conflict with the desired event
        for (const event of events) {
            if (resDate.getDay() === 5) {
                if (resDate.getHour() < timeConstants.saturday.DAY_START) {
                    await invalidResponse(interaction, 0);
                    return;
                }

                if (!compare(event, resDate)) {
                    await invalidResponse(interaction, 1);
                    return;
                }
            }

            else if (resDate.getDay() === 6) {
                if (resDate.getHour() < timeConstants.sunday.DAY_START) {
                    await invalidResponse(interaction, 0);
                    return;
                }

                if (!compare(event, resDate)) {
                    await invalidResponse(interaction, 1);
                    return;
                }
            }

            else if (resDate.getDay() < 5) {
                if (resDate.getHour() < timeConstants.normalDay.DAY_START) {
                    await invalidResponse(interaction, 0);
                    return;
                }

                if (!compare(event, resDate)) {
                    await invalidResponse(interaction, 1);
                    return;
                }
            }
        }

        // create the event on google calendar
        try {
            const info = {
                auth: eventInfo.auth,
                calendarId: '96b429f6e1f87660f0d72044faae4b65eba175e1edef273abc974b331a8c425e@group.calendar.google.com',
                resource: new EventBuilder()
                    .setSummary(options.getString('title'))
                    .setDescription('Event Created by ' + interaction.user.username)
                    .setStartTime(resDate)
                    .setEndTime(new Date(resDate.getFullYear(), resDate.getMonth(), resDate.getDate(), resDate.getHour() + 3, resDate.getMinute())),
            };
            createEvent(info);
        } catch (e) {
            interaction.editReply('Adding event to Google Calendar failed...');
            console.error(e);
            return;
        }

        // respond
        interaction.editReply('yay');
        return;
    },
};
const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const updateEvent = require('../../googlecalendar/utility/eventupdate.js');
const { authorize } = require('../../googlecalendar/googleapi.js');
const loadTitleAssets = require('../assets/loadassets.js');
const MatchTag = require('../../models');
const { EventBuilder } = require('../../googlecalendar/utility/eventbuilder.js');


const data = new SlashCommandBuilder()
    .setName('editmatch')
    .setDescription('Edits a match')
    .addStringOption(option =>
        option
            .setName('match-id')
            .setDescription('The ID of the match')
            .setRequired(true))
    .addStringOption(option =>
        option
            .setName('game')
            .setDescription('The game for which this match is for.')
            .addChoices(
                { name: 'Apex Legends', value: 'apex' },
                { name: 'Call of Duty', value: 'cod' },
                { name: 'Counterstrike', value: 'cs' },
                { name: 'League of Legends', value: 'lol' },
                { name: 'Overwatch', value: 'ow' },
                { name: 'Rainbow Six: Siege', value: 'r6' },
                { name: 'Rocket League', value: 'rl' },
                { name: 'Splatoon', value: 'spl' },
                { name: 'Super Smash Bros.', value: 'ssb' },
                { name: 'VALORANT', value: 'val' },
            ))
    .addStringOption(option =>
        option
            .setName('team')
            .setDescription('Select which team is playing this match.')
            .addChoices(
                { name: 'UCF Knights', value: 'UCF Knights' },
                { name: 'UCF Knights Academy', value: 'UCF Knights Academy' },
                { name: 'UCF Knights Rising', value: 'UCF Knights Rising' },
                { name: 'UCF Knights Pink', value: 'UCF Knights Pink' },
            ))
    .addStringOption(option =>
        option
            .setName('date')
            .setDescription('Enter a date in mm/dd/yy format'))
    .addStringOption(option =>
        option
            .setName('time')
            .setDescription('Enter the time in hh:mm 24 hour format'))
    .addStringOption(option =>
        option
            .setName('title')
            .setDescription('New title of event'))
    .addStringOption(option =>
        option
            .setName('event-league')
            .setDescription('Tournament or League of Match.'))
    .addStringOption(option =>
        option
            .setName('opponent')
            .setDescription('Name of College/University and Team Name.'))
    .addStringOption(option =>
        option
            .setName('bracket-link')
            .setDescription('Enter the link to the bracket.'))
    .addStringOption(option =>
        option
            .setName('stream-link')
            .setDescription('Enter the link for anyone who plans on streaming the match.'))
    .addStringOption(option =>
        option
            .setName('opponent-socials')
            .setDescription('Enter the opponents socials such as streams, twitter and instagram handles, etc.'))
    .addStringOption(option =>
        option
            .setName('hashtags')
            .setDescription('Enter relevant Hashtags to the event.'));

async function execute(interaction) {
    const response = await interaction.deferReply({ ephemeral: true });

    // find in database
    const eventModel = await MatchTag.findByPk(interaction.options.getString('match-id'));
    const eventInfo = eventModel.toJSON();

    if (!eventInfo) {
        await interaction.editReply({ content: 'Event with this ID could not be found.' });
    } else {
        // buttons
        const confirm = new ButtonBuilder()
            .setCustomId('confirm')
            .setLabel('Confirm')
            .setStyle(ButtonStyle.Success);

        const deny = new ButtonBuilder()
            .setCustomId('deny')
            .setLabel('Deny')
            .setStyle(ButtonStyle.Danger);

        const confirmationRow = new ActionRowBuilder()
            .addComponents(confirm, deny);

        // build reply
        let assets;
        let reply = '**Is this correct?**\n```';
        const options = interaction.options;
        if (options.getString('game')) {
            assets = await loadTitleAssets(options.getString('game'));
            eventInfo.game = options.getString('game');
            reply += 'Game: ' + assets.fullName;
            eventInfo.fullName = assets.fullName;
        } else {
            assets = await loadTitleAssets(eventInfo.game);
        }

        // lol regex I hate it
        // eslint-disable-next-line no-unused-vars, no-control-regex, no-useless-escape
        const dateRegex = new RegExp(/^((0?[13578]|10|12)(\/)(([1-9])|(0[1-9])|([12])([0-9]?)|(3[01]?))(\/)((19)([2-9])(\d{1})|(20)([01])(\d{1})|([890123])(\d{1}))|(0?[2469]|11)(\/)(([1-9])|(0[1-9])|([12])([0-9]?)|(3[0]?))(\/)((19)([2-9])(\d{1})|(20)([01])(\d{1})|([890123])(\d{1})))$/);

        // build a reply based on what we have so I don't have to do it on one line
        reply += '\nTeam: ';
        eventInfo.team = options.getString('team') || eventInfo.team;
        reply += eventInfo.team;
        reply += '\nOpponent: ';
        eventInfo.opponent = options.getString('opponent') || eventInfo.opponent;
        reply += eventInfo.opponent;
        reply += '\nTitle: ';
        eventInfo.title = options.getString('title') || eventInfo.title;
        reply += eventInfo.title;

        // get and set date if exists
        let date = new Date(eventInfo.date);
        let dateNums;
        if (options.getString('date')) {
            if (!dateRegex.test(options.getString('date'))) {
                await interaction.editReply('Date is formatted incorrectly. Please re-enter command.');
                return;
            }
            const dateStrings = options.getString('date').split('/');
            dateNums = dateStrings.map((d) => Number(d));
            if (dateNums[2] < 2000) {
                dateNums[2] += 2000;
            }
            date = new Date(dateNums[2], dateNums[0] - 1, dateNums[1], date.getHours(), date.getMinutes(), 0, 0);
        }

        // get and set time if exists
        let timeNums;
        if (options.getString('time')) {
            if (!/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(options.getString('time'))) {
                await interaction.editReply('Time is formatted incorrectly. Please re-enter command.');
                return;
            }
            const timeStrings = options.getString('time').split(':');
            timeNums = timeStrings.map((t) => Number(t));
            date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), timeNums[0], timeNums[1], 0, 0);
        }

        eventInfo.date = date;
        eventInfo.dateUNIX = date.getTime() / 1000;
        reply += '\nDate/Time: ' + eventInfo.date;
        reply += '\nEvent/League: ';
        eventInfo.eventLeague = options.getString('event-league') || eventInfo.eventLeague;
        reply += eventInfo.eventLeague;
        reply += '\nBracket: ';
        eventInfo.bracket = options.getString('bracket-link') || eventInfo.bracket;
        reply += eventInfo.bracket;

        if (options.getString('stream-link') || eventInfo.stream) {
            reply += '\nStream: ';
            eventInfo.stream = options.getString('stream-link') || eventInfo.stream;
            reply += eventInfo.stream;
        }

        if (options.getString('opponent-socials') || eventInfo.socials) {
            reply += '\nOpponent Socials: ';
            eventInfo.socials = options.getString('opponent-socials') || eventInfo.socials;
            reply += eventInfo.socials;
        }

        if (options.getString('hashtags') || eventInfo.hashtags) {
            reply += '\nHashtags: ';
            eventInfo.hashtags = options.getString('hashtags') || eventInfo.hashtags;
            reply += eventInfo.hashtags;
        }

        reply += '```';

        // respond and adapt based on actual input
        await interaction.editReply({
            content: reply,
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
            const newDate = new Date(date.getTime() + 7_200_000);
            const eb = new EventBuilder()
                .setGeneral()
                .setMatchInfo(eventInfo)
                .setStartTime(new Date(eventInfo.date).toISOString())
                .setEndTime(newDate.toISOString());

            const gCalEventInfo = {
                auth: await authorize().catch(console.error),
                calendarId: '309c74357dd09db96919f94f3f07dae0ae1a331bbf00fd32a1cb7b3e81acb9e8@group.calendar.google.com',
                eventId: eventInfo.eventId1,
                resource: eb.toJSON(),
            };

            await updateEvent(gCalEventInfo);

            gCalEventInfo.calendarId = assets.calendar;
            gCalEventInfo.eventId = eventInfo.eventId2;

            gCalEventInfo.resource = new EventBuilder()
                .setMatchInfo(eventInfo)
                .setStartTime(new Date(eventInfo.date).toISOString())
                .setEndTime(newDate.toISOString())
                .toJSON();

            await updateEvent(gCalEventInfo);

            // database
            eventModel.update(eventInfo);

            confirmation.update({
                content: 'Event has been edited.',
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
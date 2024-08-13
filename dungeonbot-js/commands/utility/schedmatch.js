const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { EventBuilder } = require('../../googlecalendar/utility/eventbuilder.js');
const { createEvent } = require('../../googlecalendar/utility/eventcreate.js');
const { authorize } = require('../../googlecalendar/googleapi.js');
const fs = require('fs').promises;
const path = require('path');
const process = require('process');

const TITLE_ASSETS_PATH = path.join(process.cwd(), './commands/assets/titleassets.json');

/**
 * Load json file from path and get object
 *
 * @param { string } title name of title
 * @returns { Object }
 */
async function loadTitleAssets(title) {
    try {
        const file = await fs.readFile(TITLE_ASSETS_PATH);
        const assets = JSON.parse(file);
        if (assets[title]) {
            return assets[title];
        } else {
            throw new Error('Could not load object with name: ' + title);
        }
    } catch (e) {
        console.log(e);
        return null;
    }
}

// slash command
const data = new SlashCommandBuilder()
    .setName('schedmatch')
    .setDescription('Schedule an upcoming match.')
    .addStringOption(option =>
        option
            .setName('game')
            .setDescription('The game for which this match is for.')
            .setRequired(true)
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
            .setRequired(true)
            .addChoices(
                { name: 'UCF Knights', value: 'UCF Knights' },
                { name: 'UCF Knights Academy', value: 'UCF Knights Academy' },
                { name: 'UCF Knights Gold', value: 'UCF Knights Gold' },
                { name: 'UCF Knights Black', value: 'UCF Knights Black' },
                { name: 'UCF Knights White', value: 'UCF Knights White' },
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
            .setDescription('Set hour based on 12 hour system.')
            .setRequired(true)
            .setMinValue(0)
            .setMaxValue(12))
    .addIntegerOption(option =>
        option
            .setName('minute')
            .setDescription('Set minute of hour.')
            .setRequired(true)
            .setMinValue(0)
            .setMaxValue(59))
    .addStringOption(option =>
        option
            .setName('am-pm')
            .setDescription('Enter AM/PM.')
            .setRequired(true)
            .addChoices(
                { name: 'AM', value: 'am' },
                { name: 'PM', value: 'pm' },
            ))
    .addStringOption(option =>
        option
            .setName('title')
            .setDescription('Title of Event.')
            .setRequired(true))
    .addStringOption(option =>
        option
            .setName('event-league')
            .setDescription('Tournament or League of Match.')
            .setRequired(true))
    .addStringOption(option =>
        option
            .setName('opponent')
            .setDescription('Name of College/University and Team Name.')
            .setRequired(true))
    .addStringOption(option =>
        option
            .setName('bracket-link')
            .setDescription('Enter the link to the bracket.')
            .setRequired(true))
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

// execute function
async function execute(interaction) {
    // set the hour based on am or pm
    let hour = interaction.options.getInteger('hour');
    const ampm = interaction.options.getString('am-pm');
    if (ampm === 'pm') {
        hour += hour == 12 ? 0 : 12;
    } else {
        hour -= hour == 12 ? 12 : 0;
    }

    // take the current date to find the year and construct a new date with given information
    const today = new Date();

    const date = new Date(today.getFullYear(), (interaction.options.getInteger('month') - 1), interaction.options.getInteger('day'), hour, interaction.options.getInteger('minute'));

    // use the date and rest of information to construct matchInfo object
    const matchInfo = {
        date: date.toISOString(),
        game: interaction.options.getString('game'),
        team: interaction.options.getString('team'),
        title: interaction.options.getString('title'),
        eventLeague: interaction.options.getString('event-league'),
        opponent: interaction.options.getString('opponent'),
        bracket: interaction.options.getString('bracket-link'),
        stream: interaction.options.getString('stream-link'),
        socials: interaction.options.getString('opponent-socials'),
        hashtags: interaction.options.getString('hashtags'),
    };

    // string to reply with and it's editions
    let replyStr = `\`\`\`yaml\nDate/Time: ${date.toString()} <t:${date.getTime() / 1000}:F>\nTitle: ${matchInfo.title}
        \nEvent/League and Description: ${matchInfo.eventLeague}\nOpponent: ${matchInfo.opponent}\nBracket: ${matchInfo.bracket}\nSocials:`;

    if (matchInfo.socials) {
        replyStr += ` ${matchInfo.socials}`;
    }

    replyStr += 'Hashtags: ';

    if (matchInfo.hashtags) {
        replyStr += ` ${matchInfo.hashtags}`;
    }

    replyStr += 'Stream: ';

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
    }

    // confirm button case
    if (confirmation?.customId === 'confirm') {
        // google api calendar
        const assets = await loadTitleAssets(matchInfo.game);
        const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), (date.getHours() + 2), date.getMinutes());

        // post to all matches calendar
        let eb = new EventBuilder()
            .setGeneral()
            .setMatchInfo(matchInfo)
            .setStartTime(date.toISOString())
            .setEndTime(newDate.toISOString());
        const info = {
            calendarId: '309c74357dd09db96919f94f3f07dae0ae1a331bbf00fd32a1cb7b3e81acb9e8@group.calendar.google.com',
            eventResource: eb.toJSON(),
        };
        const eventExist = await authorize().then((a) => {
            info.auth = a;
            return info;
        }).then(createEvent).catch(console.error);

        // post to specific games' calendar
        info.calendarId = assets.calendar;
        eb = new EventBuilder()
            .setEventInfo(matchInfo)
            .setStartTime(date.toISOString())
            .setEndTime(newDate.toISOString());
        info.eventResource = eb.toJSON();
        await createEvent(info).catch(console.error);

        // respond based on google calendar api
        if (eventExist) {
            interaction.editReply({
                content: 'Event has been created on Google Calendar as well.',
                components: [],
                ephemeral: true,
            });
            const matchEmbed = new EmbedBuilder()
                .setColor(assets.colorHex)
                .setTitle(matchInfo.title)
                .setDescription('**Match for ' + assets.fullName + '**\n on: <t:' + date.getTime() / 1000 + ':F>')
                .setThumbnail(assets.picURL)
                .addFields(
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Match Up', value: '**' + matchInfo.team + '**\n*vs*\n**' + matchInfo.opponent + '**', inline: true },
                    { name: 'Event/League', value: '*' + matchInfo.eventLeague + '*', inline: true },
                    { name: 'Bracket', value: matchInfo.bracket, inline: true },
                    { name: '\u200B', value: '\u200B' },
                )
                .setFooter({ text: 'Created by ' + interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();
            if (matchInfo.stream) {
                matchEmbed.addFields(
                    { name: 'Stream Information', value: matchInfo.stream, inline: true },
                );
            }
            if (matchInfo.socials) {
                matchEmbed.addFields(
                    { name: 'Opponent Socials', value: '*' + matchInfo.socials + '*', inline: true },
                );
            }
            if (matchInfo.hashtags) {
                matchEmbed.addFields(
                    { name: 'Relevant Hashtags', value: '**' + matchInfo.hashtags + '**', inline: true },
                );
            }
            await interaction.channel.send({ embeds: [matchEmbed] });
        } else {
            interaction.editReply({
                content: 'Creation on Google Calendar failed.',
                components: [],
                ephemeral: true,
            });
        }
    }

    // deny button case
    else if (confirmation?.customId === 'deny') {
        await confirmation.update({
            content: 'Command cancelled.\nPlease re-enter the command to continue.',
            components: [],
            ephemeral: true,
        });
    }
}

module.exports = {
    cooldown: 60,
    data,
    execute,
};
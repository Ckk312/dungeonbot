const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const MatchTag = require('../../models');
const { Sequelize } = require('sequelize');

const data = new SlashCommandBuilder()
    .setName('list-matches')
    .setDescription('Lists matches based on query')
    .addStringOption(option =>
        option
            .setName('match-id')
            .setDescription('The id of a specific game'),
    )
    .addStringOption(option =>
        option
            .setName('game')
            .setDescription('The game to look for in a search')
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
            ),
        )
    .addStringOption(option =>
        option
            .setName('team')
            .setDescription('The team to search for')
            .addChoices(
                { name: 'UCF Knights', value: 'UCF Knights' },
                { name: 'UCF Knights Academy', value: 'UCF Knights Academy' },
                { name: 'UCF Knights Rising', value: 'UCF Knights Rising' },
                { name: 'UCF Knights Pink', value: 'UCF Knights Pink' },
            ),
    )
    .addStringOption(option =>
        option
            .setName('before-date')
            .setDescription('Search before this date in mm/dd/yy format'),
    )
    .addStringOption(option =>
        option
            .setName('after-date')
            .setDescription('Search after this date in mm/dd/yy format'),
    )
    .addStringOption(option =>
        option
            .setName('title')
            .setDescription('Search based on title'),
    )
    .addStringOption(option =>
        option
            .setName('event-league')
            .setDescription('Search by event/league'),
    )
    .addStringOption(option =>
        option
            .setName('opponent')
            .setDescription('Search by opponent'),
    )
    .addBooleanOption(option =>
        option
            .setName('is-win')
            .setDescription('Search for games that have wins or losses'),
    );

async function execute(interaction) {
    await interaction.deferReply();

    const dateRegex = new RegExp(/^((0?[13578]|10|12)(\/)(([1-9])|(0[1-9])|([12])([0-9]?)|(3[01]?))(\/)((19)([2-9])(\d{1})|(20)([01])(\d{1})|([890123])(\d{1}))|(0?[2469]|11)(\/)(([1-9])|(0[1-9])|([12])([0-9]?)|(3[0]?))(\/)((19)([2-9])(\d{1})|(20)([01])(\d{1})|([890123])(\d{1})))$/);

    // beginning of options
    const options = { where: {} };

    if (interaction.options.getString('match-id')) {
        const match = MatchTag.findByPk(interaction.options.getString('match-id'));
        await interaction.editReply({ embed: [matchEmbed(match.toJSON, 'Searching for ' + interaction.options.getString('match-id'))] });
        return;
    }

    let searchStr = 'Searching for: ';
    if (interaction.options.getString('game')) {
        options.where.game = interaction.options.getString('game');
        searchStr += ` "${interaction.options.getString('game')}",`;
    }

    if (interaction.options.getString('team')) {
        options.where.team = interaction.options.getString('game');
        searchStr += ` "${interaction.options.getString('game')}",`;
    }

    const { gte, lte, and } = Sequelize.Op;
    let lteDate;
    if (interaction.options.getString('before-date')) {
        if (dateRegex.test(interaction.options.getString('before-date'))) {
            const dateStrings = interaction.options.getString('before-date').split('/');
            const dateNums = dateStrings.map((d) => Number(d));
            lteDate = new Date(2000 + dateNums[0], dateNums[2] - 1, dateNums[1]).getTime() / 1000;
            options.where.dateUNIX = {
                [lte]: lteDate,
            };
            searchStr += ` "before ${interaction.options.getString('before-date')}",`;
        } else {
            await interaction.editReply({ content: 'Incorrect date format' });
            return;
        }
    }

    if (interaction.options.getString('after-date')) {
        if (dateRegex.test(interaction.options.getString('after-date'))) {
            const dateStrings = interaction.options.getString('after-date').split('/');
            const dateNums = dateStrings.map((d) => Number(d));
            const gteDate = new Date(2000 + dateNums[0], dateNums[2] - 1, dateNums[1]).getTime() / 1000;
            if (lteDate) {
                options.where.dateUNIX = undefined;
                options.where = {
                    ...options.where,
                    [and]: [
                        { dateUNIX: { [gte]: gteDate } },
                        { dateUNIX: { [lte]: lteDate } },
                    ],
                };
            } else {
                options.where.dateUNIX = { [gte]: gteDate };
            }
            searchStr += ` "after ${interaction.options.getString('after-date')}",`;
        } else {
            await interaction.editReply({ content: 'Incorrect date format' });
            return;
        }
    }

    if (!interaction.options.getString('after-date') && !interaction.options.getString('before-date')) {
        options.where.dateUNIX = { [gte]: new Date((new Date().getFullYear()), 0, 1, 0, 0, 0, 0).getTime() / 1000 };
    }

    if (interaction.options.getString('title')) {
        options.where.title = `%${interaction.options.getString('title')}%`;
        searchStr += ` "${interaction.options.getString('title')}",`;
    }

    if (interaction.options.getString('event-league')) {
        options.where.eventLeague = `%${interaction.options.getString('event-league')}%`;
        searchStr += ` "${interaction.options.getString('event-league')}",`;
    }

    if (interaction.options.getString('opponent')) {
        options.where.opponent = `%${interaction.options.getString('opponent')}%`;
        searchStr += ` "${interaction.options.getString('opponent')}",`;
    }

    if (interaction.options.getBoolean('is-win') !== null) {
        options.where.isWin = interaction.options.getBoolean('is-win');
        if (interaction.options.getBoolean('is-win')) {
            searchStr += ' "Wins"';
        } else {
            searchStr += ' "Losses"';
        }
    }

    if (searchStr === 'Searching for: ') {
        searchStr += 'All games for this semester.';
    }

    options.order = [['dateUNIX', 'ASC'], ['game', 'DESC']];

    let offset = 0;
    const count = await MatchTag.count(options);
    options.limit = 10;
    let result = await MatchTag.findAndCountAll(options);

    // button configuration
    const buttons = [
        new ButtonBuilder()
            .setCustomId('left')
            .setLabel('◀')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true),
        new ButtonBuilder()
            .setCustomId('right')
            .setLabel('▶')
            .setStyle(ButtonStyle.Primary),
    ];

    const confirmationRow = new ActionRowBuilder()
        .addComponents(buttons[0], buttons[1]);

    const response = await interaction.editReply({
        embeds: [matchEmbed(result, searchStr, count, buttons, offset)],
        components: [confirmationRow],
    });

    let confirmation;
    try {
        confirmation = await response.awaitMessageComponent({ filter: null, time: 300_000 });
    } catch (e) {
        console.error(e);
        await interaction.deleteReply();
        return;
    }

    // confirm button case
    if (confirmation?.customId === 'left') {
        if (offset >= 10) {
            offset -= 10;
            buttons[1].setDisabled(false);
        }

        if (offset === 0) {
            buttons[0].setDisabled(true);
        } else {
            buttons[0].setDisabled(false);
        }

        options.offset = offset;

        result = await MatchTag.findAndCountAll(options);

        await confirmation.update({
            embeds: [matchEmbed(result, searchStr, count, buttons, offset)],
            components: [confirmationRow],
        });
    }

    else if (confirmation?.customId === 'right') {
        if ((offset + 10) <= count) {
            offset += 10;
            buttons[0].setDisabled(false);
        }

        if ((offset + 10) > count) {
            buttons[1].setDisabled(true);
        } else {
            buttons[1].setDisabled(false);
        }

        options.offset = offset;

        result = await MatchTag.findAndCountAll(options);

        await confirmation.update({
            embeds: [matchEmbed(result, searchStr, count, buttons, offset)],
            components: [confirmationRow],
        });
    }
}

function matchEmbed(matches, desc, count, buttons, offset) {
    const embed = new EmbedBuilder()
        .setTitle('Match Search')
        .setDescription(desc);

    if (!matches || matches.count === 0) {
        embed.addFields({ name: 'No matches found', value: 'Please provide different search parameters or add new matches' });
        for (const button of buttons) {
            button.setDisabled(true);
        }
        embed.setFooter({ text: 'Displaying 0 of 0 ' });

        return embed;
    }

    if (count <= 10) {
        for (const button of buttons) {
            button.setDisabled(true);
        }
    }

    if (!Array.isArray(matches.rows)) {
        const match = matches.toJSON();
        embed.addFields({
            name: `${match.game.toUpperCase()}: ${match.team} vs ${match.opponent}`,
            value: `Event/League: ${match.eventLeague}\nDate: <t:${match.dateUNIX}:F> **${isScored(match)}**\nMatch ID: ${match.matchId}`,
        })
        .setFooter({ text: 'Displaying 1 of 1' });

        return embed;
    }

    if (matches.count <= 10) {
        buttons[1].setDisabled(true);
    } else {
        buttons[1].setDisabled(false);
    }

    for (const row of matches.rows) {
        const match = row.toJSON();
        embed.addFields({
            name: `${match.game.toUpperCase()}: ${match.team} vs ${match.opponent}`,
            value: `Event/League: ${match.eventLeague}\nDate: <t:${match.dateUNIX}:F> **${isScored(match)}**\nMatch ID: ${match.matchId}`,
        });
    }

    embed.setFooter({ text: `Displaying ${offset + matches.count} of ${count}` });

    return embed;
}

function isScored(match) {
    if (!match) {
        return '';
    }

    if (match.isWin === undefined || match.isWin === null) {
        return 'Not scored';
    }

    if (match.isWin === false) {
        return `Score or Record (W/L): ${match.ucfScore} - ${match.opponentScore}\nLoss`;
    }

    if (match.isWin === true) {
        return `Score or Record (W/L): ${match.ucfScore} - ${match.opponentScore}\nWin`;
    }
}

module.exports = {
    data,
    execute,
};
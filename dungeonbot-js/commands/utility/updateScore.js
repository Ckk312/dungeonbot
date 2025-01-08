const { SlashCommandBuilder } = require('discord.js');
const MatchTag = require('../../models');

const data = new SlashCommandBuilder()
    .setName('update-score')
    .setDescription('Updates the score of an existing match.')
    .addStringOption(option =>
        option
            .setName('match-id')
            .setDescription('Get the id of the event')
            .setRequired(true),
        )
    .addIntegerOption(option =>
        option
            .setName('ucf-score')
            .setDescription('The UCF team\'s score (if in a multi-opponent event, list your win record here)')
            .setRequired(true),
        )
    .addIntegerOption(option =>
        option
            .setName('opponent-score')
            .setDescription('Score of opponents (if in a multi-opponent event, list your loss record here)'),
        )
    .addBooleanOption(option =>
        option
            .setName('is-victory')
            .setDescription('Specify true if UCF won this event overall (leave empty for singular opponent matches)'),
    );

async function execute(interaction) {
    // get event
    const event = await MatchTag.findByPk(interaction.options.getString('match-id'));
    if (!event) {
        await interaction.reply({ content: 'Could not find event with this match id' });
        return;
    }

    // update
    const eventInfo = event.toJSON();
    eventInfo.ucfScore = interaction.options.getInteger('ucf-score');
    eventInfo.opponentScore = interaction.options.getInteger('opponent-score') ?? 0;
    eventInfo.isWin = interaction.options.getBoolean('is-victory') ?? eventInfo.ucfScore > eventInfo.opponentScore ? true : false;
    event.update(eventInfo);

    await interaction.reply({ content: 'Score of event has been updated', ephemeral: true });
}

module.exports = {
    data,
    execute,
};
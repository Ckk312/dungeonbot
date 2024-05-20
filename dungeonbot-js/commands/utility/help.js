const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
const process = require('process');

const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Displays all commands.');

async function execute(interaction) {
    let i = 1;
    let commands;
    const bot = interaction.client.application.bot;
    const HELP_PATH = path.join(process.cwd(), '../assets/help.json');
    try {
        const file = fs.readFileSync(HELP_PATH);
        commands = file.toJSON();
    } catch (e) {
        console.error(e);
        throw e;
    }

    let embed = new EmbedBuilder()
        .setAuthor({ name: bot.displayName, iconURL: bot.defaultAvatarURL })
        .setThumbnail(bot.defaultAvatarURL)
        .setTitle('**DungeonBot Help Commands**')
        .setDescription('Page ' + i + '/' + commands.length)
        .addField({ name: commands[i - 1].name, value: commands[i - 1].description });

    for ()

    const previous = new ButtonBuilder()
        .setCustomId('prev')
        .setEmoji('◀')
        .setStyle(ButtonStyle.Primary);

    const next = new ButtonBuilder()
        .setCustomId('next')
        .setEmoji('▶')
        .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder()
        .addComponents(next, previous);

    const response = await interaction.reply({ embeds: [embed], row: [row], ephemeral: true });

    try {
        await response.awaitMessageComponent({ filter: null, time: 120_000 });
    } catch (e) {
        interaction.deleteReply();
    }
}

module.exports = {
    data,
    execute,
    cooldown : 60,
};
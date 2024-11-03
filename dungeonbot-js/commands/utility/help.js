const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
const process = require('process');

function createEmbed(command, bot, curPage, length) {
    const embed = new EmbedBuilder()
        .setAuthor({ name: bot.dn, iconURL: bot.daURL })
        .setThumbnail(bot.daURL)
        .setTitle('**DungeonBot Help Commands**')
        .setDescription('*Page ' + curPage + '/' + length + '*')
        .addFields({ name: 'Command: ' + command.name, value: command.description });

    if (command.fields) {
        embed.addFields({ name: '\u200b**PARAMETERS**', value: ' ' });

        let i = 1;
        for (const field of command.fields) {
            if ((i % 4) === 0) {
                embed.addFields({ name: ' ', value: ' ' });
                i++;
            }
            embed.addFields({ name: field.name, value: field.desc + '\n**REQUIRED:** ' + field.required, inline: true });
            i++;
        }
    }

    return embed;
}

const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Displays all commands.');

async function execute(interaction) {
    let i = 1;
    let commands;
    await interaction.client.application.fetch();
    const bot = {
        dn: interaction.client.application.name,
        daURL: interaction.client.application.iconURL(),
    };
    const HELP_PATH = path.join(process.cwd(), 'commands/assets/help.json');
    try {
        const file = await fs.readFile(HELP_PATH);
        commands = JSON.parse(file);
    } catch (e) {
        console.error(e);
        throw e;
    }

    const pageLength = commands.length;

    let embed = createEmbed(commands[i - 1], bot, i, pageLength);

    const previous = new ButtonBuilder()
        .setCustomId('prev')
        .setEmoji('◀')
        .setStyle(ButtonStyle.Primary);

    const next = new ButtonBuilder()
        .setCustomId('next')
        .setEmoji('▶')
        .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder()
        .addComponents(previous, next);

    const response = await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

    const loop = true;
    while (loop) {
        try {
            const confirmation = await response.awaitMessageComponent({ filter: null, time: 120_000 });

            if (confirmation.customId === 'prev') {
                i--;
                if (i < 1) {
                    i = pageLength;
                }
                embed = createEmbed(commands[i - 1], bot, i, pageLength);
            }

            if (confirmation.customId === 'next') {
                i++;
                if (i > pageLength) {
                    i = 1;
                }
                embed = createEmbed(commands[i - 1], bot, i, pageLength);
            }

            await confirmation.update({ embeds: [embed], components: [row] });
        } catch (e) {
            await interaction.deleteReply();
            return;
        }
    }
}

module.exports = {
    data,
    execute,
    cooldown : 60,
};
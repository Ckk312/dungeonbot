const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('write')
    .setDescription('Creates a message using this bot in a specified channel.')
    .addChannelOption(option =>
        option
            .setName('channel')
            .setDescription('Choose the channel where this message will be written.')
            .setRequired(true),
        )
    .addStringOption(option =>
        option
            .setName('message')
            .setDescription('Message body')
            .setRequired(true),
        );

async function execute(interaction) {
    try {
        await interaction.options.getChannel('channel').send(interaction.options.getString('message'));
    } catch (e) {
        console.error(e);
        await interaction.reply({ content: 'Message could not be sent', ephemeral: true });
        return;
    }

    await interaction.reply({ content: `Message has been sent in ${interaction.channel.url}`, ephemeral: true });
}

module.exports = {
    data,
    execute,
};
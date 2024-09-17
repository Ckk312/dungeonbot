const { SlashCommandBuilder } = require('discord.js');
const { sendMessage } = require ('../../susched.js');

const data = new SlashCommandBuilder()
    .setName('list')
    .setDescription('List today\'s events');

module.exports = {
    cooldown: 300,
    data,
    async execute(interaction) {
        sendMessage(interaction.client);
        await interaction.reply({ content: 'Message sent.', ephemeral: true });
    },
};
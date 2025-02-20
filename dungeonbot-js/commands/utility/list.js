const { SlashCommandBuilder } = require('discord.js');
const { sendMessage } = require ('../../susched.js');

const data = new SlashCommandBuilder()
    .setName('list')
    .setDescription('List today\'s events');

module.exports = {
    cooldown: 60,
    data,
    async execute(interaction) {
        const reply = { content: 'An error has occurred.', ephemeral: true };
        if (sendMessage(interaction.client)) {
            reply.content = 'Message sent';
        }
        await interaction.reply(reply);
    },
};
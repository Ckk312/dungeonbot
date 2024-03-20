const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('checkin')
    .setDescription('Check into the Dungeon!');

module.exports = {
    data,
    async execute(interaction) {
        
        await interaction.reply("Hey! You're all checked in now relax.");
    },
};
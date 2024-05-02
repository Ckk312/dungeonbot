const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('write')
    .setDescription('Creates a message using this bot in a specified channel.')
    .setChannelOption(option => 
        option
            .setName('channel')
            .setDescription('Choose the channel where this message will be written.')
            .setRequired(true)
        )
    
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
const process = require('process');

const GUILD_FOLDER_PATH = path.join(process.cwd(), './commands/guilds/');

const data = new SlashCommandBuilder()
    .setName('setchannel')
    .setDescription('Set the channel for the specific command')
    .addStringOption(option =>
        option.setName('command')
            .setDescription('Select a command.')
            .setRequired(true))
    .addChannelOption(option =>
        option.setName('channel')
            .setRequired(true)
            .setDescription('Pick a channel'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

async function execute(interaction) {
    let found = false;
    await interaction.deferReply({ ephemeral: true });
    for (const command of interaction.client.commands) {
        if (command === interaction.options.getString('command')) {
            found = true;
            break;
        }
    }

    if (!found) {
        interaction.editReply({ content: `Command ${interaction.options.getString('command')} does not exist.`, ephemeral: true });
        return;
    }

    let object = {};
    // read file guild folder path
    try {
        const commandInfo = await fs.readFile(GUILD_FOLDER_PATH + interaction.guild.id + '.json');
        object = JSON.parse(commandInfo);
    } catch (e) {
        console.log('File could not be found.');
    }
    // specify the channel id of the command
    object[interaction.options.getString('command')] = interaction.options.getChannel('channel').id;
    // write to json and reply
    await fs.writeFile(GUILD_FOLDER_PATH + '/' + interaction.guild.id + '.json', JSON.stringify(object), 'utf8');
    await interaction.editReply({ content: interaction.options.getChannel('channel').url + ' is assigned as the channel for /' + interaction.options.getString('command'), ephemeral: true });
}

module.exports = {
    data,
    execute,
};
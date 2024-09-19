const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
const process = require('process');

const GUILD_FOLDER_PATH = path.join(process.cwd(), './commands/guilds/');
console.log(GUILD_FOLDER_PATH);

const data = new SlashCommandBuilder()
    .setName('setchannel')
    .setDescription('Set the channel for the specific command')
    .addStringOption(option =>
        option.setName('command')
            .setDescription('Select a command or type "Default" for a default command channel.')
            .setRequired(true))
    .addChannelOption(option =>
        option.setName('channel')
            .setRequired(true)
            .setDescription('Pick a channel'))
    .addBooleanOption(option =>
        option.setName('delete')
            .setDescription('Adds to the list of approved channels for this command.'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

async function execute(interaction) {
    // ensure the command parameter is the same name as a command
    let found = false;
    await interaction.deferReply({ ephemeral: true });
    for (const command of interaction.client.commands) {
        if (command[0] === interaction.options.getString('command').toLowerCase() || interaction.options.getString('command').toLowerCase() === 'default') {
            found = true;
            break;
        }
    }

    if (!found) {
        return await interaction.editReply({ content: `Command ${interaction.options.getString('command')} does not exist.`, ephemeral: true });
    }

    let object = {};
    // read file guild folder path
    try {
        const commandInfo = await fs.readFile(GUILD_FOLDER_PATH + interaction.guild.id + '.json');
        object = JSON.parse(commandInfo);
    } catch (e) {
        console.log('File could not be found.');
        return await interaction.editReply({ content: 'Unexpected error has occured.', ephemeral: true });
    }

    // delete case
    // delete from list of channels
    if (interaction.options.getBoolean('delete')) {
        if (!object[interaction.options.getString('command').toLowerCase()] || !Array.isArray(object[interaction.options.getString('command').toLowerCase()])) {
            return await interaction.editReply({ content: 'There are currently no channels set to this command. Cannot delete.', ephemeral: true });
        }
        if (interaction.options.getString('command').toLowerCase() === 'default') {
            delete object['default'];
            return await interaction.editReply({ content: 'Default channel has been removed.', ephemeral: true });
        }
        const newIndex = object[interaction.options.getString('command').toLowerCase()].indexOf(interaction.options.getString('channel').id);
        if (newIndex === -1) {
            object[interaction.options.getString('command').toLowerCase()].shift();
            return await interaction.editReply({ content: interaction.options.getChannel('channel').url + ' was not an assigned channel for /' + interaction.options.getString('command'), ephemeral: true });
        }
        const replace = object[interaction.options.getString('command').toLowerCase()].pop();
        object[interaction.options.getString('command').toLowerCase()][newIndex] = replace;
        object[interaction.options.getString('command').toLowerCase()].shift();
        return await interaction.editReply({ content: interaction.options.getChannel('channel').url + ' has been removed from /' + interaction.options.getString('command'), ephemeral: true });
    }

    // add case
    // specify the channel id of the command
    if (interaction.options.getString('command').toLowerCase() === 'default') {
        object.default = interaction.options.getChannel('channel').id;
        try {
            await fs.writeFile(GUILD_FOLDER_PATH + '/' + interaction.guild.id + '.json', JSON.stringify(object), 'utf8');
        } catch (error) {
            console.error(error);
            return await interaction.editReply({ content: 'Unexpected error has occured' });
        }
        return await interaction.editReply({ content: 'The default channel is ' + interaction.options.getChannel('channel').url, ephemeral: true });
    }
    else if (!object[interaction.options.getString('command').toLowerCase()]) {
        object[interaction.options.getString('command').toLowerCase()] = new Array();
    }
    if (Array.isArray(object[interaction.options.getString('command').toLowerCase()]) && !object[interaction.options.getString('command').toLowerCase()].includes(interaction.options.getChannel('channel').id)) {
        object[interaction.options.getString('command').toLowerCase()].push(interaction.options.getChannel('channel').id);
    }

    // write to json and reply
    try {
        await fs.writeFile(GUILD_FOLDER_PATH + '/' + interaction.guild.id + '.json', JSON.stringify(object), 'utf8');
    } catch (error) {
        console.error(error);
        return await interaction.editReply({ content: 'Unexpected error has occured' });
    }

    await interaction.editReply({ content: interaction.options.getChannel('channel').url + ' is assigned as the channel for /' + interaction.options.getString('command'), ephemeral: true });
}

module.exports = {
    data,
    execute,
};
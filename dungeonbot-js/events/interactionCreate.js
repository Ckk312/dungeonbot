const { Events } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
const process = require('process');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        const COMMAND_CHANNEL_ID_PATH = path.join(process.cwd(), './commands/guilds/' + interaction.guild.id + '.json');

        // only consider ChatInputCommands
        if (!interaction.isChatInputCommand()) return;

        // log every command available in this client
        for (const command of interaction.client.commands) {
            console.log(command);
        }
        // retrieve command from list with same name
        const command = interaction.client.commands.get(interaction.commandName);

        // failed case
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found`);
        }

        // do actions based on command
        switch (interaction.commandName) {
            case 'schedmatch':
                let info;
                try {
                    const file = await fs.readFile(COMMAND_CHANNEL_ID_PATH);
                    info = JSON.parse(file);
                } catch(e) {
                    interaction.reply({ content: 'Set a command channel for this command using "/setchannel"', ephemeral: true });
                    console.error(e);
                    return;
                }

                
                if (!interaction.member.roles.cache.has('899044671119061072')) {
                    interaction.reply({ content: `You do not have the "Title Manager" role to complete this command.`, ephemeral: true });
                    return;
                }

                if (info[interaction.commandName] != interaction.channel.id) {
                    interaction.reply({ content: 'This channel is not specified for this command.', ephemeral: true });
                    return;
                }
                break;
        
            default:
                break;
        }

        // attempt to execute interaction
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied) {
                await interaction.editReply({ content: 'There was an error while executing this command!' });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral : true });
            }
        }
    }
}
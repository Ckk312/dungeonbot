const { Events, Collection } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
const process = require('process');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        const COMMAND_CHANNEL_ID_PATH = path.join(process.cwd(), './commands/guilds/' + interaction.guild.id + '.json');
        const { cooldowns } = interaction.client;

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

        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Collection());
        }

        // cooldown variables
        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        const defaultCooldownDuration = 3;
        const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000;

        // find if there is a cooldown and respond if they do
        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

            // check if cooldown has expired
            if (now < expirationTime) {
                const expiredTimestamp = Math.round(expirationTime / 1_000);
                return await interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, ephemeral: true });
            }
        }

        // create a timestamp of when the user last used the command and delete it when the cooldown is expired
        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        // do actions based on command
        switch (interaction.commandName) {
            case 'schedmatch':
                let info;
                try {
                    const file = await fs.readFile(COMMAND_CHANNEL_ID_PATH);
                    info = JSON.parse(file);
                } catch(e) {
                    await interaction.reply({ content: 'Set a command channel for this command using "/setchannel"', ephemeral: true });
                    console.error(e);
                    return;
                }

                if (!interaction.member.roles.cache.has('899044671119061072')) {
                    await interaction.reply({ content: `You do not have the "Title Manager" role to complete this command.`, ephemeral: true });
                    return;
                }

                if (info[interaction.commandName] != interaction.channel.id) {
                    await interaction.reply({ content: 'This channel is not specified for this command.', ephemeral: true });
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
            if (!interaction.replied) {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral : true });
            } else {
                await interaction.editReply('There was an error while executing this command!');
            }
        }
    },
};
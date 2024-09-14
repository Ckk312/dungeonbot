/* eslint-disable no-lonely-if */
const { Events, Collection, PermissionsBitField } = require('discord.js');
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
        if (timestamps.has(interaction.user.id) && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
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

        // read in the file and if it doesn't exist then create it
        let info;
        try {
            const file = await fs.readFile(COMMAND_CHANNEL_ID_PATH);
            info = JSON.parse(file);
        } catch (e) {
            console.error(e);
            try {
                info = {};
                await fs.writeFile(COMMAND_CHANNEL_ID_PATH, JSON.stringify(info), 'utf8');
            } catch (error) {
                return await interaction.reply({ content: 'Unexpected Error has occurred.', ephemeral: true });
            }
        }

        if (!info.TM_ROLE_ID) {
            info['TM_ROLE_ID'] = '770517986826125313';
        }

        // do actions based on command
        if (info[interaction.commandName] !== interaction.channel.id && !info.default) {
            return await interaction.reply({ content: 'An admin must set a channel for this command using "/setchannel"', ephemeral: true });
        }
        else if (!info[interaction.commandName] && interaction.channel.id !== info.default) {
            const defaultChannel = await interaction.client.channels.fetch(info.default);
            return await interaction.reply({ content: 'This command must be used in ' + defaultChannel.url, ephemeral: true });
        }
        else if (info[interaction.commandName] && info[interaction.commandName] != interaction.channel.id) {
            const newChannel = await interaction.client.channels.fetch(info[interaction.commandName]);
            return await interaction.reply({ content: 'This command must be used in ' + newChannel.url, ephemeral: true });
        }
        if (interaction.commandName === 'setchannel' || interaction.commandName === 'schedmatch') {
            if (!interaction.member.roles.cache.has(info.TM_ROLE_ID) && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                timestamps.delete(interaction.user.id);
                return await interaction.reply({ content: 'You do not have the "MANAGERIAL STAFF" role to complete this command.', ephemeral: true });
            }
        }

        // attempt to execute interaction
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral : true });
            } else {
                await interaction.editReply('There was an error while executing this command!');
            }
        }
    },
};
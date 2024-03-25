const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
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
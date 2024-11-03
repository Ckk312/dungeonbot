const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('edit')
    .setDescription('Edits a message belonging to this bot')
    .addStringOption(option =>
        option
            .setName('message-channel-id')
            .setDescription('Channel id of where the message was sent in.')
            .setRequired(true),
    )
    .addStringOption(option =>
        option
            .setName('message-id')
            .setDescription('The id of the message. (NOT THE URL)')
            .setRequired(true),
    )
    .addStringOption(option =>
        option
            .setName('message-body')
            .setDescription('The contents of the new message.')
            .setRequired(true),
    );

async function execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    // get the channel
    const channel = await interaction.client.channels.cache.get(interaction.options.getString('message-channel'));

    // try to edit the message if it exists. Fail otherwise
    try {
        const msg = await channel.messages.fetch(interaction.options.getString('message-id'));
        await msg.edit(interaction.options.getString('message-body-id'));
        await interaction.editReply({ content: 'Message has been edited ' + msg.url, ephemeral: true });
    } catch (e) {
        console.error(e);
        await interaction.editReply({ content: 'Message unable to be edited', ephemeral: true });
    }
}

module.exports = {
    data,
    execute,
};
// require consts
// eslint-disable-next-line spaced-comment
const dotenv = require('dotenv');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

dotenv.config();

// client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const commandList = require('./commands/utility/schedmatch.js');

client.commands.set(commandList.data.name, commandList);

// run code when client ready once
client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found`);
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral : true });
    }
});

// Log into Discord
client.login(process.env.TOKEN);
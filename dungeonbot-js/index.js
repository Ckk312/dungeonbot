// require consts
// eslint-disable-next-line spaced-comment
const dotenv = require('dotenv');
const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const reminderSched = require('./susched.js');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

// enable config for dotenv functionality
dotenv.config();

// client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Create a list of all commands in client
client.commands = new Collection();

// add command
const commandList = require('./commands/utility/schedmatch.js');
client.commands.set(commandList.data.name, commandList);

// run code when client ready once
client.once(Events.ClientReady, readyClient => {
    let msDiff, hour, min, sec;
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);

    msDiff = reminderSched.findCurrentDifference();
    setTimeout(reminderSched.sendMessage, msDiff, client, 'WAKE UP <@115690432351961095>. THE DUNGEON IS OPEN');

    sec = (msDiff / 1000) % 60;
    min = (msDiff / 60000) % 60;
    hour = msDiff / (3600000);
    console.log(`Next Schedule Update in ${hour.toPrecision(3)} hrs ${min.toFixed(0)} min and ${sec.toFixed(0)} sec.`);
});

// event listener for slash-command
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
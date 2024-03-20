// require consts
// eslint-disable-next-line spaced-comment
const dotenv = require('dotenv');
const fs = require('node:fs');
const path = require('node:path');
const process = require('process');
const { activate } = require('./googlecalendar/googleapi.js');
const { Client, Collection, GatewayIntentBits } = require('discord.js');

// enable config for dotenv functionality
dotenv.config();

// client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Create a list of all commands in client
client.commands = new Collection();

// add commands from directories of commands
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath).filter(file => file.endsWith('.js'));

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
    
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        }
        else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// add events from 'events' directory
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

activate();

// Log into Discord
client.login(process.env.TOKEN);
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
    setTimeout(sendMessage, difference, 'WAKE UP <@115690432351961095> . THE DUNGEON IS OPEN', now);
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

function normalDay(time) {
    let dayInc, hourInc, minInc, secInc;
    if (time.getDay() == 5 || time.getDay() == 6) {
        return;
    }

    if (time.getSeconds() > 0) {
        secInc = 60 - time.getSeconds();
    }

    if (time.getMinutes() > 0) {
        minInc = 60 - time.getMinutes();
    }

    if (time.getHours() < 7) {
        hourInc = 7 - time.getHours();
    }

    else if (time.getHours() > 7) {
        dayInc += 1;
        hourInc = 31 - time.getHours();
    }

    const nextDay = new Date(time.getFullYear(), time.getMonth(), time.getDate() + dayInc, time.getHours() + hourInc, time.getMinutes() + minInc, time.getSeconds() + secInc);
    return nextDay;
}

function friday(time) {
    let dayInc, hourInc, minInc, secInc;
    if (time.getDay() != 5) {
        return;
    }

    if (time.getSeconds() > 0) {
        secInc = 60 - time.getSeconds();
    }

    if (time.getMinutes() > 0) {
        minInc = 60 - time.getMinutes();
    }

    if (time.getHours() < 9) {
        hourInc = 9 - time.getHours();
    }

    else if (time.getHours() > 9) {
        dayInc += 1;
        hourInc = 33 - time.getHours();
    }

    const nextDay = new Date(time.getFullYear(), time.getMonth(), time.getDate() + dayInc, time.getHours() + hourInc, time.getMinutes() + minInc, time.getSeconds() + secInc);
    return nextDay;
}

function saturday(time) {
    let dayInc, hourInc, minInc, secInc;
    if (time.getDay() != 5) {
        return;
    }

    if (time.getSeconds() > 0) {
        secInc = 60 - time.getSeconds();
    }

    if (time.getMinutes() > 0) {
        minInc = 60 - time.getMinutes();
    }

    if (time.getHours() < 11) {
        hourInc = 11 - time.getHours();
    }

    else if (time.getHours() > 11) {
        dayInc += 1;
        hourInc = 35 - time.getHours();
    }

    const nextDay = new Date(time.getFullYear(), time.getMonth(), time.getDate() + dayInc, time.getHours() + hourInc, time.getMinutes() + minInc, time.getSeconds() + secInc);
    return nextDay;
}

const now = new Date();
const currentDay = now.getDay();
let tmrOpening;

switch (currentDay) {
    case 5:
        tmrOpening = friday(now);
        break;

    case 6:
        tmrOpening = saturday(now);
        break;

    default:
        tmrOpening = normalDay(now);
        break;
}

let difference = tmrOpening.getTime() - now.getTime();
difference *= 1_000;

const day = 86400 * 1_000;
const dayPlus2Hours = (86400 + 3600) * 1_000;

async function sendMessage(schedule, date) {
    const channel = await client.channels.cache.get('763248812558778378');
    console.log(channel);
    channel.send(schedule);

    if (date.getDay() == 5 || date.getDay() == 6) {
        difference = dayPlus2Hours;
    } else {
        difference = day;
    }

    setTimeout(sendMessage, difference, schedule, new Date());
}
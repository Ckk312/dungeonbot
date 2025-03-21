const { EmbedBuilder } = require('discord.js');

/**
 * Creates an embedded message based on information given
 *
 * @param { [*] } eventList
 * @returns
 */
function createMessage(eventList) {
    // base embed
    const date = new Date();
    const eb = new EmbedBuilder()
        .setTitle('Today\'s Reservations')
        .setDescription('List of all Dungeon Reservations for **' + date.toDateString() + '.**');

    // add fields based on array size
    try {
        if (eventList.length == 0) {
            throw new Error('Empty List');
        }

        for (const event of eventList) {
            const string = '**Beginning at:** <t:' + (new Date(event.start.dateTime).getTime() / 1000) + ':t>' +
                '\n**Ending at:** <t:' + (new Date(event.end.dateTime).getTime() / 1000) + ':t>\n*' + event.description + '*';

            const message = {
                name : '**__' + event.summary + '__**',
                value : string,
            };
            eb.addFields(message);
        }
    } catch (e) {
        eb.addFields({ name: '**__NO EVENTS ARE SCHEDULED FOR TODAY__**', value: ' ' });
        console.log(e);
    }

    eb.addFields({ name: '**REMEMBER**', value: 'Teams with a reservation have the right to ask you to leave. ' +
        '\nTry not to enter the dungeon while they are playing!' })
        .setFooter({ text: 'Contact the General Manager, an Officer, or Junior Officers for any questions about reservations' });

    return { embeds: [eb] };
}

exports.createMessage = createMessage;
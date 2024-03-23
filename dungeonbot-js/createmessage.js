const { EmbedBuilder } = require('discord.js');

/**
 * Creates an embedded message based on information given
 * 
 * @param {[*]} eventList 
 * @returns 
 */
function createMessage(eventList) {
    // base embed
    eb = new EmbedBuilder()
        .setTitle('Today\'s Reservations')
        .setDescription('List of all Dungeon Reservations for ' + new Date().toUTCString());

    // add fields based on array size
    try {
        let counter = 0;
        for (const event of eventList) {
            let string, message;
            string += '**Beginning at:** ' + event.start.dateTime + '\n**Ending at:** ' + event.end.dateTime + '\n' + event.description;
            if ((counter % 3) === 0) {
                message = {
                    name : '\u200b',
                    value : '\u200b',
                }
            } else {
                message = {
                    name : event.summary,
                    value : string,
                }
            }
            eb.addFields(message);
            counter++;
        }
    } catch (e) {
        console.log(e);
        eb.addFields({ name: 'NO EVENTS ARE SCHEDULED FOR TODAY', value: ' ' });
    }
        
    eb.addFields({ name: '**REMEMBER**', value: 'Teams with a reservation have the right to ask you to leave. ' + 
        'Try not to enter the dungeon while they are playing!', })
        .setFooter({ text: 'Contact the General Manager, an Officer, or Junior Officers for any questions for reservations' });
        
    return { embeds: [eb] }; 
}

exports.createMessage = createMessage;
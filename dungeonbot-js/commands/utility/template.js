const Canvas = require('@napi-rs/canvas');
const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('template')
    .setDescription('Creates templates from existing images')
    .addSubcommand(subcommand =>
        subcommand
        .setName('yt-stream-thumbnail')
        .setDescription('Youtube Stream Thumbnail Template')
        .addAttachmentOption((option) =>
            option
                .setName('bg-image')
                .setDescription('Background image for template (must be 16:9)')
                .setRequired(true))
        .addStringOption((option) =>
            option
                .setName('title')
                .setDescription('Competition being played in and the game being played. [League] [Game]')
                .setRequired(true))
        .addStringOption((option) =>
            option
                .setName('opponent')
                .setDescription('Name of opposing school')
                .setRequired(true))
        .addAttachmentOption((option) =>
            option
                .setName('opponent-logo')
                .setDescription('Opponents logo')));

async function execute(interaction) {
    await interaction.deferReply();
    const img = interaction.options.getAttachment('bg-image');

    if (!img.contentType.includes('image')) {
        await interaction.editReply({ content: 'Attachment is not an image.' });
        return;
    }

    if ((img.width / img.height) !== (16 / 9)) {
        await interaction.editReply({ content: 'Attachment is not an image in a 16:9 ratio' });
        return;
    }

    if (img.width < 854 || img.height < 480) {
        await interaction.editReply({ content: 'Image must at least be 480p quality' });
        return;
    }

    const canvas = Canvas.createCanvas(img.width, img.height);
    const context = canvas.getContext('2d');

    const bgImg = await Canvas.loadImage(img.url);

    context.globalCompositeOperation = 'hard-light';

    context.fillStyle = '#101010';
    context.fillRect(0, 0, img.width, img.height);

    context.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    context.globalCompositeOperation = 'color';
    context.fillStyle = '#dbb414';
    context.fillRect(0, 0, img.width, img.height);

    context.globalCompositeOperation = 'soft-light';
    context.fillStyle = '#fbcb1c';
    context.fillRect(0, 0, img.width, img.height);

    context.globalCompositeOperation = 'source-over';

    const gradient = context.createLinearGradient(0, (img.height * 0.6), 0, img.height);

    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.25, 'rgba(0,0,0,0.5)');
    gradient.addColorStop(1, 'rgba(0,0,0,1)');

    context.fillStyle = gradient;
    context.fillRect(0, (img.height * 0.6), img.width, (img.height * 0.4));

    context.shadowBlur = 4;
    context.shadowColor = 'black';
    context.shadowOffsetX = -5;
    context.shadowOffsetY = 5;

    context.fillStyle = 'white';
    context.font = 'bold condensed 6rem Arial';
    context.fillText(interaction.options.getString('title').toUpperCase(), (img.width * 0.025), (img.height * 0.8), (img.width * 0.7));

    context.font = 'italic bold condensed 3.5rem Arial';
    context.fillText(`UCF VS ${interaction.options.getString('opponent').toUpperCase()}`, (img.width * 0.025), (img.height * 0.9), (img.width * 0.65));

    if (interaction.options.getAttachment('opponent-logo')) {
        const ucfLogo = await Canvas.loadImage('./1._Primary_Logo.png');
        const opponentLogo = await Canvas.loadImage(interaction.options.getAttachment('opponent-logo').url);

        context.drawImage(ucfLogo, (img.width * 0.025), (img.height * 0.025), (img.height * 0.1 * 0.787), (img.height * 0.1));

        context.font = 'bold condensed 3rem Arial';
        context.fillText('v', (img.width * 0.09), (img.height * 0.085));

        const ratio = opponentLogo.width / opponentLogo.height;
        context.drawImage(opponentLogo, (img.width * 0.15), (img.height * 0.02), (img.height * 0.1 * ratio), (img.height * 0.1));
    }

    const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'yt-thumbnail-template.png' });

    interaction.editReply({ files: [attachment] });
}

module.exports = {
    data,
    execute,
};
const { SlashCommandBuilder } = require('discord.js');
const Canvas = require('@napi-rs/canvas');

const data = new SlashCommandBuilder()
    .setName('generate')
    .setDescription('Generates an image based on command and template')
    .addSubCommand(subcommand =>
        subcommand
            .setName('youtube-template')
            .setDescription('Youtube Stream Thumbnail template')
            .addStringOption(option =>
                option
                    .setName('league-title-and-game')
                    .setDescription('Set the league and game being played')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option
                    .setName('team1')
                    .setDescription('Set first team')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option
                    .setName('team2')
                    .setDescription('Set first team')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option
                    .setName('background-image-link')
                    .setDescription('Link to background image // ignore if using attachment')
            )
            .addStringOption(option =>
                option
                    .setName('league-logo-link')
                    .setDescription('Link to logo of the league // ignore if using attachment')
            )
            .addAttachmentOption(option =>
                 option
                    .setName('background-image-file')
                    .setDescription('File to background image // ignore if using a link')
            )
            .addAttachmentOption(option =>
                option
                    .setName('league-logo-file')
                    .setDescription('File to logo of the league // ignore if using a link')
            )
    );

module.exports = {
    cooldown: 15,
    data,
    async execute(interaction) {
        await interaction.deferReply();
        const options = interaction.options;
        const canvas = Canvas.createCanvas(1920, 1080);
        const context = canvas.getContext('2d');
        
        let background = options.getSubCommand('youtube-template').getString('background-image-link');
        if (background) {
            background = await Canvas.loadImage(background);
        } else {
            background = await Canvas.loadImage(options.getSubCommand('youtube-template').getAttachment('background-image-file').url);
        }

        let logo = options.getSubCommand('youtube-template').getString('league-logo-link');
        if (logo) {
            logo = await Canvas.loadImage(logo);
        } else {
            logo = await Canvas.loadImage(options.getSubCommand('youtube-template').getAttachment('leauge-logo-file').url);
        }

        
    }
}
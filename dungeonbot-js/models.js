const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

const MatchTag = sequelize.define('match', {
    matchId: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    game: {
        type: Sequelize.ENUM('apex', 'cod', 'cs', 'lol', 'ow', 'r6', 'rl', 'spl', 'ssb', 'val'),
        allowNull: false,
    },
    team: {
        type: Sequelize.ENUM('UCF Knights', 'UCF Knights Academy', 'UCF Knights Rising', 'UCF Knights Pink'),
        allowNull: false,
    },
    opponent: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    date: {
        type: Sequelize.DATE,
        allowNull: false,
    },
    title: Sequelize.STRING,
    eventLeague: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    bracket: Sequelize.TEXT,
    stream: Sequelize.TEXT,
    socials: Sequelize.STRING,
    isWin: Sequelize.BOOLEAN,
    ucfScore: {
        type: Sequelize.SMALLINT,
        defaultValue: 0,
        allowNull: false,
    },
    opponentScore: {
        type: Sequelize.SMALLINT,
        defaultValue: 0,
        allowNull: false,
    },
    eventId1: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    eventId2: {
        type: Sequelize.STRING,
        allowNull: false,
    },
});

module.exports = MatchTag;
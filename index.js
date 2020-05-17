require('dotenv').config()

const mongoose = require('mongoose');

const Discord = require('discord.js');
const client = new Discord.Client();

client.log = require('./functions/log.js');

//commands
client.commands = new Discord.Collection();
client.commands.set('ping', require('./commands/ping'));
client.commands.set('rechere', require('./commands/rechere'));

//events
client.on('ready', () => require('./events/ready.js')(client));
client.on('message', message => require('./events/message.js')(client, message));
client.on('guildCreate', guild => require('./events/guildCreate.js')(client, guild));
client.on('voiceStateUpdate', (oldState, newState) => require('./events/voiceStateUpdated.js')(client, oldState, newState));


async function start() {
    try {
        await mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        });
        client.log('Log', 'MongoDB connected', 'MongoDB')

        client.login(process.env.DISCORD_TOKEN);;
    } catch (e) {
        client.log('Error', e, 'MongoDB');
    }
}

start();
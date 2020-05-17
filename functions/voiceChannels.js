const Guild = require('../models/Guild');
const Discord = require('discord.js');
const lame = require('@suldashi/lame');
const fs = require('fs');

// make a new stream for each time someone starts to talk
function generateOutputFile(channel, member) {
    // use IDs instead of username cause some people have stupid emojis in their name
    const fileName = `./recordings/${channel.id}-${member.id}-${Date.now()}.mp3`;
    return [fs.createWriteStream(fileName), fileName];
};

async function onUserSpeaking(user, speaking) {
    //console.log(user);
    if (speaking.bitfield) {
        var encoder = new lame.Encoder({
            // input
            channels: 2, // 2 channels (left and right)
            bitDepth: 16, // 16-bit samples
            sampleRate: 48000, // 44,100 Hz sample rate

            // output
            bitRate: 128,
            outSampleRate: 22050,
            mode: lame.STEREO // STEREO (default), JOINTSTEREO, DUALCHANNEL or MONO
        });

        const audioStream = receiver.createStream(user, { mode: "pcm", end: "silence" });

        const [outputStream, filename] = generateOutputFile(channel, user);

        audioStream.pipe(encoder);
        encoder.pipe(outputStream);

        audioStream.on('end', () => {
            outputStream.close();
            connection.play(filename);
        });
    } else {

    }
};



module.exports.create = async(client, guild) => {
    try {
        result = await guild.channels.create(process.env.DEFAULT_VOICE_CHANNEL_NAME, {
            type: "voice",
            userLimit: 2,
            reason: "channel for voice messages",
            bitrate: 96000,
            permissionOverwrites: [{
                    id: client.user.id,
                    allow: [Discord.Permissions.FLAGS.VIEW_CHANNEL,
                        Discord.Permissions.FLAGS.SPEAK,
                        Discord.Permissions.FLAGS.CONNECT
                    ],
                },
                {
                    id: guild.roles.everyone.id,
                    allow: new Discord.Permissions([Discord.Permissions.FLAGS.VIEW_CHANNEL,
                        Discord.Permissions.FLAGS.SPEAK,
                        Discord.Permissions.FLAGS.CONNECT
                    ])
                },
            ]
        });
    } catch (e) {
        console.error(e);
        result = null
    };
    return result;
};

module.exports.find = async(client, guild) => {
    try {
        doc = await Guild.findOne({ guild_id: guild.id });
        if (doc) {
            channel = await client.channels.cache.get(doc.voice_channel_id);
        } else {
            channel = null;
        }
    } catch {
        channel = null;
    }
    return channel;
};

module.exports.join = async(client, channel) => {
    let connection = await channel.join();
    client.log('Log', `Joined channel ${channel}`);

    const receiver = connection.receiver;
    let disp = connection.play('./beep.mp3')
    disp.on('finish', () => {
        console.log('finish')
            //connection.disconnect();
    });
    connection.on('speaking', (user, speaking) => { onUserSpeaking(user, speaking) });

};

module.exports.save = async(client, guild, channel) => {
    result = await Guild.findOneAndUpdate({ guild_id: guild.id }, { voice_channel_id: channel.id });
    if (!result) {
        guild = new Guild({ guild_id: guild.id, voice_channel_id: channel.id });
        result = await guild.save();
    }
    return result;
};

module.exports.joinAll = async(client) => {
    let docs = await Guild.find({});

    docs.forEach(async(item, i, arr) => {
        channel = client.channels.cache.get(item.voice_channel_id);
        await this.join(client, channel);
    })
};
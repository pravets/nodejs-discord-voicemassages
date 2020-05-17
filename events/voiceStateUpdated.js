const lame = require('@suldashi/lame');
const fs = require('fs');

module.exports = async(client, oldState, newState) => {

    const user = oldState.member.user;

    if (user.bot) { return }

    const guild = oldState.guild;
    const voiceMsgChannel = await require('../functions/voiceChannels').find(client, guild);

    if (newState.channel) {

        if (newState.channel === voiceMsgChannel) {
            client.log('Log', `Member ${newState.member.displayName} joined to voice msg`);
            let connection = await voiceMsgChannel.join();
            const receiver = connection.receiver;
            let disp = connection.play('./static/beep.mp3');
            fs.stat('./static/beep.mp3', (err, stats) => {
                if (err) {
                    console.error(err)
                    return
                }
                stats.isFile() //true
                stats.isDirectory() //false
                stats.isSymbolicLink() //false
                stats.size //1024000 //= 1MB
            })
            setTimeout(() => disp.end(), 100);

            const [outputStream, filenamePCM] = generateOutputFile(voiceMsgChannel, user, 'pcm');

            connection.on('speaking', (user, speaking) => {
                if (speaking.bitfield) {
                    const audioStream = receiver.createStream(user, { mode: "pcm", end: "silence" });

                    audioStream.on('data', (chunk) => { outputStream.write(chunk) })
                }

            });

            client[`VoiceMessage${guild.id}`] = {};
            client[`VoiceMessage${guild.id}`].outputStream = outputStream;
            client[`VoiceMessage${guild.id}`].filename = filenamePCM;
        }
    } else {
        if (oldState.channel === voiceMsgChannel && client[`VoiceMessage${guild.id}`]) {
            client.log('Log', `Member ${newState.member.displayName} leave voice msg`);
            await voiceMsgChannel.leave();


            const [outputStream, filenameMP3] = generateOutputFile(voiceMsgChannel, user, 'mp3');
            let pcmStream = fs.createReadStream(client[`VoiceMessage${guild.id}`].filename);

            var encoder = new lame.Encoder({
                // input
                channels: 2,
                bitDepth: 16,
                sampleRate: 48000,

                // output
                bitRate: 128,
                outSampleRate: 22050,
                mode: lame.STEREO
            });

            pcmStream.pipe(encoder);
            encoder.pipe(outputStream)
            outputStream.on('close', () => {
                console.error('done!');
                newState.member.send({ files: [filenameMP3] });
                client[`VoiceMessage${guild.id}`].outputStream.close();
                client[`VoiceMessage${guild.id}`] = null;
            });
        }
    }

};

function generateOutputFile(channel, member, type) {
    // use IDs instead of username cause some people have stupid emojis in their name
    const fileName = `./recordings/${channel.id}-${member.id}-${Date.now()}.${type}`;
    return [fs.createWriteStream(fileName), fileName];
};
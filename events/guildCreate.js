channelsFunc = require('../functions/voiceChannels');

module.exports = async(client, guild) => {
    client.log('Log', `I have been added to the guild: ${guild.name}, Owned by: ${guild.owner.user.tag}, with ${guild.memberCount} members.`);
    let channel = await channelsFunc.find(client, guild);
    if (!channel) {
        channel = await channelsFunc.create(client, guild);
        await channelsFunc.save(client, guild, channel);
    }
};
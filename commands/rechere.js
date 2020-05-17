const UserConfig = require('../models/UserConfig');

module.exports = async(client, message, args) => {
    try {
        result = await UserConfig.findOneAndUpdate({ guild_id: message.guild.id, user_id: message.member.id }, { channel_id: message.channel.id });
        if (!result) {
            guild = new UserConfig({ guild_id: message.guild.id, user_id: message.member.id, channel_id: message.channel.id });
            result = await guild.save();
        }
        message.reply('config updated');
    } catch {
        message.reply('config NOT updated');
    }
    return result;
};
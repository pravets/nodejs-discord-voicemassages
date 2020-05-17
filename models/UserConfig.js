const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
    guild_id: { type: String, required: true },
    user_id: { type: String, required: true },
    channel_id: { type: String, required: true },
})

module.exports = model('UserConfig', schema)
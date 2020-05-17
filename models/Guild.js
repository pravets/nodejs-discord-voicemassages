const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
    guild_id: { type: String, required: true, unique: true },
    voice_channel_id: { type: String, required: true },
})

module.exports = model('Guild', schema)
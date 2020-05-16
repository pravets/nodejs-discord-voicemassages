module.exports = (client, message) => {
    if (message.author.bot) return;

    if (message.content.indexOf(process.env.DISCORD_PREFIX) !== 0) return;

    const args = message.content.slice(process.env.DISCORD_PREFIX.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (client.commands.has(command)) {
        client.commands.get(command)(client, message, args);
    }
};
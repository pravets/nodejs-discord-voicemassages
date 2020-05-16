module.exports = (client) => {
    client.log('Log', `Logged in as ${client.user.tag}!`);
    client.generateInvite([3196944]).then(link => { client.log('Log', `${link}`, 'Invite'); });
};
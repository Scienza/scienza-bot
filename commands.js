
const Promise = require('bluebird')

module.exports = ({
    bot,
    models,
}) => {
    bot.onText(/\/get ([A-Za-z]+)/, async (msg, match) => {
        const user = await models.User.findOne({
            where: {
                username: match[1]
            }
        })
        return bot.sendMessage(msg.chat.id, user ? 'User has id ' + user.id : 'No user with that username lol')
    })

    bot.onText(/^\/add ([A-Za-z]+)/, async (msg, match) => {
        const username = match[1]

        const user = await models.User.create({
            username,
        })

        return bot.sendMessage(msg.chat.id, 'Added ' + user.id)
    })
}
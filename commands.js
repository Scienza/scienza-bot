
const Promise = require('bluebird')
const { Op } = require('sequelize')

module.exports = ({
    bot,
    models,
}) => {
    bot.onText(/\/get ([A-Za-z]+)/, async (msg, match) => {
        const user = await models.User.findOne({
            where: {
                username: match[1]
            },
            include: [
                models.Category,
            ]
        })
        return bot.sendMessage(msg.chat.id, user ? JSON.stringify(user.get()) : 'No user')
    })

    bot.onText(/^\/add/, async (msg, match) => {
        const parts = msg.text.split(' ')

        const [
            cmd,
            username,
            ...categories
        ] = parts

        const user = await models.User.findOne({
            where: {
                username,
            }
        })

        console.log('categories', categories)

        await models.Category.findAll({
            where: {
                name: {
                    [Op.in]: categories
                }
            }
        }).map(category => {
            return models.UserCategory.create({
                user_id: user.id,
                category_id: category.id,
            })
        })

        return bot.sendMessage(msg.chat.id, 'Added to categories')
    })
}
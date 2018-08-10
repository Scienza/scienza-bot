
const Promise = require('bluebird')
const { Op } = require('sequelize')
const constants = require('./constants')
const moment = require('moment')
const {
    isAdmin,
    formatDisplayName,
    formatUsername,
    capitalise,
} = require('./lib/bot-utils')

module.exports = ({
    bot,
    models,
}) => {

    bot.onText(/^\/me$/, async msg => {
        const {
            from: {
                id: telegram_id,
                first_name,
                last_name,
                username
            }
        } = msg

        const user = await models.User.findOne({
            where: {
                telegram_id,
            },
            include: [
                models.Category,
            ]
        })

        if (!user) {
            return bot.sendMessage(msg.chat.id, 'User not found!!!!!!!!!!')
        }

        const data = [
            `Name: ${formatDisplayName(first_name, last_name)}`,
            `Username: ${formatUsername(username)}`,
            `Categories: ${user.Categories.length ? user.Categories.map(cat => cat.title).join(' ') : 'None'}`,
            `First seen: ${moment(user.created_at).toISOString()}`
        ].join('\n')

        return bot.sendMessage(msg.chat.id, data)
    })

    bot.onText(/^\/subscribe\s+([a-z\s]+)$/i, async (msg, match) => {
        const categories = match[1].split(' ')

        const {
            from: {
                id: telegram_id,
            }
        } = msg

        const response = []

        if (!categories.length) {
            return bot.sendMessage(msg.chat.id, 'No categories specified')
        }

        const user = await models.User.findOne({
            where: {
                telegram_id,
            }
        })

        if (!user) {
            return bot.sendMessage(msg.chat.id, 'User not found! Please introduce yourself with /register')
        }

        const categoryInstances = await models.Category.findAll({
            where: {
                name: {
                    [Op.in]: categories
                }
            }
        })


        const notFoundCategories = categories.reduce((acc, category) => {
            return categoryInstances.find(instance => instance.name === category) ? acc : [ ...acc, category ]
        }, [])

        if (notFoundCategories.length < categoryInstances.length) {
            response.push('Added to categories: ' + categoryInstances.map(cat => cat.name).join(' '))
        }

        if (notFoundCategories.length) {
            response.push('Categories not found: ' + notFoundCategories.join(' '))
        }

        console.log(categoryInstances.length, notFoundCategories.length)

        await Promise.map(categoryInstances, category => {
            return models.UserCategory.findOrCreate({
                where: {
                    user_id: user.id,
                    category_id: category.id,
                }
            })
        })

        return bot.sendMessage(msg.chat.id, response.join('\n'))
    })

    bot.onText(/^\/unsubscribe\s+([a-z\s]+)$/i, async (msg, match) => {
        const categories = match[1].split(' ')

        const {
            from: {
                id: telegram_id,
            }
        } = msg

        const response = []

        if (!categories.length) {
            return bot.sendMessage(msg.chat.id, 'No categories specified')
        }

        const user = await models.User.findOne({
            where: {
                telegram_id,
            }
        })

        if (!user) {
            return bot.sendMessage(msg.chat.id, 'User not found! Please introduce yourself with /nyaasu')
        }

        const categoryInstances = await models.Category.findAll({
            where: {
                name: {
                    [Op.in]: categories
                }
            }
        })


        const notFoundCategories = categories.reduce((acc, category) => {
            return categoryInstances.find(instance => instance.name === category) ? acc : [ ...acc, category ]
        }, [])

        if (notFoundCategories.length < categoryInstances.length) {
            response.push('Unsubscribed from categories: ' + categoryInstances.map(cat => cat.name).join(' '))
        }

        if (notFoundCategories.length) {
            response.push('Categories not found: ' + notFoundCategories.join(' '))
        }

        console.log(categoryInstances.length, notFoundCategories.length)

        await models.UserCategory.destroy({
            where: {
                user_id: user.id,
                category_id: {
                    [Op.in]: categoryInstances.map(instance => instance.id)
                },
            }
        })

        return bot.sendMessage(msg.chat.id, response.join('\n'))
    })

    bot.onText(/^\/category_define\s+([a-z]+)\s+([a-z]+)/i, async (msg, match) => {
        const [nyaasu, name, title] = match

        const category = await models.Category.findOne({
            where: {
                [Op.or]: {
                    name,
                    title,
                }
            }
        })

        if (category) {
            return bot.sendMessage(msg.chat.id, 'Category already exists!')
        }

        await models.Category.create({
            name,
            title,
        })

        return bot.sendMessage(msg.chat.id, `Category ${name} created!`)
    })

    bot.onText(/^\/register$/i, async msg => {
        const {
            from: {
                id: telegram_id,
                first_name,
                last_name,
                username,
            }
        } = msg

        if (!username) {
            return bot.sendMessage(msg.chat.id, 'Please set an username first!')
        }

        const existingUser = await models.User.findOne({
            where: {
                telegram_id,
            }
        })

        if (existingUser) {
            return bot.sendMessage(msg.chat.id, 'You already exist!')
        }

        await models.User.create({
            telegram_id,
            first_name,
            last_name,
            username,
        })

        return bot.sendMessage(msg.chat.id, 'Registrato! BUON GIORNISSIMO       !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! KAFFEEEEEEEeeëeéeè?????????????????????')
    })

    bot.onText(/^\/invoke\s+([a-z]+)$/, async (msg, match) => {
        const categoryName = match[1]

        const category = await models.Category.findOne({
            where: {
                [Op.or]: {
                    title: categoryName,
                    name: categoryName,
                }
            },
            include: [models.User]
        })

        if (!category) {
            return bot.sendMessage(msg.chat.id, `Category ${categoryName} does not exist!`)
        }

        const response = `${capitalise(category.title)}, a rapporto! ${category.Users.map(user => formatUsername(user.username)).sort().join(' ')}`

        return bot.sendMessage(msg.chat.id, response)
    })

    bot.onText(/^\/category_list$/, async msg => {
        const categories = await models.Category.findAll()

        return bot.sendMessage(msg.chat.id, categories.map(category => category.name).join(' '))
    })
}

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
            return bot.sendMessage(msg.chat.id, 'Non sei registrato! Usa /registra per registrarti')
        }

        const data = [
            `Name: ${formatDisplayName(first_name, last_name)}`,
            `Username: ${formatUsername(username)}`,
            `Categorie: ${user.Categories.length ? user.Categories.map(cat => cat.title).join(' ') : 'None'}`,
            `Registrato il ${moment(user.created_at).toISOString()}`
        ].join('\n')

        return bot.sendMessage(msg.chat.id, data)
    })

    bot.onText(/^\/iscrivi\s+([a-z\s]+)$/i, async (msg, match) => {
        const categories = match[1].split(' ')

        const {
            from: {
                id: telegram_id,
            }
        } = msg

        const response = []

        if (!categories.length) {
            return bot.sendMessage(msg.chat.id, 'Nessuna categoria specificata!')
        }

        const user = await models.User.findOne({
            where: {
                telegram_id,
            }
        })

        if (!user) {
            return bot.sendMessage(msg.chat.id, 'Non sei registrato! Usa /registra per registrarti')
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
            response.push('Aggiungo alle categorie: ' + categoryInstances.map(cat => cat.name).join(' '))
        }

        if (notFoundCategories.length) {
            response.push('Categorie non trovate: ' + notFoundCategories.join(' '))
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

    bot.onText(/^\/disiscrivi\s+([a-z\s]+)$/i, async (msg, match) => {
        const categories = match[1].split(' ')

        const {
            from: {
                id: telegram_id,
            }
        } = msg

        const response = []

        if (!categories.length) {
            return bot.sendMessage(msg.chat.id, 'Nessuna categoria specificata!')
        }

        const user = await models.User.findOne({
            where: {
                telegram_id,
            }
        })

        if (!user) {
            return bot.sendMessage(msg.chat.id, 'Non sei registrato! Usa /registra per registrarti')
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
            response.push('Disiscritto da: ' + categoryInstances.map(cat => cat.name).join(' '))
        }

        if (notFoundCategories.length) {
            response.push('Categorie non trovate: ' + notFoundCategories.join(' '))
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

    bot.onText(/^\/aggiungi_categoria\s+([a-z]+)\s+([a-z]+)/i, async (msg, match) => {
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
            return bot.sendMessage(msg.chat.id, 'La categoria già esiste!')
        }

        await models.Category.create({
            name,
            title,
        })

        return bot.sendMessage(msg.chat.id, `Categoria ${name} creata!`)
    })

    bot.onText(/^\/registra$/i, async msg => {
        const {
            from: {
                id: telegram_id,
                first_name,
                last_name,
                username,
            }
        } = msg

        if (!username) {
            return bot.sendMessage(msg.chat.id, 'Imposta un username per registrarti!')
        }

        const existingUser = await models.User.findOne({
            where: {
                telegram_id,
            }
        })

        if (existingUser) {
            return bot.sendMessage(msg.chat.id, 'Sei già iscritto!')
        }

        await models.User.create({
            telegram_id,
            first_name,
            last_name,
            username,
        })

        return bot.sendMessage(msg.chat.id, 'Registrato! BUON GIORNISSIMO       !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! KAFFEEEEEEEeeëeéeè?????????????????????')
    })

    bot.onText(/^\/chiama\s+([a-z]+)$/, async (msg, match) => {
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
            return bot.sendMessage(msg.chat.id, `La categoria ${categoryName} non esiste!`)
        }

        const response = `${capitalise(category.title)}, a rapporto! ${category.Users.map(user => formatUsername(user.username)).sort().join(' ')}`

        return bot.sendMessage(msg.chat.id, response)
    })

    bot.onText(/^\/categorie$/, async msg => {
        const categories = await models.Category.findAll()

        return bot.sendMessage(msg.chat.id, categories.map(category => category.name).join(' '))
    })
}
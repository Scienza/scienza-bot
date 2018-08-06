
const ORM = require('./orm')
const handlers = require('../commands')

const Bot = require('node-telegram-bot-api')

require('dotenv').config({ silent: true })

async function run() {
    const orm = await ORM({
        host: process.env.DB_HOST,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        dialect: 'mysql',
    })
    
    const bot = new Bot(process.env.BOT_TOKEN, { polling: process.env.BOT_POLLING === 'true' })
    
    return handlers({
        bot,
        models: orm.models,
        orm,
    })
}

run()
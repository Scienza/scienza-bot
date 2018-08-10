const Sequelize = require('sequelize')
const Promise = require('bluebird')
const fs = require('fs')
const path = require('path')

module.exports = config => {

    const sequelize = new Sequelize({
        ...config,
        operatorsAliases: false,
        define: {
            paranoid: true,
            underscored: true
        }
    })

    const models = loadModels()
    
    return sequelize.sync()

    function loadModels() {
        console.log(__dirname.replace('lib', 'models'))
        const files = fs.readdirSync(__dirname.replace('lib', 'models'))
        const models = files.map(file => {
            return sequelize.import('../models/' + file)
        }).reduce((acc, model) => {
            acc[model.name] = model
            return acc
        }, {})

        for (const modelName in models) {
            if (models[modelName].associate) {
                models[modelName].associate(models)
            }
        }

        for (const modelName in models) {
            if (models[modelName].reopen) {
                models[modelName].reopen(models, sequelize)
            }
        }

        return models
    }
}
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
        const files = fs.readdirSync(path.join(__dirname, '/../models'))
        
        const models = files.map(file => {
            return sequelize.import('../models/' + file)
        }).reduce((acc, model) => {
            acc[model.constructor.name] = model
        }, {})

        for (const modelName in models) {
            if (models[modelName].associate) {
                models[modelName].associate(models)
            }
        }

        return models
    }
}
const Promise = require('bluebird')

module.exports = (sequelize, DataTypes) => {
    const UserCategory = sequelize.define('UserCategory', {
        id: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
        },
    })

    UserCategory.associate = models => {
        UserCategory.belongsTo(models.User, { constraints: false })
        UserCategory.belongsTo(models.Category, { constraints: false })
    }

    return UserCategory
}
const Promise = require('bluebird')

module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define('Category', {
        id: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(128),
            allowNull: true,
        },
    })

    Category.associate = models => {
        Category.belongsToMany(models.User, { constraints: false, through: models.UserCategory })
    }

    return Category
}
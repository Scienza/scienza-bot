const Promise = require('bluebird')

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
        },
        username: {
            type: DataTypes.STRING(128),
            allowNull: true,
        },
    })

    User.associate = models => {
        User.belongsToMany(models.Category, { constraints: false, through: models.UserCategory })
    }

    return User
}
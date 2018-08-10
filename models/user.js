const Promise = require('bluebird')

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
        },
        telegram_id: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING(128),
            allowNull: true,
        },
        first_name: {
            type: DataTypes.STRING(128),
            allowNull: false,
        },
        last_name: {
            type: DataTypes.STRING(128),
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        }
    })

    User.associate = models => {
        User.belongsToMany(models.Category, { constraints: false, through: models.UserCategory })
    }

    return User
}
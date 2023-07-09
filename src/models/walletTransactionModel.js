const { round } = require('../utils');
const Wallet = require('./index').wallet;
const DataTypes = require('sequelize').DataTypes;
const { DEPOSIT, WITHDRAWAL, REPAYMENT } = require('../config/constants').walletTransactionTypes;
const roundColumns = ['amount', 'postTransactionBalance'];

const walletTransaction =  (sequelize) => {
    const walletTransaction = sequelize.define( "walletTransaction", {
        walletId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Wallet, 
                key: 'id'
            }
        },
        type: {
            type: DataTypes.ENUM(DEPOSIT, WITHDRAWAL, REPAYMENT),
            allowNull: false,
        },
        amount: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        postTransactionBalance: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        referanceId : {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            comment: 'RPS id in case of loan repayment'
        },
        remark: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
        }
    }, {
        timestamps: true,
        indexes: [
            {
                fields: ['walletId'],
            },
            {
                fields: ['type'],
            },
            {
                fields: ['referanceId'],
            },
        ],
    })
    
    walletTransaction.associate = function(models) {
        walletTransaction.belongsTo(models.wallet, {foreignKey: 'walletId', as: 'walletTransactions'})
    };


    walletTransaction.addHook('beforeCreate', function(walletTxn) {
        Object.keys(walletTxn).forEach(key => {
            if(roundColumns.includes(key) && walletTxn[key]) walletTxn[key] = round(walletTxn[key], 2);
        });
    });

    walletTransaction.addHook('beforeUpdate', function(walletTxn) {
        Object.keys(walletTxn).forEach(key => {
            if(roundColumns.includes(key) && walletTxn[key]) walletTxn[key] = round(walletTxn[key], 2);
        });
    });

    return walletTransaction;
}

module.exports = walletTransaction;

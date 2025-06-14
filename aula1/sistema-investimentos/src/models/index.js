const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// Importar modelos
const User = require('./User')(sequelize, DataTypes);
const Asset = require('./Asset')(sequelize, DataTypes);
const Portfolio = require('./Portfolio')(sequelize, DataTypes);
const Transaction = require('./Transaction')(sequelize, DataTypes);
const PortfolioAsset = require('./PortfolioAsset')(sequelize, DataTypes);

// Definir relacionamentos entre modelos

// User - Portfolio (1:1)
User.hasOne(Portfolio, {
  foreignKey: 'user_id',
  as: 'portfolio',
  onDelete: 'CASCADE'
});
Portfolio.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// User - Transaction (1:N)
User.hasMany(Transaction, {
  foreignKey: 'user_id',
  as: 'transactions',
  onDelete: 'CASCADE'
});
Transaction.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Asset - Transaction (1:N)
Asset.hasMany(Transaction, {
  foreignKey: 'asset_id',
  as: 'transactions'
});
Transaction.belongsTo(Asset, {
  foreignKey: 'asset_id',
  as: 'asset'
});

// Portfolio - PortfolioAsset (1:N)
Portfolio.hasMany(PortfolioAsset, {
  foreignKey: 'portfolio_id',
  as: 'assets',
  onDelete: 'CASCADE'
});
PortfolioAsset.belongsTo(Portfolio, {
  foreignKey: 'portfolio_id',
  as: 'portfolio'
});

// Asset - PortfolioAsset (1:N)
Asset.hasMany(PortfolioAsset, {
  foreignKey: 'asset_id',
  as: 'portfolioAssets'
});
PortfolioAsset.belongsTo(Asset, {
  foreignKey: 'asset_id',
  as: 'asset'
});

// Relacionamento Many-to-Many: Portfolio - Asset através de PortfolioAsset
Portfolio.belongsToMany(Asset, {
  through: PortfolioAsset,
  foreignKey: 'portfolio_id',
  otherKey: 'asset_id',
  as: 'portfolioAssets'
});

Asset.belongsToMany(Portfolio, {
  through: PortfolioAsset,
  foreignKey: 'asset_id',
  otherKey: 'portfolio_id',
  as: 'portfolios'
});

// Exportar modelos e sequelize
const db = {
  sequelize,
  User,
  Asset,
  Portfolio,
  Transaction,
  PortfolioAsset
};

module.exports = db; 
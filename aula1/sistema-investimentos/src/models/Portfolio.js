/**
 * @swagger
 * components:
 *   schemas:
 *     Portfolio:
 *       type: object
 *       required:
 *         - user_id
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único do portfólio
 *         user_id:
 *           type: integer
 *           description: ID do usuário proprietário
 *         total_invested:
 *           type: number
 *           format: decimal
 *           description: Valor total investido
 *         current_value:
 *           type: number
 *           format: decimal
 *           description: Valor atual do portfólio
 *         profit_loss:
 *           type: number
 *           format: decimal
 *           description: Lucro/Prejuízo total
 *         profit_loss_percentage:
 *           type: number
 *           format: decimal
 *           description: Percentual de lucro/prejuízo
 *         total_dividends:
 *           type: number
 *           format: decimal
 *           description: Total de dividendos recebidos
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

const { formatCurrency } = require('../../format');

module.exports = (sequelize, DataTypes) => {
  const Portfolio = sequelize.define('portfolios', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: {
        msg: 'Usuário já possui um portfólio'
      },
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    total_invested: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: {
          args: [0],
          msg: 'Total investido não pode ser negativo'
        }
      }
    },
    current_value: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: {
          args: [0],
          msg: 'Valor atual não pode ser negativo'
        }
      }
    },
    profit_loss: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    profit_loss_percentage: {
      type: DataTypes.DECIMAL(8, 4),
      allowNull: false,
      defaultValue: 0.0000
    },
    total_dividends: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: {
          args: [0],
          msg: 'Total de dividendos não pode ser negativo'
        }
      }
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['user_id']
      }
    ],
    hooks: {
      beforeSave: (portfolio) => {
        // Recalcular lucro/prejuízo antes de salvar
        portfolio.profit_loss = parseFloat(portfolio.current_value) - parseFloat(portfolio.total_invested);
        
        // Calcular percentual de lucro/prejuízo
        if (parseFloat(portfolio.total_invested) > 0) {
          portfolio.profit_loss_percentage = (parseFloat(portfolio.profit_loss) / parseFloat(portfolio.total_invested)) * 100;
        } else {
          portfolio.profit_loss_percentage = 0;
        }
      }
    }
  });

  // Métodos de instância
  Portfolio.prototype.calculateDiversification = async function() {
    const PortfolioAsset = sequelize.models.portfolio_assets;
    const Asset = sequelize.models.assets;
    
    const assets = await PortfolioAsset.findAll({
      where: { portfolio_id: this.id, quantity: { [sequelize.Sequelize.Op.gt]: 0 } },
      include: [{
        model: Asset,
        as: 'asset',
        attributes: ['type', 'sector']
      }]
    });

    const diversification = {
      by_type: {},
      by_sector: {},
      total_positions: assets.length
    };

    let totalValue = 0;
    
    // Calcular valor total atual
    assets.forEach(asset => {
      const currentValue = parseFloat(asset.quantity) * parseFloat(asset.asset.current_price);
      totalValue += currentValue;
    });

    // Calcular distribuição por tipo e setor
    assets.forEach(asset => {
      const currentValue = parseFloat(asset.quantity) * parseFloat(asset.asset.current_price);
      const percentage = totalValue > 0 ? (currentValue / totalValue) * 100 : 0;
      
      // Por tipo
      const type = asset.asset.type;
      if (!diversification.by_type[type]) {
        diversification.by_type[type] = { value: 0, percentage: 0, count: 0 };
      }
      diversification.by_type[type].value += currentValue;
      diversification.by_type[type].percentage += percentage;
      diversification.by_type[type].count += 1;
      
      // Por setor (se disponível)
      if (asset.asset.sector) {
        const sector = asset.asset.sector;
        if (!diversification.by_sector[sector]) {
          diversification.by_sector[sector] = { value: 0, percentage: 0, count: 0 };
        }
        diversification.by_sector[sector].value += currentValue;
        diversification.by_sector[sector].percentage += percentage;
        diversification.by_sector[sector].count += 1;
      }
    });

    return diversification;
  };

  Portfolio.prototype.updateValues = async function(transaction = null) {
    const PortfolioAsset = sequelize.models.portfolio_assets;
    const Asset = sequelize.models.assets;
    
    const assets = await PortfolioAsset.findAll({
      where: { portfolio_id: this.id, quantity: { [sequelize.Sequelize.Op.gt]: 0 } },
      include: [{
        model: Asset,
        as: 'asset',
        attributes: ['current_price']
      }],
      transaction
    });

    let totalInvested = 0;
    let currentValue = 0;

    assets.forEach(asset => {
      totalInvested += parseFloat(asset.total_invested);
      currentValue += parseFloat(asset.quantity) * parseFloat(asset.asset.current_price);
    });

    return await this.update({
      total_invested: totalInvested,
      current_value: currentValue
    }, { transaction });
  };

  Portfolio.prototype.getTopAssets = async function(limit = 5) {
    const PortfolioAsset = sequelize.models.portfolio_assets;
    const Asset = sequelize.models.assets;
    
    return await PortfolioAsset.findAll({
      where: { portfolio_id: this.id, quantity: { [sequelize.Sequelize.Op.gt]: 0 } },
      include: [{
        model: Asset,
        as: 'asset',
        attributes: ['symbol', 'name', 'current_price']
      }],
      order: [
        [sequelize.literal('quantity * asset.current_price'), 'DESC']
      ],
      limit
    });
  };

  Portfolio.prototype.getFormattedData = function() {
    return {
      id: this.id,
      user_id: this.user_id,
      total_invested: formatCurrency(this.total_invested),
      current_value: formatCurrency(this.current_value),
      profit_loss: formatCurrency(this.profit_loss),
      profit_loss_percentage: parseFloat(this.profit_loss_percentage),
      total_dividends: formatCurrency(this.total_dividends),
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  };

  // Métodos de classe
  Portfolio.findByUserId = async function(userId) {
    return await this.findOne({
      where: { user_id: userId },
      include: ['user']
    });
  };

  Portfolio.createForUser = async function(userId, transaction = null) {
    return await this.create({
      user_id: userId,
      total_invested: 0.00,
      current_value: 0.00,
      profit_loss: 0.00,
      profit_loss_percentage: 0.0000,
      total_dividends: 0.00
    }, { transaction });
  };

  return Portfolio;
}; 
/**
 * @swagger
 * components:
 *   schemas:
 *     PortfolioAsset:
 *       type: object
 *       required:
 *         - portfolio_id
 *         - asset_id
 *         - quantity
 *         - average_price
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único da posição
 *         portfolio_id:
 *           type: integer
 *           description: ID do portfólio
 *         asset_id:
 *           type: integer
 *           description: ID do ativo
 *         quantity:
 *           type: number
 *           format: decimal
 *           description: Quantidade de ativos
 *         average_price:
 *           type: number
 *           format: decimal
 *           description: Preço médio de compra
 *         total_invested:
 *           type: number
 *           format: decimal
 *           description: Valor total investido
 *         current_value:
 *           type: number
 *           format: decimal
 *           description: Valor atual da posição
 *         profit_loss:
 *           type: number
 *           format: decimal
 *           description: Lucro/prejuízo da posição
 *         profit_loss_percentage:
 *           type: number
 *           format: decimal
 *           description: Percentual de lucro/prejuízo
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

const { formatCurrency } = require('../../format');

module.exports = (sequelize, DataTypes) => {
  const PortfolioAsset = sequelize.define('portfolio_assets', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    portfolio_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'portfolios',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    asset_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'assets',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    quantity: {
      type: DataTypes.DECIMAL(15, 8),
      allowNull: false,
      defaultValue: 0.00000000,
      validate: {
        min: {
          args: [0],
          msg: 'Quantidade não pode ser negativa'
        }
      }
    },
    average_price: {
      type: DataTypes.DECIMAL(15, 8),
      allowNull: false,
      defaultValue: 0.00000000,
      validate: {
        min: {
          args: [0],
          msg: 'Preço médio não pode ser negativo'
        }
      }
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
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['portfolio_id', 'asset_id']
      },
      {
        fields: ['portfolio_id']
      },
      {
        fields: ['asset_id']
      },
      {
        fields: ['quantity']
      }
    ],
    hooks: {
      beforeSave: async (portfolioAsset) => {
        // Buscar preço atual do ativo se disponível
        if (portfolioAsset.asset && portfolioAsset.asset.current_price) {
          const currentPrice = parseFloat(portfolioAsset.asset.current_price);
          portfolioAsset.current_value = parseFloat(portfolioAsset.quantity) * currentPrice;
        } else if (portfolioAsset.asset_id) {
          // Buscar preço atual do banco
          const Asset = sequelize.models.assets;
          const asset = await Asset.findByPk(portfolioAsset.asset_id);
          if (asset) {
            const currentPrice = parseFloat(asset.current_price);
            portfolioAsset.current_value = parseFloat(portfolioAsset.quantity) * currentPrice;
          }
        }

        // Calcular lucro/prejuízo
        portfolioAsset.profit_loss = parseFloat(portfolioAsset.current_value) - parseFloat(portfolioAsset.total_invested);
        
        // Calcular percentual de lucro/prejuízo
        if (parseFloat(portfolioAsset.total_invested) > 0) {
          portfolioAsset.profit_loss_percentage = (parseFloat(portfolioAsset.profit_loss) / parseFloat(portfolioAsset.total_invested)) * 100;
        } else {
          portfolioAsset.profit_loss_percentage = 0;
        }
      }
    }
  });

  // Métodos de instância
  PortfolioAsset.prototype.addTransaction = async function(transaction, transactionData) {
    const quantity = parseFloat(transactionData.quantity);
    const price = parseFloat(transactionData.price);
    const currentQuantity = parseFloat(this.quantity);
    const currentAvgPrice = parseFloat(this.average_price);
    const currentInvested = parseFloat(this.total_invested);

    if (transactionData.type === 'buy') {
      // Compra: recalcular preço médio e aumentar quantidade
      const newQuantity = currentQuantity + quantity;
      const newTotalInvested = currentInvested + (quantity * price);
      const newAveragePrice = newTotalInvested / newQuantity;

      return await this.update({
        quantity: newQuantity,
        average_price: newAveragePrice,
        total_invested: newTotalInvested
      }, { transaction });

    } else if (transactionData.type === 'sell') {
      // Venda: diminuir quantidade, manter preço médio
      const newQuantity = currentQuantity - quantity;
      const soldValue = quantity * currentAvgPrice;
      const newTotalInvested = currentInvested - soldValue;

      return await this.update({
        quantity: Math.max(0, newQuantity),
        total_invested: Math.max(0, newTotalInvested)
      }, { transaction });
    }
  };

  PortfolioAsset.prototype.updateCurrentValue = async function(currentPrice, transaction = null) {
    const newCurrentValue = parseFloat(this.quantity) * parseFloat(currentPrice);
    
    return await this.update({
      current_value: newCurrentValue
    }, { transaction });
  };

  PortfolioAsset.prototype.getFormattedData = function() {
    return {
      id: this.id,
      asset: this.asset ? {
        id: this.asset.id,
        symbol: this.asset.symbol,
        name: this.asset.name,
        type: this.asset.type,
        current_price: formatCurrency(this.asset.current_price)
      } : null,
      quantity: parseFloat(this.quantity),
      average_price: formatCurrency(this.average_price),
      total_invested: formatCurrency(this.total_invested),
      current_value: formatCurrency(this.current_value),
      profit_loss: formatCurrency(this.profit_loss),
      profit_loss_percentage: parseFloat(this.profit_loss_percentage),
      portfolio_percentage: 0 // será calculado no frontend
    };
  };

  // Métodos de classe
  PortfolioAsset.findByPortfolio = async function(portfolioId, includeZeroQuantity = false) {
    const whereClause = { portfolio_id: portfolioId };
    
    if (!includeZeroQuantity) {
      whereClause.quantity = { [sequelize.Sequelize.Op.gt]: 0 };
    }

    return await this.findAll({
      where: whereClause,
      include: [{
        model: sequelize.models.assets,
        as: 'asset',
        attributes: ['id', 'symbol', 'name', 'type', 'current_price', 'sector']
      }],
      order: [
        [sequelize.literal('current_value'), 'DESC']
      ]
    });
  };

  PortfolioAsset.findByAsset = async function(assetId) {
    return await this.findAll({
      where: { 
        asset_id: assetId,
        quantity: { [sequelize.Sequelize.Op.gt]: 0 }
      },
      include: [{
        model: sequelize.models.portfolios,
        as: 'portfolio',
        include: [{
          model: sequelize.models.users,
          as: 'user',
          attributes: ['name', 'email']
        }]
      }]
    });
  };

  PortfolioAsset.findOrCreatePosition = async function(portfolioId, assetId, transaction = null) {
    const [position, created] = await this.findOrCreate({
      where: {
        portfolio_id: portfolioId,
        asset_id: assetId
      },
      defaults: {
        quantity: 0,
        average_price: 0,
        total_invested: 0,
        current_value: 0,
        profit_loss: 0,
        profit_loss_percentage: 0
      },
      transaction
    });

    return { position, created };
  };

  PortfolioAsset.updateAllCurrentValues = async function(portfolioId, transaction = null) {
    const positions = await this.findAll({
      where: { 
        portfolio_id: portfolioId,
        quantity: { [sequelize.Sequelize.Op.gt]: 0 }
      },
      include: [{
        model: sequelize.models.assets,
        as: 'asset',
        attributes: ['current_price']
      }],
      transaction
    });

    const updatePromises = positions.map(position => {
      const currentValue = parseFloat(position.quantity) * parseFloat(position.asset.current_price);
      return position.update({ current_value: currentValue }, { transaction });
    });

    return await Promise.all(updatePromises);
  };

  return PortfolioAsset;
}; 
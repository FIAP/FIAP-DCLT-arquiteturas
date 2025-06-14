/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       required:
 *         - user_id
 *         - asset_id
 *         - type
 *         - quantity
 *         - price
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único da transação
 *         user_id:
 *           type: integer
 *           description: ID do usuário
 *         asset_id:
 *           type: integer
 *           description: ID do ativo
 *         type:
 *           type: string
 *           enum: [buy, sell, dividend]
 *           description: Tipo da transação
 *         quantity:
 *           type: number
 *           format: decimal
 *           description: Quantidade negociada
 *         price:
 *           type: number
 *           format: decimal
 *           description: Preço unitário na transação
 *         total_amount:
 *           type: number
 *           format: decimal
 *           description: Valor total da transação
 *         fees:
 *           type: number
 *           format: decimal
 *           description: Taxas da transação
 *         notes:
 *           type: string
 *           description: Observações da transação
 *         status:
 *           type: string
 *           enum: [pending, completed, cancelled]
 *           description: Status da transação
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

const { formatCurrency } = require('../../format');

module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('transactions', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
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
    type: {
      type: DataTypes.ENUM('buy', 'sell', 'dividend'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['buy', 'sell', 'dividend']],
          msg: 'Tipo deve ser: buy, sell ou dividend'
        }
      }
    },
    quantity: {
      type: DataTypes.DECIMAL(15, 8),
      allowNull: false,
      validate: {
        min: {
          args: [0.00000001],
          msg: 'Quantidade deve ser maior que zero'
        }
      }
    },
    price: {
      type: DataTypes.DECIMAL(15, 8),
      allowNull: false,
      validate: {
        min: {
          args: [0.00000001],
          msg: 'Preço deve ser maior que zero'
        }
      }
    },
    total_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'Valor total não pode ser negativo'
        }
      }
    },
    fees: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: {
          args: [0],
          msg: 'Taxas não podem ser negativas'
        }
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'completed',
      validate: {
        isIn: {
          args: [['pending', 'completed', 'cancelled']],
          msg: 'Status deve ser: pending, completed ou cancelled'
        }
      }
    }
  }, {
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['asset_id']
      },
      {
        fields: ['type']
      },
      {
        fields: ['status']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['user_id', 'asset_id']
      }
    ],
    hooks: {
      beforeValidate: (transaction) => {
        // Calcular valor total baseado na quantidade e preço
        const quantity = parseFloat(transaction.quantity);
        const price = parseFloat(transaction.price);
        transaction.total_amount = quantity * price;
      }
    }
  });

  // Métodos de instância
  Transaction.prototype.calculateFees = function(feeRate = 0.001) {
    // Taxa padrão de 0.1% (0.001)
    const fees = parseFloat(this.total_amount) * feeRate;
    return parseFloat(fees.toFixed(2));
  };

  Transaction.prototype.getTotalCost = function() {
    // Para compras: valor total + taxas
    // Para vendas: valor total - taxas
    const totalAmount = parseFloat(this.total_amount);
    const fees = parseFloat(this.fees);
    
    if (this.type === 'buy') {
      return totalAmount + fees;
    } else if (this.type === 'sell') {
      return totalAmount - fees;
    } else {
      return totalAmount; // dividendos não têm taxas normalmente
    }
  };

  Transaction.prototype.getFormattedData = function() {
    return {
      id: this.id,
      type: this.type,
      asset_symbol: this.asset ? this.asset.symbol : null,
      asset_name: this.asset ? this.asset.name : null,
      quantity: parseFloat(this.quantity),
      price: formatCurrency(this.price),
      total_amount: formatCurrency(this.total_amount),
      fees: formatCurrency(this.fees),
      total_cost: formatCurrency(this.getTotalCost()),
      notes: this.notes,
      status: this.status,
      date: this.created_at
    };
  };

  // Métodos de classe
  Transaction.findByUser = async function(userId, options = {}) {
    const defaultOptions = {
      where: { user_id: userId },
      include: [{
        model: sequelize.models.assets,
        as: 'asset',
        attributes: ['symbol', 'name', 'type']
      }],
      order: [['created_at', 'DESC']]
    };
    
    return await this.findAll({ ...defaultOptions, ...options });
  };

  Transaction.findByAsset = async function(assetId, options = {}) {
    const defaultOptions = {
      where: { asset_id: assetId },
      include: [{
        model: sequelize.models.users,
        as: 'user',
        attributes: ['name', 'email']
      }],
      order: [['created_at', 'DESC']]
    };
    
    return await this.findAll({ ...defaultOptions, ...options });
  };

  Transaction.findByUserAndAsset = async function(userId, assetId, options = {}) {
    const defaultOptions = {
      where: { 
        user_id: userId,
        asset_id: assetId 
      },
      order: [['created_at', 'DESC']]
    };
    
    return await this.findAll({ ...defaultOptions, ...options });
  };

  Transaction.getUserStats = async function(userId) {
    const { Op } = sequelize.Sequelize;
    
    const stats = await this.findAll({
      where: { 
        user_id: userId,
        status: 'completed'
      },
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_amount'],
        [sequelize.fn('SUM', sequelize.col('fees')), 'total_fees']
      ],
      group: ['type'],
      raw: true
    });

    const result = {
      buy: { count: 0, total_amount: 0, total_fees: 0 },
      sell: { count: 0, total_amount: 0, total_fees: 0 },
      dividend: { count: 0, total_amount: 0, total_fees: 0 }
    };

    stats.forEach(stat => {
      result[stat.type] = {
        count: parseInt(stat.count),
        total_amount: parseFloat(stat.total_amount || 0),
        total_fees: parseFloat(stat.total_fees || 0)
      };
    });

    return result;
  };

  Transaction.createBuyTransaction = async function(data, transaction = null) {
    const fees = parseFloat(data.total_amount) * (data.fee_rate || 0.001);
    
    return await this.create({
      user_id: data.user_id,
      asset_id: data.asset_id,
      type: 'buy',
      quantity: data.quantity,
      price: data.price,
      total_amount: data.total_amount,
      fees: fees,
      notes: data.notes || null,
      status: 'completed'
    }, { transaction });
  };

  Transaction.createSellTransaction = async function(data, transaction = null) {
    const fees = parseFloat(data.total_amount) * (data.fee_rate || 0.001);
    
    return await this.create({
      user_id: data.user_id,
      asset_id: data.asset_id,
      type: 'sell',
      quantity: data.quantity,
      price: data.price,
      total_amount: data.total_amount,
      fees: fees,
      notes: data.notes || null,
      status: 'completed'
    }, { transaction });
  };

  return Transaction;
}; 
/**
 * @swagger
 * components:
 *   schemas:
 *     Asset:
 *       type: object
 *       required:
 *         - symbol
 *         - name
 *         - type
 *         - current_price
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único do ativo
 *         symbol:
 *           type: string
 *           description: Símbolo/código do ativo (ex: PETR4, VALE3)
 *           maxLength: 20
 *         name:
 *           type: string
 *           description: Nome completo do ativo
 *           maxLength: 200
 *         type:
 *           type: string
 *           enum: [acao, fii, cripto, renda_fixa]
 *           description: Tipo do ativo
 *         sector:
 *           type: string
 *           description: Setor econômico do ativo
 *         current_price:
 *           type: number
 *           format: decimal
 *           description: Preço atual do ativo
 *         previous_price:
 *           type: number
 *           format: decimal
 *           description: Preço anterior (para cálculo de variação)
 *         market_cap:
 *           type: number
 *           format: decimal
 *           description: Valor de mercado
 *         volume:
 *           type: number
 *           format: decimal
 *           description: Volume negociado
 *         description:
 *           type: string
 *           description: Descrição do ativo
 *         risk_level:
 *           type: string
 *           enum: [baixo, medio, alto]
 *           description: Nível de risco do ativo
 *         is_active:
 *           type: boolean
 *           description: Status ativo para negociação
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

module.exports = (sequelize, DataTypes) => {
  const Asset = sequelize.define('assets', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    symbol: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: {
        msg: 'Este símbolo já está cadastrado'
      },
      validate: {
        notEmpty: {
          msg: 'Símbolo é obrigatório'
        },
        len: {
          args: [2, 20],
          msg: 'Símbolo deve ter entre 2 e 20 caracteres'
        }
      }
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Nome é obrigatório'
        },
        len: {
          args: [3, 200],
          msg: 'Nome deve ter entre 3 e 200 caracteres'
        }
      }
    },
    type: {
      type: DataTypes.ENUM('acao', 'fii', 'cripto', 'renda_fixa'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['acao', 'fii', 'cripto', 'renda_fixa']],
          msg: 'Tipo deve ser: acao, fii, cripto ou renda_fixa'
        }
      }
    },
    sector: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: {
          args: [0, 100],
          msg: 'Setor deve ter no máximo 100 caracteres'
        }
      }
    },
    current_price: {
      type: DataTypes.DECIMAL(15, 8),
      allowNull: false,
      validate: {
        min: {
          args: [0.00000001],
          msg: 'Preço deve ser maior que zero'
        }
      }
    },
    previous_price: {
      type: DataTypes.DECIMAL(15, 8),
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'Preço anterior não pode ser negativo'
        }
      }
    },
    market_cap: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'Valor de mercado não pode ser negativo'
        }
      }
    },
    volume: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Volume não pode ser negativo'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    risk_level: {
      type: DataTypes.ENUM('baixo', 'medio', 'alto'),
      allowNull: false,
      defaultValue: 'medio',
      validate: {
        isIn: {
          args: [['baixo', 'medio', 'alto']],
          msg: 'Nível de risco deve ser: baixo, medio ou alto'
        }
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['symbol']
      },
      {
        fields: ['type']
      },
      {
        fields: ['sector']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['risk_level']
      }
    ]
  });

  // Métodos de instância
  Asset.prototype.calculateVariation = function() {
    if (!this.previous_price || this.previous_price === 0) {
      return {
        absolute: 0,
        percentage: 0
      };
    }
    
    const absolute = parseFloat(this.current_price) - parseFloat(this.previous_price);
    const percentage = (absolute / parseFloat(this.previous_price)) * 100;
    
    return {
      absolute: parseFloat(absolute.toFixed(8)),
      percentage: parseFloat(percentage.toFixed(2))
    };
  };

  Asset.prototype.updatePrice = async function(newPrice, transaction = null) {
    const previousPrice = this.current_price;
    return await this.update({
      previous_price: previousPrice,
      current_price: newPrice
    }, { transaction });
  };

  // Métodos de classe
  Asset.findBySymbol = async function(symbol) {
    return await this.findOne({
      where: { 
        symbol: symbol.toUpperCase(),
        is_active: true 
      }
    });
  };

  Asset.findByType = async function(type) {
    return await this.findAll({
      where: { 
        type,
        is_active: true 
      },
      order: [['symbol', 'ASC']]
    });
  };

  Asset.findBySector = async function(sector) {
    return await this.findAll({
      where: { 
        sector,
        is_active: true 
      },
      order: [['symbol', 'ASC']]
    });
  };

  Asset.getTopGainers = async function(limit = 10) {
    return await this.findAll({
      where: { 
        is_active: true,
        previous_price: { [sequelize.Sequelize.Op.gt]: 0 }
      },
      order: [
        [sequelize.literal('((current_price - previous_price) / previous_price) * 100'), 'DESC']
      ],
      limit
    });
  };

  Asset.getTopLosers = async function(limit = 10) {
    return await this.findAll({
      where: { 
        is_active: true,
        previous_price: { [sequelize.Sequelize.Op.gt]: 0 }
      },
      order: [
        [sequelize.literal('((current_price - previous_price) / previous_price) * 100'), 'ASC']
      ],
      limit
    });
  };

  return Asset;
}; 
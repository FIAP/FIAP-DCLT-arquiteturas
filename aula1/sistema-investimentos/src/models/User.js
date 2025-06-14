const bcrypt = require('bcryptjs');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - cpf
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único do usuário
 *         name:
 *           type: string
 *           description: Nome completo do usuário
 *           minLength: 3
 *           maxLength: 100
 *         email:
 *           type: string
 *           format: email
 *           description: Email único do usuário
 *         password:
 *           type: string
 *           minLength: 6
 *           description: Senha do usuário (será criptografada)
 *         cpf:
 *           type: string
 *           pattern: '^[0-9]{11}$'
 *           description: CPF do usuário (apenas números)
 *         phone:
 *           type: string
 *           description: Telefone do usuário
 *         risk_profile:
 *           type: string
 *           enum: [conservador, moderado, arrojado]
 *           description: Perfil de risco do investidor
 *         balance:
 *           type: number
 *           format: decimal
 *           description: Saldo disponível para investimentos
 *         is_active:
 *           type: boolean
 *           description: Status ativo do usuário
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('users', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Nome é obrigatório'
        },
        len: {
          args: [3, 100],
          msg: 'Nome deve ter entre 3 e 100 caracteres'
        }
      }
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: {
        msg: 'Este email já está em uso'
      },
      validate: {
        isEmail: {
          msg: 'Email deve ter um formato válido'
        },
        notEmpty: {
          msg: 'Email é obrigatório'
        }
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Senha é obrigatória'
        },
        len: {
          args: [6, 255],
          msg: 'Senha deve ter pelo menos 6 caracteres'
        }
      }
    },
    cpf: {
      type: DataTypes.STRING(11),
      allowNull: false,
      unique: {
        msg: 'Este CPF já está cadastrado'
      },
      validate: {
        notEmpty: {
          msg: 'CPF é obrigatório'
        },
        len: {
          args: [11, 11],
          msg: 'CPF deve ter exatamente 11 dígitos'
        },
        isNumeric: {
          msg: 'CPF deve conter apenas números'
        }
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        len: {
          args: [10, 20],
          msg: 'Telefone deve ter entre 10 e 20 caracteres'
        }
      }
    },
    risk_profile: {
      type: DataTypes.ENUM('conservador', 'moderado', 'arrojado'),
      allowNull: false,
      defaultValue: 'moderado',
      validate: {
        isIn: {
          args: [['conservador', 'moderado', 'arrojado']],
          msg: 'Perfil de risco deve ser: conservador, moderado ou arrojado'
        }
      }
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: {
          args: [0],
          msg: 'Saldo não pode ser negativo'
        }
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    },
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        unique: true,
        fields: ['cpf']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  // Métodos de instância
  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  };

  User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  User.prototype.updateBalance = async function(amount, transaction = null) {
    const newBalance = parseFloat(this.balance) + parseFloat(amount);
    if (newBalance < 0) {
      throw new Error('Saldo insuficiente para esta operação');
    }
    return await this.update({ balance: newBalance }, { transaction });
  };

  // Métodos de classe
  User.findByEmail = async function(email) {
    return await this.findOne({
      where: { email, is_active: true }
    });
  };

  User.findByCpf = async function(cpf) {
    return await this.findOne({
      where: { cpf, is_active: true }
    });
  };

  return User;
}; 
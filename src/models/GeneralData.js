const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const GeneralData = sequelize.define('GeneralData', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre_negocio: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    direccion: {
        type: DataTypes.STRING,
        allowNull: false
    },
    telefono: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            is: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    horario: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {
            lunes: { apertura: "09:00", cierre: "18:00" },
            martes: { apertura: "09:00", cierre: "18:00" },
            miercoles: { apertura: "09:00", cierre: "18:00" },
            jueves: { apertura: "09:00", cierre: "18:00" },
            viernes: { apertura: "09:00", cierre: "18:00" },
            sabado: { apertura: "09:00", cierre: "13:00" },
            domingo: { apertura: null, cierre: null }
        }
    },
    redes_sociales: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {
            facebook: "",
            instagram: "",
            twitter: ""
        }
    },
    logo_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    configuracion: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {
            moneda: "VES",
            zona_horaria: "America/Caracas",
            impuesto: 16,
            requiere_cita: true
        }
    }
}, {
    tableName: 'datos_generales',
    timestamps: true
});

module.exports = GeneralData;

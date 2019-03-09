const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

const categoriaSchema = new Schema({
    titulo: {
        type: String,
        required: [true, 'El titulo es necesario'],
        unique: true,
        uniqueCaseInsensitive: true,
        lowercase: true
    },
    estado:{
        type: Boolean,
        default: true,
        lowercase: true
    },
    usuario:{
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    }
});

// {PATH} imprime el campo que debe ser unico. En este caso, 'titulo'
categoriaSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único'});

module.exports = mongoose.model('Categoria', categoriaSchema);
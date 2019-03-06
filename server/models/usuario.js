const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
let Schema = mongoose.Schema;

let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido'
}

let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es requerido']
    },
    email: {
        type: String,
        required: [true, 'El email es necesario'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'El password es requerido']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});

// Eliminamos el retorno del campo password para que no sea visible en la impresion del objeto JSON
// El metodo toJSON en un esquema, siempre se llama cuando se intenta imprimir.

// No utilizar funcion de flecha para no perder el entorno del this
usuarioSchema.methods.toJSON = function(){

    //Convierto a objeto para poder acceder a sus propiedades y borro la propiedad password en el JSON de respuesta a imprimir

    let user = this;
    let userObject = user.toObject();
    delete userObject.password;

    return userObject;

}



usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único'});

module.exports = mongoose.model( 'Usuario', usuarioSchema );
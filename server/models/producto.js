var mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;



var productoSchema = new Schema(
	
	{

	    nombre: { 
	    	type: String, 
            required: [true, 'El nombre es necesario'],
            unique: true,
            uniqueCaseInsensitive: true,
            lowercase: true
	    },
	    precio: { 
	    	type: Number, 
	    	required: [true, 'El precio únitario es necesario'] 
	    },
	    descripcion: { 
	    	type: String, 
	    	required: false
	    },
	    estado: { 
	    	type: Boolean, 
	    	required: true, 
	    	default: true 
	    },
	    categoria: { 
	    	type: Schema.Types.ObjectId, 
	    	ref: 'Categoria', 
	    	required: true 
	    },
	    usuario: { 
	    	type: Schema.Types.ObjectId, 
	    	ref: 'Usuario' 
	    }
    
	}
);

productoSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único'});
module.exports = mongoose.model('Producto', productoSchema);
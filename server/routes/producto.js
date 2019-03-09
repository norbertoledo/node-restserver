const express= require('express');
const { verificaToken } = require('../middlewares/auth');
const app = express();

const Producto = require('../models/producto');



// ===========================
// Obtener todos los productos
// ===========================


app.get( '/producto', verificaToken, (req, res)=>{

    //trae todos los productos
    // populate:(*2) usuario categoria
    // paginado
    const desde = Number(req.query.desde) || 0;
    const limite = Number(req.query.limite) || 5;
    const condicion = {
        estado: true
    };

    Producto.find(condicion)
            .sort()
            .skip(desde)
            .limit(limite)
            .populate('usuario', 'nombre email')
            .populate('categoria', 'titulo')
            .exec((err, producto)=>{
                if(err){
                    return res.status(500).json({
                        ok: false,
                        error:  err
                    });
                }

                Producto.countDocuments(condicion, (err, cantidad)=>{

                    res.json({
                        ok: true,
                        mostrando: `${desde+1} a ${(desde+limite)>cantidad?cantidad:(desde+limite)} de ${cantidad}`,
                        producto
                    })

                });

            });

});


// ===========================
// Obtener producto por ID
// ===========================
app.get( '/producto/:id', verificaToken, (req, res)=>{

    //trae un producto

    let id = req.params.id;

    Producto.findOne({_id:id})
            .populate('usuario', 'nombre email')
            .populate('categoria', 'titulo')
            .exec( (err, productoDB)=>{

                if(err){
                    return res.status(500).json({
                        ok: false,
                        error:  err
                    });
                }

                if(!productoDB){
                    return res.status(400).json({
                        ok: false,
                        error: {
                            message: 'No existe el producto'
                        }
                    });
                }

                res.json({
                    ok: true,
                    producto: productoDB
                });

            });


});


// ===========================
// Buscar productos
// ===========================

app.get('/producto/buscar/:termino', verificaToken, (req, res)=>{


    let termino = req.params.termino;

    // Expresión regular para los terminos de busqueda y que no sea un match literal
    let regex = new RegExp(termino, 'i');


    const condicion = {
        nombre: regex
    }
    Producto.find( condicion )
            .populate('categoria', 'titulo')
            .exec((err, productos)=>{

                if(err){
                    return res.status(500).json({
                        ok: false,
                        error:  err
                    });
                }

                Producto.countDocuments(condicion, (err, cantidad)=>{

                    res.json({
                        ok: true,
                        cantidad,
                        productos
                    });

                })
            });

});




// ===========================
// Crear producto
// ===========================
const optionsPostValidator = {
    new: true,
    runValidators: true
};
app.post( '/producto', verificaToken, (req, res)=>{

    // crear un nuevo producto
    // grabar el usuario
    // grabar la categoria a la que pertenece

    let body = req.body;
    let usuario = req.usuario;

    let producto = new Producto({
        nombre: body.nombre,
        precio: body.precio,
        descripcion: body.descripcion,
        estado: body.estado,
        categoria: body.categoria,
        usuario: usuario._id
    });

    producto.save(optionsPostValidator, (err, productoDB)=>{

        if(err){
            return res.status(500).json({
                ok: false,
                error:  err.errors.nombre.message
            });
        }

        if(!productoDB){
            return res.status(201).json({
                ok: false,
                error: {
                    message: err
                }
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });

    });

});


// ===========================
// Actualizar producto
// ===========================
const optionsPutValidator = {
    new: true,
    runValidators: true
}
app.put( '/producto/:id', verificaToken, (req, res)=>{

    // actualizar un nuevo producto
    // grabar el usuario
    // grabar la categoria a la que pertenece

    const id = req.params.id;
    const body = req.body;

    Producto.findOneAndUpdate({_id:id}, body, optionsPutValidator, (err, productoDB)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                error:  err
            });
        }

        if(!productoDB){
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'El producto no existe'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    })

});


// ===========================
// Eliminar un producto
// ===========================
const optionsDeleteValidator = {
    new: true,
    runValidators: true
};

app.delete( '/producto/:id', verificaToken, (req, res)=>{

    // Eliminar un nuevo producto
    // Cambiar el boolean de 'disponible'
    // Mensaje de salida: 'El producto ha sido deshabilitado'

    const id = req.params.id;
    const estado = {
        estado: false
    }

    Producto.findOneAndUpdate( {_id:id}, estado, optionsDeleteValidator, (err, productoDB)=>{

        if(err){
            return res.status(500).json({
                ok: false,
                error:  err
            });
        }

        if(!productoDB){
            return res.status(400).json({
                ok: false,
                error: {
                    message: err
                }
            });
        }

        res.json({
            ok: true,
            message: `El producto ${productoDB.nombre} ha sido deshabilitado`
        })


    });

});










module.exports = app;
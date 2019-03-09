const express = require('express');

//Todas las peticiones que yo voy a hacer requieren que al menos el usuario este eatenticado
let { verificaToken, verificaAdminRole } = require('../middlewares/auth');

let app = express();

let Categoria = require('../models/categoria');


// ===========================
// Mostrar todas las categorias
// ===========================

app.get( '/categoria', (req, res)=>{

    // Listar todas las categorias
    let condicion = { };

    Categoria.find(condicion)
            .sort('titulo')
            .populate('usuario', 'nombre email') //('nombre de la coleccion', 'campos que quiero que aparezcan') 
            .exec( (err, categoriaDB)=>{
                
                if(err){
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }

                Categoria.countDocuments(condicion,(err, conteo)=>{

                    res.json({
                        ok: true,
                        cantidad: conteo,
                        categoriaDB
                    })

                })
                
            });

});

// ===========================
// Mostrar una categoria por ID
// ===========================
app.get( '/categoria/:id', verificaToken, (req, res)=>{

    let id = req.params.id; 
    let condicion = {};
    
    Categoria.findOne({_id: id}, condicion,( err, categoriaDB)=>{
        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if(!categoriaDB){
            return res.status(400).json({
                ok:false,
                error: {
                    message: err.errors
                }
            })
        }

        res.json({
            ok: true,
            categoriaDB
        })
    })
    
});

// ===========================
// Crear nueva categoria
// ===========================
const optionsPostValidator = {
    new: true,
    runValidators: true
};
app.post( '/categoria', [verificaToken, verificaAdminRole], (req, res)=>{
    // Regresa la nueva Categoria
    // Tambien regreso el id de usuario que lo creo: req.usuario._id

    let body = req.body;
    let usuario = req.usuario;
    
    let categoria = new Categoria({
        titulo: body.titulo,
        estado: body.estado,
        usuario: usuario._id 
    });

    categoria.save( optionsPostValidator, (err, categoriaDB)=>{

        if(err){
            return res.status(400).json({
                ok: false,
                error: {
                    message: err.errors.titulo.message
                }
            })
        }

        if(!categoriaDB){
            return res.status(400).json({
                ok:false,
                error: {
                    message: err.errors.titulo.message
                }
            })
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });

});


// ===========================
// Modificar una categoria
// ===========================
const optionsPutValidator = {
    new: true
};
app.put( '/categoria/:id', [verificaToken, verificaAdminRole],(req, res)=>{
    // Actualizar el nombre de la categoria

    let id = req.params.id;
    let body = req.body;
    let usuario = req.usuario;

    body.usuario = usuario._id;

    Categoria.findOneAndUpdate({_id: id}, body, optionsPutValidator, (err, categoriaDB)=>{

        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if(!categoriaDB){
            return res.status(400).json({
                ok:false,
                error: {
                    message: err.errors.titulo.message
                }
            })
        }

        res.json({
            ok: true,
            categoriaDB
        });

    });


});

// ===========================
// Eliminar una categoria
// ===========================
app.delete( '/categoria/:id', [verificaToken, verificaAdminRole], (req, res)=>{
    // Solo la puede borrar un ADMIN_ROLE
    // Elimina fisicamente de la DB


    let id = req.params.id;

    Categoria.findOneAndDelete({_id:id}, (err, categoriaEliminada)=>{

        if(err){
            return res.status(400).json({
                ok:false,
                error: {
                    message: err
                }
            })
        }
        if( !categoriaEliminada ){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoria no existe'
                }
            })
        }

        res.json({
            ok: true,
            message: `Categoría '${categoriaEliminada.titulo}' ha sido eliminada!`,
            id: id,
            categoria: categoriaEliminada
        })
    });

});



module.exports = app;
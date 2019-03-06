const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const Usuario = require('../models/usuario');

const app = express();

// GET //
// leer
app.get('/usuario', function (req, res) {
    
    let desde = Number(req.query.desde) || 0;
    let limite = Number(req.query.limite) || 5;
    let condicion = {
        estado: true
    }

    // find => Que regrese todos, pero se pueden setear condiciones en el objeto (activos, registrados con google, etc)
    // skip => Salta la cantidad de registros del parametro (A partir de...)
    // limit => cantidad de resultados indicados en el parametro
    // exec => ejecuta el filtro
    // find, segundo parametro => es una condicion especial. Es para filtrar que campos queremos mostrar
    Usuario.find(condicion, 'nombre email role estado google img')
            .skip(desde)
            .limit(limite)
            .exec( (err, usuarios) =>{

                if(err){
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }

                // Total de registros sin importar el 'desde' y el 'limite'. Si cambia si le agregamos un filtro entre las llaves
                Usuario.countDocuments(condicion, (err, conteo)=>{

                    res.json({
                        ok: true,
                        cantidad: conteo,
                        usuarios                        
                    });
                
                });

            });

});

// POST //
// crear
app.post('/usuario', function (req, res) {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync( body.password, 10),
        role: body.role
    });

    usuario.save( (err, usuarioDB) =>{

        if(err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }


        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });


})

// PUT //
const optionsPutValidator = {
    new: true,
    runValidators: true
};
const propsPutAvaible = ['nombre', 'email', 'img', 'role', 'estado'];

// actualizar
app.put('/usuario/:id', function (req, res) {

    let id = req.params.id;
    let body = _.pick(req.body, propsPutAvaible);

    // (id, objetoActualizar, {options}, callback)
    Usuario.findOneAndUpdate({_id: id}, body, optionsPutValidator, (err, usuarioDB) => {

        if( err ){

            return res.status(400).json({
                ok: false,
                err
            });
        }


        res.json({
            ok: true,
            usuario: usuarioDB
        })
    });

    
})

// DELETE
// Borrar - Ya no se acostumbra a borrar un registro, sino a cambiarle el estado, pero que siga existiendo el registro
app.delete('/usuario/:id', function (req, res) {
    
    let id = req.params.id;
    let cambiaEstado = {
        estado: false
    }
    /*
    // Elimina fisicamente un documento de la DB
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado)=>{

        if(err){
            return res.status(400).json({
                ok: false,
                err
            })
        }
        if( !usuarioBorrado ){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            })
        }

        res.json({
            ok: true,
            idToRemove: id,
            usuario: usuarioBorrado
        })

    })
    */

    // Cambia el estado de un documento

    Usuario.findByIdAndUpdate(id, cambiaEstado, optionsPutValidator, (err, usuarioInactivo )=>{

        if(err){
            return res.status(400).json({
                ok: false,
                err
            });

        }
        
        res.json({
            ok: true,
            usuarioInactivo
        })
    });

})


module.exports = app;
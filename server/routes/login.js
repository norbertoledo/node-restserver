const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Usuario = require('../models/usuario');

const app = express();


app.post('/login', (req, res)=>{
    

    let body = req.body;
    
    // Comprobamos si el email existe.  Si no existe, devuelve null o undefined
    Usuario.findOne({email: body.email}, (err, usuarioDB)=>{

        // Algun error de conexion al servidor
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // Error si la contraseña no existe, por lo tanto tampoco existe el usuario
        if( !usuarioDB ){
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o contraseña incorrecto'
                }
            });
        }

        // devuelve un boolean con el match de los parametros
        if ( !bcrypt.compareSync( body.password, usuarioDB.password ) ){

            // Error si la contraseña es erronea
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (contraseña) incorrecto'
                }
            });

        }

        
        //(payload, secret, expiracion)
        let token = jwt.sign(
            {
                usuario: usuarioDB
            },
            process.env.TOKEN_SEED,
            { 
                expiresIn: process.env.TOKEN_EXPIRES
            } 
        )

        res.json({
            ok: true,
            usuario: usuarioDB,
            token: token
        });

    });


});



module.exports = app;
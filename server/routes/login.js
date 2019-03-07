const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.CLIENT_ID);

const Usuario = require("../models/usuario");

const app = express();

app.post("/login", (req, res) => {
  let body = req.body;

  // Comprobamos si el email existe.  Si no existe, devuelve null o undefined
  Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
    // Algun error de conexion al servidor
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }

    // Error si la contraseña no existe, por lo tanto tampoco existe el usuario
    if (!usuarioDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "(Usuario) o contraseña incorrecto"
        }
      });
    }

    // devuelve un boolean con el match de los parametros
    if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
      // Error si la contraseña es erronea
      return res.status(400).json({
        ok: false,
        err: {
          message: "Usuario o (contraseña) incorrecto"
        }
      });
    }

    // SI los datos ingresados son correctos -»
    //(payload, secret, expiracion)
    let token = jwt.sign(
      {
        usuario: usuarioDB
      },
      process.env.TOKEN_SEED,
      {
        expiresIn: process.env.TOKEN_EXPIRES
      }
    );

    res.json({
      ok: true,
      usuario: usuarioDB,
      token: token
    });
  });
});

// Configuraciones de Google
async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.CLIENT_ID // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();

  console.log(payload.name);
  console.log(payload.email);
  console.log(payload.picture);

  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true
  };
}

app.post("/google", async (req, res) => {
  let token = req.body.idtoken;

  let googleUser = await verify(token).catch(err => {
    return res.status(403).json({
      ok: false,
      err: {
        message: err
      }
    });
  });

  /*
    // No hacemos una impresion directa, sino validar contra la DB 
    res.json({
        //token: token
        usuario: googleUser
    });
    */

  Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
    // Algun error de conexion al servidor
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }

    // Si ya está registrado el usuario en la DB
    if (usuarioDB) {
      // Si se registró con una cuenta NORMAL y no de Google
      if (!usuarioDB.google) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "Usuario registrado con una autenticacion NORMAL"
          }
        });
      } else {
        // Si se registró con una cuenta de Google, renovamos su token provisto por Google
        //(payload, secret, expiracion)
        let token = jwt.sign(
          {
            usuario: usuarioDB
          },
          process.env.TOKEN_SEED,
          {
            expiresIn: process.env.TOKEN_EXPIRES
          }
        );

        return res.json({
          ok: true,
          usuario: usuarioDB,
          token: token
        });
      }
    } else {
      // El usuario NO existe en nuestra DB
      let usuario = new Usuario();

      usuario.nombre = googleUser.nombre;
      usuario.email = googleUser.email;
      usuario.img = googleUser.img;
      usuario.google = true;
      usuario.password = ":)";

      usuario.save((err, usuarioDB) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            err
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
        );

        return res.json({
          ok: true,
          usuario: usuarioDB,
          token: token
        });
      });
    }
  });
});

module.exports = app;

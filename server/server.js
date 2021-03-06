require('./config/config');


const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');


const app = express();

const port = process.env.PORT;

/*
Middlewares
'.use' Cada peticion que hagamos, siempre pasa por estas lineas
*/

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json());


// Habilitar la carpeta /public para que se pueda acceder de cualquier lugar
app.use( express.static( path.resolve( __dirname,'../public' ) ) );


 
// Configuracion global de rutas
// la agrego luego del bodyParser porque usuario la utiliza
app.use(require('./routes/index'));


// Conexion a la DB con Mongoose
// Defino tambien un segundo parametro con un callback para ver si logra hacer la conexion o no
// mongodb:dominio:puerto/database
// Si no existe la database, no arroja error. Al momento de crear el primer registro, crea la DB
mongoose.connect(process.env.URLDB, { useCreateIndex: true, useNewUrlParser: true },( err, res )=>{
    if( err ) throw err;
    console.log('Base de datos ONLINE');
});


// Escucha el puerto del servidor
app.listen(port, ()=>{
    console.log(`Escuchando el puerto ${port}`);
})
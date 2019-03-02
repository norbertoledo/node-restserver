require('./config/config');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');


const port = process.env.PORT;

/*
Middlewares
'.use' Cada peticion que hagamos, siempre pasa por estas lineas
*/
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
 

// leer
app.get('/usuario', function (req, res) {
    res.json('get Usuario')
})

// crear
app.post('/usuario', function (req, res) {

    let body = req.body;



    res.json({
        persona: body
    })
})

// actualizar
app.put('/usuario/:id', function (req, res) {

    let id = req.params.id

    res.json({
        id
    })
})

// Borrar - Ya no se acostumbra a borrar un registro, sino a cambiarle el estado, pero que siga existiendo el registro
app.delete('/usuario', function (req, res) {
    res.json('delete Usuario')
})



app.listen(port, ()=>{
    console.log(`Escuchando el puerto ${port}`);
})
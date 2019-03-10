const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const fs = require('fs'); //fileSystem
const path = require('path');


// Importo el Schema de usuario
const Usuario = require('../models/usuario');

// Importo el Schema de producto
const Producto = require('../models/producto');

// Tipos permitidos
const tiposValidos = [
    {
        tipo: 'productos',
        modelo: Producto 

    },
    {
        tipo: 'usuarios',
        modelo: Usuario 

    }
];
// Extensiones permitidas
const extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];


const optionsTempFile = {
    useTempFiles : true,
    tempFileDir : '/tmp/'
};

// Miidleware => Todos los archivos que se carguen, caen dentro del 'req.file'
app.use(fileUpload( optionsTempFile ));

// ===================
// Upload de imagenes
// ===================
app.put('/upload/:tipo/:id', (req, res)=>{

    let tipo = req.params.tipo;
    let id = req.params.id;
    let archivo = req.files.archivo;

    if(!req.files){
        return res.status(400).json({
            ok: false,
            error: {
                message: 'Ningun archivo ha sido seleccionado'
            } 
        });
    }

    // VALIDAR TIPO

    let validarTipo;

    tiposValidos.forEach(e => {
        if(e.tipo === tipo){
            validarTipo = e.tipo;
        }
    });

    if( !validarTipo ){
        return res.status(400).json({
            ok: false,
            err: {
                message: `Ha intentado asignar el tipo '${tipo}'. Los tipos permitidos son: ${tiposValidos.map(e=>e.tipo).join(', ')}`
            }
        });
    }


    // VALIDAR EXTENSION
    
    //let nombreArchivo = archivo.name.substring(0, archivo.name.lastIndexOf("."));
    let extensionArchivo =archivo.name.substring((archivo.name.lastIndexOf(".")+1), archivo.name.lenght);


    if( extensionesValidas.indexOf( extensionArchivo ) < 0){
        return res.status(400).json({
            ok: false,
            err: {
                message: `Ha intentado subir un archivo con extension '${extensionArchivo}'. Las extensiones permitidas son: ${extensionesValidas.join(', ')}`
            }
        });
    }


    // Cambiar nombre al archivo para que sea unico
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    const pathUploads = 'uploads';

    // Metodo para mover el archivo en el directorio con el nombre que nosotros queremos
    archivo.mv(`${pathUploads}/${tipo}/${nombreArchivo}`, (err)=>{

        if(err){
            return res.status(500).json({
                ok: false,
                error: err
            })
        }

        // Aqui, se que la imagen ya se cargó
        cargarArchivo(id, res, nombreArchivo, tipo);


    });

});

cargarArchivo = (id, res, nombreArchivo, tipo)=>{

    let modeloDestino;

    tiposValidos.forEach(e => {
        if(e.tipo === tipo){
            modeloDestino = e.modelo;
        }
    });


    modeloDestino.findOne({_id:id}, (err, modeloDB)=>{

        if(err){
            borrarArchivo(nombreArchivo, tipo);
            return res.status(500).json({
                ok: false,
                error: err
            })
        }
        if(!modeloDB){
            borrarArchivo(nombreArchivo, tipo);
            return res.status(400).json({
                ok: false,
                error: `No existe ese id en ${tipo}`
            })
        }

        // Eliminar la imagen anterior, si existe
        borrarArchivo(modeloDB.img, tipo);


        modeloDB.img = nombreArchivo;

        modeloDB.save((err, modeloGuardado)=>{

            if(err){
                return res.status(500).json({
                    ok: false,
                    error: err
                })
            }

            res.json({
                ok: true,
                message: 'Archivo subido correctamente',
                img: nombreArchivo,
                modelo: modeloGuardado
            })

        })

        
    });
}


borrarArchivo = (nombreImagen, tipo)=>{

    // Cada argumento del resolve es una parte del path que yo quiero constriuir
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);

    // devuelve un booleano y existe o no el archivo en ese path
    if( fs.existsSync(pathImagen) ){
        // Elimina el archivo del File System
        fs.unlinkSync(pathImagen);
    }
}

/*
imagenUsuario = (id, res, nombreArchivo)=>{

    Usuario.findOne({_id:id}, (err, usuarioDB)=>{

        if(err){
            borrarArchivo(nombreArchivo, tiposValidos[1]);
            return res.status(500).json({
                ok: false,
                error: err
            })
        }
        if(!usuarioDB){
            borrarArchivo(nombreArchivo, tiposValidos[1]);
            return res.status(400).json({
                ok: false,
                error: 'Usuario no existe'
            })
        }

        // Eliminar la imagen anterior, si existe
        borrarArchivo(usuarioDB.img, tiposValidos[1]);


        usuarioDB.img = nombreArchivo;

        usuarioDB.save((err, usuarioGuardado)=>{

            if(err){
                return res.status(500).json({
                    ok: false,
                    error: err
                })
            }

            res.json({
                ok: true,
                message: 'Archivo subido correctamente y asignado al usuario',
                img: nombreArchivo,
                usuario: usuarioGuardado
            })

        })

        
    });

}

imagenProducto = (id, res, nombreArchivo)=>{


    Producto.findOne({_id: id}, (err, productoDB)=>{
        if(err){
            borrarArchivo(nombreArchivo, tiposValidos[0]);
            return res.status(500).json({
                ok:false,
                error: {
                    message: err
                }
            })
        }
        if(!productoDB){
            borrarArchivo(nombreArchivo, tiposValidos[0]);
            return res.status(400).json({
                ok:false,
                error: {
                    message: 'Producto no existe'
                }
            })
        }

        // Eliminar la imagen anterior, si existe
        borrarArchivo(productoDB.img, tiposValidos[0]);

        productoDB.img = nombreArchivo;

        productoDB.save((err, productoGuardado)=>{
            if(err){
                return res.status(500).json({
                    ok:false,
                    error: {
                        message: err
                    }
                })
            }
            res.json({
                ok: true,
                message: 'Archivo subido correctamente y asignado al producto',
                img: nombreArchivo,
                producto: productoGuardado
            });

        })

    })

}
*/



module.exports = app;
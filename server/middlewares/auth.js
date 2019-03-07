const jwt = require('jsonwebtoken');

// ================
// Verificar TOKEN
// ================
//(consulta, respuestaque vamos a mostrar, Continuar con la ejecucion del programa)
let verificaToken = ( req, res, next) => {

    // Obtengo los headers
    let token = req.get('token');

    jwt.verify( token, process.env.TOKEN_SEED, ( err, decoded) =>{

        if(err){
            //401 => Error de autorizacion
            return res.status(401).json({
                ok:false,
                err: {
                    message: 'Token no válido'
                }
            })
        }
        // El decoded es todo el payload (Los datos del usuario en la DB)
        // la propiedad usuario es la que generamos en el login jwt.sign()
        req.usuario = decoded.usuario;

        next();

    });

};

// ================
// Verificar TOKEN
// ================
let verificaAdminRole = ( req, res, next ) =>{

    let usuario = req.usuario;

    if(usuario.role != 'ADMIN_ROLE'){
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No dispones de permisos de Administrador'
            }
        });
    }

    next();

}


module.exports = {
    verificaToken,
    verificaAdminRole
}
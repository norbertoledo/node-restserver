

// PROCESS
// - Objeto global que permanece corriendo a lo largo de toda la app de Node
// - Se actualiza de acuerdo al enviroment o el puerto donde esta corriendo

/**
 * ======================
 * Puerto
 * ======================
 */
// Si la desplegamos en produccion, el process detecta el puerto,
// sino es porque estamos en entorno de desarrollo y le asignamos el 3000
 process.env.PORT = process.env.PORT || 3000;

 /**
 * ======================
 * Entorno
 * ======================
 */
// Preguntamos por una variable global de entorno que vamos a generar en Heroku o en cualquier servidor que se despliegue
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

/**
 * ======================
 * Base de datos
 * ======================
 */
// Configuracion de la conexión a la base de datos
let urlDB;

if( process.env.NODE_ENV === 'dev'){
    urlDB = 'mongodb://localhost:27017/cafe';
} else{
    urlDB = process.env.MONGO_URI;
    
}

process.env.URLDB = urlDB;



 
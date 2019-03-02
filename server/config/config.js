

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
 process.env.PORT = process.eventNames.PORT || 3000;
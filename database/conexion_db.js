// Se llaman las variables globales
require('dotenv').config();

// Se llama la biblioteca mysql 
const mysql = require('mysql');

// Se configura la conexión a la base de datos. 
var conecciondb=mysql.createConnection({
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Se conecta a la base de datos. 
conecciondb.connect(function(error){
    if(error){
        throw error;

    }else{
        console.log('coneccion exitosaa');
    }
});

module.exports = conecciondb;
/*conecciondb.query('SELECT * FROM `registro_usuer`', function(error,result, fields){

    if(error)
    throw error;
        result.forEach(result=> {
            console.log(result);      
        });
})
*/

// Se cierra la conexión activa. 
conecciondb.end;
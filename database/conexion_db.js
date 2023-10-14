//se llmana las variables gobales
require('dotenv').config();

const mysql = require('mysql');

//se configura la conecion a la base de datos 
var conecciondb=mysql.createConnection({
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

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

conecciondb.end;
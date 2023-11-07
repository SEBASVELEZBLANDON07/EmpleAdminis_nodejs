const express = require('express');
//coneccion a la base de dastos 
const coneccion = require('../database/conexion_db');
const { route } = require('./users_route');

//definir la variable de rutas para comensar las funsiones 
const router = express.Router();

//variables de autenticacion de rol y verificasion de token 
const auth = require('../services/authentication');
const checkRole = require('../services/check_Role');

//se llama al service api google driver 
const apiDriver = require('../services/api_driver');
const fs = require('fs');

//procesar imagen 
const multer = require('multer'); 
const { authenticate } = require('@google-cloud/local-auth');
const { Console, error } = require('console');

//se llmana las variables gobales
require('dotenv').config();

router.delete('/deleteEmpleado/:id', (req, res, next) => {
    const id_eliminar = req.params.id;
    
    //asemos la consulta para eliminar la fotografia de driver
    var query ="SELECT fotografia FROM empleado WHERE id_cedula=?";
    coneccion.query(query, [id_eliminar], (err, results)=>{
        if(!err){
            if(results.length >= 0){
                //se octine la url de la imagen
                const url_fotografia = results[0].fotografia;

                //sacamos el id de la url guardada en la base de datos, lo guadadmos en la variable fileId
                const parts = url_fotografia.split("/");
                const fileId = parts[parts.length - 1];

                //Se llamada la api de drive para eliminar el archivo de la fotografia en Google Drive, se le pasa el id a eliminar
                apiDriver.deleteFile(fileId).then((delete_File)=>{
                    return res.status(200).json({message: "funcion realizada con exito"});  



                }).catch((error)=>{
                    return res.status(500).json(error);
                });
            }else{
                return res.status(400).json({message: "url de la fotografia no encontrada"})
            }
        }else{
            return res.status(500).json(err);
        }
    });

    //hacemos la consulta a la base de datos para que elimine al empleado
    console.log(id_eliminar);
    

});


module.exports = router;
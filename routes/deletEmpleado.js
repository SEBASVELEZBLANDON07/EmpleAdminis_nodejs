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

//se eliminan todos los registro del empleado incluyendo los archivos guadados en drive
router.delete('/deleteEmpleado/:id', (req, res, next) => {
    const id_eliminar = req.params.id;
    
    //asemos la consulta para eliminar la fotografia de driver
    var query ="SELECT fotografia FROM empleado WHERE id_cedula=?";
    coneccion.query(query, [id_eliminar], (err, results)=>{
        if(!err){
            if(results.length <= 0){
                return res.status(400).json({message: "url de la fotografia no encontrada"});
            }else{ 

                //se octine la url de la imagen
                const url_fotografia = results[0].fotografia;

                //sacamos el id de la url guardada en la base de datos, lo guadadmos en la variable fileId
                const parts = url_fotografia.split("/");
                const fileId = parts[parts.length - 1];

                console.log("fotografia se elimina id", fileId);

                //Se llamada la api de drive para eliminar el archivo de la fotografia en Google Drive, se le pasa el id a eliminar
                apiDriver.deleteFile(fileId).then((delete_File)=>{

                    //se buscan la url de los pdf de incapacidad registradas  
                    query ="SELECT `archivo_incapacidad` FROM `incapacidad` WHERE id_cedula_i = ?";
                    coneccion.query(query, [id_eliminar], (err, results)=>{
                        if(!err){

                            //si no hay registros de url de pdfs,  eliminamos los registros demoas registos de horas extras, asistencias, cuenta bancaria y perfil del empleado
                            if(results.length <= 0){
                                
                                //eliminamos el registro de horas extras registreadas en la base de datos 
                                query ="DELETE FROM `horas_extras` WHERE id_cedula_h = ?";
                                coneccion.query(query, [id_eliminar], (err, results)=>{
                                    if(!err){

                                        //eliminamos las asistencias registradas en la base de datos 
                                        query = "DELETE FROM `asistencia` WHERE id_cedula_a = ?";
                                        coneccion.query(query, [id_eliminar], (err, results)=>{
                                            if(!err){

                                                //eliminamos la cuenta bancaria registrada en la base de datos
                                                query = "DELETE FROM `cuenta_bancaria_empleado` WHERE id_cedula_c = ?";
                                                coneccion.query(query, [id_eliminar], (err, results)=>{
                                                    if(!err){

                                                        //eliminamos el perfil del empleado 
                                                        query = "DELETE FROM `empleado` WHERE id_cedula = ?";
                                                        coneccion.query(query, [id_eliminar], (err, results)=>{
                                                            if(!err){
                                                                
                                                                return res.status(200).json({message: "funcion realizada con exito"});  
                                                            }else{
                                                                return res.status(500).json(error);
                                                            }
                                                        });
                                                    }else{
                                                        return res.status(500).json(error);
                                                    }
                                                });
                                            }else{
                                                return res.status(500).json(error);
                                            }
                                        });
                                    }else{
                                        return res.status(500).json(error);
                                    }
                                });

                            //si hay urls de pdfs registradas, eliminamos los pdfs de driver y luego eliminamos los registros de la base de datos,
                            }else{
                                //sacamos el numero de urls guadadas 
                                var numPDF= results.length;
                                
                                //usamos el bucle for para realizar las eliminaciones en drive de los archivos esistentes
                                for (let i = 0; i <= numPDF-1; i++) {
                                    
                                    //se octine la url del pdf 
                                    const url_pdf= results[i].archivo_incapacidad;
                                    
                                    //sacamos el id de la url guardada en la base de datos, lo guadadmos en la variable fileIdPDF
                                    const parts = url_pdf.split("/");
                                    const fileIdPDF = parts[parts.length - 1];

                                    //se elimina el archivo pdf
                                    apiDriver.deleteFile(fileIdPDF).then((delete_File)=>{
                                        console.log(delete_File);
                                    }).catch((error)=>{
                                        return res.status(500).json(error);
                                    });
                                }

                                //elliminamos los registros de incapacidad ingresados a la base de datos.
                                query ="DELETE FROM `incapacidad` WHERE id_cedula_i = ?";
                                coneccion.query(query, [id_eliminar], (err, results)=>{
                                    if(!err){

                                        //eliminamos el registro de horas extras registreadas en la base de datos 
                                        query ="DELETE FROM `horas_extras` WHERE id_cedula_h = ?";
                                        coneccion.query(query, [id_eliminar], (err, results)=>{
                                            if(!err){

                                                //eliminamos las asistencias registradas en la base de datos 
                                                query = "DELETE FROM `asistencia` WHERE id_cedula_a = ?";
                                                coneccion.query(query, [id_eliminar], (err, results)=>{
                                                    if(!err){

                                                        //eliminamos la cuenta bancaria registrada en la base de datos
                                                        query = "DELETE FROM `cuenta_bancaria_empleado` WHERE id_cedula_c = ?";
                                                        coneccion.query(query, [id_eliminar], (err, results)=>{

                                                            if(!err){

                                                                //eliminamos el perfil del empleado 
                                                                query = "DELETE FROM `empleado` WHERE id_cedula = ?";
                                                                coneccion.query(query, [id_eliminar], (err, results)=>{
                                                                    
                                                                    if(!err){
                                                                        return res.status(200).json({message: "funcion realizada con exito"});  
                                                                    }else{
                                                                        return res.status(500).json(error);
                                                                    }
                                                                });
                                                            }else{
                                                                return res.status(500).json(error);
                                                            }
                                                        });
                                                    }else{
                                                        return res.status(500).json(error);
                                                    }
                                                });
                                            }else{
                                                return res.status(500).json(error);
                                            }
                                        });
                                    }else{
                                        return res.status(500).json(error);
                                    }
                                }); 
                            }
                        }else{
                            return res.status(500).json(err);
                        }
                    });
                }).catch((error)=>{
                    return res.status(500).json(error);
                });
            }
        }else{
            return res.status(500).json(err);
        }
    });
});

//se agraga un registro del empleado eliminado 
router.post('/RegisEmpleado_eliminado', (req, res) => {
    const id_empleadoEliminado = req.body;

    //se ase la insercopn a la base de datos del empleado que se elimino 
    var query = "INSERT INTO `empleados_eliminados`(`id_empleados_eliminados`, `motivo_eliminacion`) VALUES (?,?)";
    coneccion.query(query, [id_empleadoEliminado.id_empleados_eliminados, id_empleadoEliminado.motivo_eliminacion], (err, results)=>{
        if(!err){
            return res.status(200).json({message: "se registra el empleado eliminado"});
        }else{
            return res.status(500).json(err);
        }
    });
});



module.exports = router;
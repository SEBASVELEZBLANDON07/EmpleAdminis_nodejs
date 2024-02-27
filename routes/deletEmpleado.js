const express = require('express');
 // Conexión a la base de datos.
const coneccion = require('../database/conexion_db');
const { route } = require('./users_route');

// Definir la variable de rutas para comenzar las funciones. 
const router = express.Router();

// Variables de autenticación de rol y verificación de token. 
const auth = require('../services/authentication');
const checkRole = require('../services/check_Role');

// Se llama al servicio API Google Driver. 
const apiDriver = require('../services/api_driver');
const fs = require('fs');

// Procesar imagen 
const multer = require('multer'); 
const { authenticate } = require('@google-cloud/local-auth');
const { Console, error } = require('console');

// Se llaman las variables globales 
require('dotenv').config();

// Se eliminan todos los registros del empleado, incluyendo los archivos guardados en drive.
router.delete('/deleteEmpleado/:id', auth.authenticateToken, checkRole.check_Role, (req, res, next) => {
    const id_eliminar = req.params.id;
    
    // Se la consulta para eliminar la fotografia de Drive
    var query ="SELECT fotografia FROM empleado WHERE id_cedula=?";
    coneccion.query(query, [id_eliminar], (err, results)=>{
        if(!err){
            if(results.length <= 0){
                return res.status(400).json({message: "url de la fotografia no encontrada"});
            }else{ 

                // Se obtiene la URL de la imagen. 
                const url_fotografia = results[0].fotografia;

                // Se saca el ID de la URL guardada en la base de datos, lo guardamos en la variable fileId
                const parts = url_fotografia.split("/");
                const fileId = parts[parts.length - 1];

                console.log("fotografia se elimina id", fileId);

                // Se llama la API de Drive para eliminar el archivo de la fotografía en Google Drive, se le pasa el ID a eliminar. 
                apiDriver.deleteFile(fileId).then((delete_File)=>{

                    // Se busca la URL de los PDF de incapacidad registrada. 
                    query ="SELECT `archivo_incapacidad` FROM `incapacidad` WHERE id_cedula_i = ?";
                    coneccion.query(query, [id_eliminar], (err, results)=>{
                        if(!err){

                            // Si no hay registros de URL de PDF, eliminamos los demás registros
                            // registros de horas extras, asistencias, inasistencias, cuenta bancaria y perfil del empleado.
                            if(results.length <= 0){
                                
                                 // Eliminamos el registro de horas extras registradas en la base de datos.
                                query ="DELETE FROM `horas_extras` WHERE id_cedula_h = ?";
                                coneccion.query(query, [id_eliminar], (err, results)=>{
                                    if(!err){

                                        // Eliminamos las asistencias registradas en la base de datos. 
                                        query = "DELETE FROM `asistencia` WHERE id_cedula_a = ?";
                                        coneccion.query(query, [id_eliminar], (err, results)=>{
                                            if(!err){

                                                // Eliminar las inasistencias registradas en la base de datos. 
                                                query = "DELETE FROM `inasistencia` WHERE id_cedula_ina = ?";
                                                coneccion.query(query, [id_eliminar], (err, results)=>{
                                                    if(!err){

                                                        // Eliminamos la cuenta bancaria registrada en la base de datos. 
                                                        query = "DELETE FROM `cuenta_bancaria_empleado` WHERE id_cedula_c = ?";
                                                        coneccion.query(query, [id_eliminar], (err, results)=>{

                                                            if(!err){

                                                                // Eliminamos el perfil del empleado. 
                                                                query = "DELETE FROM `empleado` WHERE id_cedula = ?";
                                                                coneccion.query(query, [id_eliminar], (err, results)=>{
                                                                    
                                                                    if(!err){
                                                                        return res.status(200).json({message: "funcion realizada con exito"});  
                                                                    }else{
                                                                        return res.status(500).json(err);
                                                                    }
                                                                });
                                                            }else{
                                                                return res.status(500).json(err);
                                                            }
                                                        });
                                                    }else{
                                                        return res.status(500).json(err)
                                                    }
                                                })
                                            }else{
                                                return res.status(500).json(err);
                                            }
                                        });
                                    }else{
                                        return res.status(500).json(err);
                                    }
                                });

                            // Si hay URL de PDF registradas, eliminamos los PDF de driver y luego eliminamos los registros de la base de datos.
                            }else{
                                 // Sacamos el número de URL guardadas
                                var numPDF= results.length;
                                
                                // Usamos el bucle for para realizar las eliminaciones en drive de los archivos existentes.
                                for (let i = 0; i <= numPDF-1; i++) {
                                    
                                    // Se obtiene la URL del PDF. 
                                    const url_pdf= results[i].archivo_incapacidad;
                                    
                                    // Sacamos el ID de la URL guardada en la base de datos, lo guardamos en la variable fileIdPDF
                                    const parts = url_pdf.split("/");
                                    const fileIdPDF = parts[parts.length - 1];

                                    // Se elimina el archivo PDF 
                                    apiDriver.deleteFile(fileIdPDF).then((delete_File)=>{
                                        console.log(delete_File);
                                    }).catch((error)=>{
                                        return res.status(500).json(error);
                                    });
                                }

                                // Eliminamos los registros de incapacidad ingresados a la base de datos.   
                                query ="DELETE FROM `incapacidad` WHERE id_cedula_i = ?";
                                coneccion.query(query, [id_eliminar], (err, results)=>{
                                    if(!err){

                                        // Eliminamos el registro de horas extras registradas en la base de datos. 
                                        query ="DELETE FROM `horas_extras` WHERE id_cedula_h = ?";
                                        coneccion.query(query, [id_eliminar], (err, results)=>{
                                            if(!err){

                                                // Eliminamos las asistencias registradas en la base de datos. 
                                                query = "DELETE FROM `asistencia` WHERE id_cedula_a = ?";
                                                coneccion.query(query, [id_eliminar], (err, results)=>{
                                                    if(!err){
                                                        
                                                        // Eliminar las inasistencias registradas en la base de datos. 
                                                        query = "DELETE FROM `inasistencia` WHERE id_cedula_ina = ?";
                                                        coneccion.query(query, [id_eliminar], (err, results)=>{
                                                            if(!err){

                                                                // Eliminamos la cuenta bancaria registrada en la base de datos. 
                                                                query = "DELETE FROM `cuenta_bancaria_empleado` WHERE id_cedula_c = ?";
                                                                coneccion.query(query, [id_eliminar], (err, results)=>{

                                                                    if(!err){

                                                                        // Eliminamos el perfil del empleado. 
                                                                        query = "DELETE FROM `empleado` WHERE id_cedula = ?";
                                                                        coneccion.query(query, [id_eliminar], (err, results)=>{
                                                                            
                                                                            if(!err){
                                                                                return res.status(200).json({message: "funcion realizada con exito"});  
                                                                            }else{
                                                                                return res.status(500).json(err);
                                                                            }
                                                                        });
                                                                    }else{
                                                                        return res.status(500).json(err);
                                                                    }
                                                                });
                                                            }else{
                                                                return res.status(500).json(err)
                                                            }
                                                        })
                                                    }else{
                                                        return res.status(500).json(err);
                                                    }
                                                });
                                            }else{
                                                return res.status(500).json(err);
                                            }
                                        });
                                    }else{
                                        return res.status(500).json(err);
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

// Se agrega un registro del empleado eliminado.  
router.post('/RegisEmpleado_eliminado', auth.authenticateToken, checkRole.check_Role, (req, res) => {
    const id_empleadoEliminado = req.body;

    // Se ase la inscripción a la base de datos del empleado que se eliminó. 
    var query = "INSERT INTO `empleados_eliminados`(`id_empleados_eliminados`, `motivo_eliminacion`, `fechaEliminacion`,  `empresa_empleado`) VALUES (?,?,?,?)";
    coneccion.query(query, [id_empleadoEliminado.id_empleados_eliminados, id_empleadoEliminado.motivo_eliminacion, id_empleadoEliminado.fechaEliminacion, id_empleadoEliminado.empresa_empleado], (err, results)=>{
        if(!err){
            return res.status(200).json({message: "se registra el empleado eliminado"});
        }else{
            return res.status(500).json(err);
        }
    });
});

// Se consultan los empleados eliminados por la empresa. 
router.get('/Empleado_eliminados/:id', auth.authenticateToken, checkRole.check_Role, (req, res, next) =>{
    const resgistro_empresa = req.params.id;

    // Consulta a la base de datos de los empleados eliminados. 
    var query = "SELECT `id_empleados_eliminados`, `motivo_eliminacion`, `fechaEliminacion` FROM `empleados_eliminados` WHERE empresa_empleado = ?";
    coneccion.query(query, [resgistro_empresa], (err, results)=>{
        if(!err){
            return res.status(200).json(results);

        }else{
            return res.status(500).json(err);
        }
    });
});



module.exports = router;
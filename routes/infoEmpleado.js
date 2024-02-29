const express = require('express');
// Conexión a la base de datos. 
const coneccion = require('../database/conexion_db');
const { route } = require('./users_route');

// Definir la variable de rutas para comenzar las funciones 
const router = express.Router();

// Variables de autenticación de rol y verificación de token. 
const auth = require('../services/authentication');
const checkRole = require('../services/check_Role');

// Se llama al servicio API Google Driver. 
const apiDriver = require('../services/api_driver');

const { downloadFile } = require('../services/api_driver');

const fs = require('fs');

//Procesar imagen. 
const multer = require('multer'); 
const { authenticate } = require('@google-cloud/local-auth');
const { Console, error } = require('console');

// Se llaman las variables globales. 
require('dotenv').config();

// Ruta para descargar la imagen del empleado almacenada en drive. 
router.get('/fotografiaDescargar/:id',  auth.authenticateToken, checkRole.check_Role, async (req, res) => {
    try {
      const Id_emple = req.params.id;
      var query = "SELECT `fotografia` FROM `empleado` WHERE id_cedula = ?";
      coneccion.query(query, [Id_emple], async (err, results) => {
        if (!err) {
          if (results.length <= 0) {
            return res.status(400).json({ message: "Usuario no encontrado" });
          } else {
            // Obtén la URL de la imagen. 
            const url_fotografia = results[0].fotografia;
  
            // Separa el ID del archivo de la URL guardada en la base de datos. 
            const parts = url_fotografia.split("/");
            const fileId = parts[parts.length - 1];
  
            // Descarga el archivo de Google Drive. 
            const fileContent = await downloadFile(fileId);
  
            // Retorna la imagen descargada como respuesta.
            res.writeHead(200, {
              'Content-Type': 'image/jpeg',
              'Content-Length': fileContent.length,
            });
            res.end(fileContent);
          }
        } else {
          console.error(err);
          res.status(500).send('Error al obtener la url desde la base de datos');
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al descargar la imagen desde Google Drive');
    }
});

// Ruta para descargar el PDF de incapacidad del empleado almacenado en drive. 
router.get('/pdfDescargar/:id', auth.authenticateToken, checkRole.check_Role, async (req, res) => {
    try {
      const Id_emple = req.params.id;
      var query = "SELECT `archivo_incapacidad` FROM `incapacidad` WHERE id_cedula_i = ?";
      coneccion.query(query, [Id_emple], async (err, results) => {
        if (!err) {
          if (results.length <= 0) {
            return res.status(400).json({ message: "Usuario no tiene pdf de incapacidad" });
          } else {
            //Obtén la URL del PDF.  
            const url_pdf = results[0].archivo_incapacidad;
  
            // Separa el ID del archivo de la URL guardada en la base de datos. 
            const parts = url_pdf.split("/");
            const fileId = parts[parts.length - 1];
  
            // Descarga el archivo de Google Drive.
            const fileContent = await downloadFile(fileId);
  
            // Retorna el PDF descargado como respuesta. 
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Length': fileContent.length,
              });
              res.end(fileContent);
          }
        } else {
          console.error(err);
          res.status(500).send('Error al obtener la URL desde la base de datos. ');
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al descargar el PDF desde Google Drive.');
    }
});

// Ruta para breve información del historial del empleado a eliminar. 
router.get('/infoEmpleadoEliminar/:id',  auth.authenticateToken, checkRole.check_Role, (req, res) => {
    const Id_Refernt = req.params.id;
    
    var query = "SELECT `id_cedula` FROM `empleado` WHERE id_cedula = ?";
    coneccion.query(query, [Id_Refernt], (err, results) =>{
        if(!err){
            if(results.length <= 0){
                return res.status(400).json({message: "usuario no encontrado"});
            }else{

                query = "SELECT `id_cedula`, `tipo_documento`, `nombre`, `apellidos`, `fecha_nacimiento`, `pais`, `num_contacto`, `correo`, `direccion`, `hora_inicio`, `hora_fin`, `primer_dias_laboral`, `ultimo_dias_laboral`, `cargo` FROM `empleado` WHERE id_cedula = ?";
                coneccion.query(query, [Id_Refernt], (err, results)=>{
                    if(!err){
                        const perfil  = results;

                        query = "SELECT COUNT(*) as total_inserciones_asistencias FROM `asistencia` WHERE id_cedula_a = ?";
                        coneccion.query(query, [Id_Refernt], (err, results)=>{
                            if(!err){
                                const asistencia  = results;

                                query = "SELECT total FROM horas_extras WHERE id_cedula_h = ? ORDER BY id_registro_horas_extras DESC LIMIT 1;";
                                coneccion.query(query, [Id_Refernt], (err, results)=>{
                                    if(!err){
                                        const totalHorasExtras  = results;

                                        query = "SELECT COUNT(*) as total_inserciones_incapacidades FROM `incapacidad` WHERE id_cedula_i = ?";
                                        coneccion.query(query, [Id_Refernt], (err, results)=>{
                                            if(!err){
                                                const incapacidades  = results;
        
                                                query = "SELECT COUNT(*) as total_inserciones_inasistencias FROM `inasistencia` WHERE id_cedula_ina = ?";
                                                coneccion.query(query, [Id_Refernt], (err, results)=>{
                                                    if(!err){
                                                        const inasistencias  = results;
                                                        
                                                        query = "SELECT `salario` FROM `cuenta_bancaria_empleado` WHERE id_cedula_c =?";
                                                        coneccion.query(query, [Id_Refernt], (err, results)=>{
                                                            if(!err){
                                                                const salario  = results;
                        
                                                                return res.status(200).json({perfil, salario, asistencia, totalHorasExtras, incapacidades, inasistencias});
                        
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
        }
    });
});

// Información más detallada del empleado. 
router.get('/infoEmpleado/:id',  auth.authenticateToken, checkRole.check_Role, (req, res) => {
    const Id_info = req.params.id;

    var query = "SELECT `id_cedula` FROM `empleado` WHERE id_cedula = ?";
    coneccion.query(query, [Id_info], (err, results) =>{
        if(!err){
            if(results.length <= 0){
                return res.status(400).json({message: "usuario no encontrado"});
            }else{
    
                query = "SELECT `id_cedula`, `tipo_documento`, `nombre`, `apellidos`, `fecha_nacimiento`, `pais`, `num_contacto`, `correo`, `direccion`, `hora_inicio`, `hora_fin`, `primer_dias_laboral`, `ultimo_dias_laboral`, `cargo` FROM `empleado` WHERE id_cedula = ?";
                coneccion.query(query, [Id_info], (err, results)=>{
                    if(!err){
                        const perfil  = results;
                        
                        query = "SELECT `num_cuenta_bancaria`, `nom_banco`, `tipo_cuenta`, `salario` FROM `cuenta_bancaria_empleado` WHERE id_cedula_c = ?";
                        coneccion.query(query, [Id_info], (err, results)=>{
                            if(!err){
                                const cuentaBancaria = results;

                                query = "SELECT  `fecha_registro`, `fecha_incapacidad`, `causa`, `descripcion`, `archivo_incapacidad`, `cantidad_dias_incapacidad`  FROM `incapacidad` WHERE id_cedula_i = ? ORDER BY Id_registro_incapacidad DESC LIMIT 1";
                                coneccion.query(query, [Id_info], (err, results)=>{
                                   if(!err){
                                        const incapacidades = results;

                                        query = "SELECT  `fecha`, `horas_extras`, `total` FROM `horas_extras` WHERE id_cedula_h = ? ORDER BY id_registro_horas_extras DESC LIMIT 1";
                                        coneccion.query(query, [Id_info], (err, results)=>{
                                            if(!err){
                                                const horasExtras = results;
                                                
                                                query = "SELECT `fecha`, `horario` FROM `asistencia` WHERE id_cedula_a = ? ORDER BY id_registro_asistencia DESC LIMIT 1";
                                                coneccion.query(query, [Id_info], (err, results)=>{
                                                    if(!err){
                                                            const asistencia = results;

                                                            query = "SELECT `fecha` FROM `inasistencia` WHERE id_cedula_ina = ? ORDER BY id_registro_inasistencia DESC LIMIT 1";
                                                            coneccion.query(query, [Id_info], (err, results)=>{
                                                            if(!err){
                                                                const inasistencia = results;
                                                            
                                                                return res.status(200).json({perfil, cuentaBancaria, incapacidades, horasExtras, asistencia, inasistencia});
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
});

// Se consulta la información de la plataforma más detallada para las tablas 
router.get('/tablaContec/:id',  auth.authenticateToken, checkRole.check_Role, (req, res) => {
    const Id_tabla = req.params.id;

    var query = "SELECT `id_cedula` FROM `empleado` WHERE id_cedula = ?";
    coneccion.query(query, [Id_tabla], (err, results) =>{
        if(!err){
            if(results.length <= 0){
                return res.status(400).json({message: "usuario no encontrado"});
            }else{
                query = " SELECT `fecha`, `horario` FROM `asistencia` WHERE id_cedula_a = ? ORDER BY `fecha` DESC;";
                coneccion.query(query, [Id_tabla], (err, results)=>{
                    if(!err){
                        const asistencia = results;

                        query = "SELECT  `fecha`, `horas_extras`, `total` FROM `horas_extras` WHERE id_cedula_h = ? ORDER BY `fecha` DESC;";
                        coneccion.query(query, [Id_tabla], (err, results)=>{
                            if(!err){
                                const horas_extras = results;

                                query = "SELECT `fecha` FROM `inasistencia` WHERE id_cedula_ina = ? ORDER BY `fecha` DESC;" ;
                                coneccion.query(query, [Id_tabla], (err, results)=>{
                                    if(!err){
                                        const inasistencia = results;

                                        query = "SELECT  `fecha_registro`, `fecha_incapacidad`, `causa`, `descripcion`, `archivo_incapacidad`, `cantidad_dias_incapacidad`  FROM `incapacidad` WHERE id_cedula_i = ? ORDER BY Id_registro_incapacidad DESC;";
                                        coneccion.query(query, [Id_tabla], (err, results)=>{
                                            if(!err){
                                                const incapacidad = results;

                                                return res.status(200).json({asistencia, horas_extras, inasistencia, incapacidad});
                                            }else{
                                                return res.status(500).json(err);
                                            }
                                        })
                                    }else{
                                        return res.status(500).json(err);
                                    }
                                })
                            }else{
                                return res.status(500).json(err);
                            }
                        })
                    }else{
                        return res.status(500).json(err);
                    }
                })
            }
        }else{
            return res.status(500).json(err);
        }
    })
})

module.exports = router;

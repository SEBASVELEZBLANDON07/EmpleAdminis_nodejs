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

const { downloadFile } = require('../services/api_driver');

const fs = require('fs');

//procesar imagen 
const multer = require('multer'); 
const { authenticate } = require('@google-cloud/local-auth');
const { Console, error } = require('console');

//se llmana las variables gobales
require('dotenv').config();

// Ruta para descargar la imagen
router.get('/fotografiaDescargar/:id', async (req, res) => {
    try {
      const Id_emple = req.params.id;
      var query = "SELECT `fotografia` FROM `empleado` WHERE id_cedula = ?";
      coneccion.query(query, [Id_emple], async (err, results) => {
        if (!err) {
          if (results.length <= 0) {
            return res.status(400).json({ message: "Usuario no encontrado" });
          } else {
            // Obtén la URL de la imagen
            const url_fotografia = results[0].fotografia;
  
            // Separa el ID del archivo de la URL guardada en la base de datos
            const parts = url_fotografia.split("/");
            const fileId = parts[parts.length - 1];
  
            // Descarga el archivo de Google Drive
            const fileContent = await downloadFile(fileId);
  
            // Devuelve la imagen descargada como respuesta
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

// Ruta para descargar la el pdf de incapacidad
router.get('/pdfDescargar/:id', async (req, res) => {
    try {
      const Id_emple = req.params.id;
      var query = "SELECT `archivo_incapacidad` FROM `incapacidad` WHERE id_cedula_i = ?";
      coneccion.query(query, [Id_emple], async (err, results) => {
        if (!err) {
          if (results.length <= 0) {
            return res.status(400).json({ message: "Usuario no encontrado" });
          } else {
            // Obtén la URL del pdf
            const url_pdf = results[0].archivo_incapacidad;
  
            // Separa el ID del archivo de la URL guardada en la base de datos
            const parts = url_pdf.split("/");
            const fileId = parts[parts.length - 1];
  
            // Descarga el archivo de Google Drive
            const fileContent = await downloadFile(fileId);
  
            // Devuelve el pdf descargada como respuesta
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Length': fileContent.length,
              });
              res.end(fileContent);
          }
        } else {
          console.error(err);
          res.status(500).send('Error al obtener el la url desde la base de datos');
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al descargar el pdf desde Google Drive');
    }
});

//ruta para breve informacion del historial del emplado 
router.get('/infoEmpleadoEliminar/:id', (req, res) => {
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

//ruta para reguistros del empleado 
router.get('/infoEmpleado/:id', (req, res) => {
    const Id_info = req.params.id;

    var query = "SELECT `id_cedula` FROM `empleado` WHERE id_cedula = ?";
    coneccion.query(query, [Id_info], (err, results) =>{
        if(!err){
            if(results.length <= 0){
                return res.status(400).json({message: "usuario no encontrado"});
            }else{
                

                query = "SELECT `id_cedula`, `tipo_documento`, `nombre`, `apellidos`, `fecha_nacimiento`, `pais`, `num_contacto`, `correo`, `direccion`, `hora_inicio`, `hora_fin`, `primer_dias_laboral`, `ultimo_dias_laboral`, `cargo`, `fotografia`, `estatus_notificacion`, `id_empresa_e` FROM `empleado` WHERE id_cedula = ?";
                coneccion.query(query, [Id_info], (err, results)=>{
                    if(!err){
                        const perfil  = results; 
                        query = "SELECT `num_cuenta_bancaria`, `nom_banco`, `tipo_cuenta`, `salario`, `id_cedula_c` FROM `cuenta_bancaria_empleado` WHERE id_cedula_c = ?";
                        coneccion.query(query, [Id_info], (err, results)=>{
                            if(!err){
                                const cuentaBancaria = results;
                                query = "SELECT `Id_registro_incapacidad`, `fecha_registro`, `fecha_incapacidad`, `causa`, `descripcion`, `archivo_incapacidad`, `cantidad_dias_incapacidad`, `id_cedula_i` FROM `incapacidad` WHERE id_cedula_i = ?";
                                coneccion.query(query, [Id_info], (err, results)=>{
                                   if(!err){
                                        const incapacidades = results;

                                        query = "SELECT `id_registro_horas_extras`, `fecha`, `horas_extras`, `total`, `id_cedula_h` FROM `horas_extras` WHERE id_cedula_h = ?";
                                        coneccion.query(query, [Id_info], (err, results)=>{
                                            if(!err){
                                                const horasExtras = results;
                                                
                                                query = "SELECT `id_registro_asistencia`, `fecha`, `horario`, `id_cedula_a` FROM `asistencia` WHERE id_cedula_a = ?";
                                                coneccion.query(query, [Id_info], (err, results)=>{
                                                if(!err){
                                                        const asistencia = results;

                                                        return res.status(200).json({perfil, cuentaBancaria, incapacidades, horasExtras, asistencia});
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
    //return res.status(200).json({message: "funcion realizada con exito"});
});





module.exports = router;

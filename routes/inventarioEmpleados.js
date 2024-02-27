const express = require('express');
// Conexión a la base de datos.  
const coneccion = require('../database/conexion_db');
const { route } = require('./users_route');

// Definir la variable de rutas para comenzar las funciones.  
const router = express.Router();

// Variables de autenticación de rol y verificación de token. 
const auth = require('../services/authentication');
const checkRole = require('../services/check_Role');

// Se llama al servicio API Google Drive.
const apiDriver = require('../services/api_driver');
const fs = require('fs');

// Procesar imagen. 
const multer = require('multer'); 
const { authenticate } = require('@google-cloud/local-auth');
const { Console, error } = require('console');

// Se llaman las variables globales 
require('dotenv').config();

// Se buscan los empleados de la empresa para el inventario general. 
router.get('/inventarioGeneral/:id', auth.authenticateToken, checkRole.check_Role, (req, res, next) =>{
    const inventario = req.params.id;

    var query ="SELECT `id_empresa` FROM `empresa` WHERE nom_empresa = ?";
    coneccion.query(query, [inventario], (err, results)=>{
        if(!err){
            const id_empresa = results[0].id_empresa
            query = "SELECT `id_cedula`, `tipo_documento`, `nombre`, `apellidos`,  `correo`, `cargo` FROM `empleado` WHERE id_empresa_e = ?";
            coneccion.query(query, [id_empresa], (err, results)=>{
                if(!err){
                    return res.status(200).json(results);
                }else{
                    return res.status(500).json(err);
                }
            });
        }else{
            return res.status(500).json(err);
        }
    });
});



module.exports = router;
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

//se buscan los empleados de le mepresa para el inventario general  
router.get('/inventarioGeneral/:id', (req, res, next) =>{
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
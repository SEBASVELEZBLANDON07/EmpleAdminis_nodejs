const express = require('express');
const coneccion = require('../database/conexion_db');
const router = express.Router();

const auth = require('../services/authentication');
const checkRole = require('../services/check_Role');

//agragar una categoria 
router.post('/add', auth.authenticateToken, checkRole.check_Role, (req, res, next)=>{
    let category = req.body;
    query = "INSERT INTO category (name) VALUES (?)";
    coneccion.query(query, [category.name], (err, results)=>{
        if(!err){
            return res.status(200).json({message: "categoria insertardad correctamente"});
        }else{
            return res.status(500).json(err);
        }
    });
});

//traer todo lo registrado en la base de datos 
router.get('/get', auth.authenticateToken, (req, res, next)=>{
    //ORDER BY name ordena los resultados traidos de la db ordenados por el alfabeto segun su name ingresado 
    query = "SELECT * FROM category ORDER BY name";
    coneccion.query(query, (err, results)=>{
        if(!err){
            return res.status(200).json(results);
        }else{
            return res.status(500).json(err);
        }
    });
});


//actualizar el name de la categoria 
router.patch('/update', auth.authenticateToken, checkRole.check_Role, (req, res, next)=>{
    let category = req.body;
    query = "UPDATE category SET name=? WHERE id=?";
    coneccion.query(query, [category.name, category.id], (err, results)=>{
        if(!err){
            if (results.affectedRows == 0 ){
                return res.status(404).json({message: "categoria no encontrada"});
            }else {
                return res.status(200).json({message: "categoria actualizada correctamente"});
            } 
        }else{
            return res.status(500).json(err);
        }
    });
})


module.exports = router;
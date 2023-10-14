const express = require('express');
const coneccion = require('../database/conexion_db');
const router = express.Router();

const auth = require('../services/authentication');

router.get('/details', auth.authenticateToken, (req, res, next)=>{
    var categoryCount;
    var productCount;
    var billComnt;

    var query = "SELECT count(id) AS categoryCount FROM category";
    coneccion.query(query, (err, results)=>{
        if(!err){
            categoryCount = results[0].categoryCount
        }else{
            return res.status(500).json(err)  
        }
    });

    var query = "SELECT count(id) AS productCount FROM product";
    coneccion.query(query, (err, results)=>{
        if(!err){
            productCount = results[0].productCount
        }else{
            return res.status(500).json(err)  
        }
    });

    var query = "SELECT count(id) AS billComnt FROM product";
    coneccion.query(query, (err, results)=>{
        if(!err){
            billComnt = results[0].billComnt
            var data = {
                category: categoryCount,
                product: productCount,
                bill: billComnt
            }
            return res.status(200).json(data);
        }else{
            return res.status(500).json(err);  
        }
    });
});


module.exports = router;

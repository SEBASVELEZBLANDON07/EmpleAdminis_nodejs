const express = require('express');
const coneccion = require('../database/conexion_db');
const router = express.Router();

const auth = require('../services/authentication');
const checkRole = require('../services/check_Role');

//agregarmos datos a la base product
router.post('/add', auth.authenticateToken, checkRole.check_Role, (req, res, next)=>{
    let product = req.body;
    var query = "INSERT INTO product (name, category_id, description, price, status)  VALUES (?,?,?,?, 'true')";
    coneccion.query(query, [product.name, product.category_id, product.description, product.price], (err, results)=>{
        if(!err){
            return res.status(200).json({message: "producto insertardo correctamente"});
        }else{
            return res.status(500).json(err);
        }
    });
});

//se hace las consultas de la tabal pruducto y con la calve foranea de la tabla categoria
router.get('/get', auth.authenticateToken, checkRole.check_Role, (req, res, next)=>{
    var query = "SELECT P.id, P.name, P.category_id, P.description, P.price, P.status, C.id AS categoryId, C.name AS categoryName FROM product AS P INNER JOIN category AS C ON P.category_id = C.id;";
    coneccion.query(query, (err, results)=>{
        if(!err){
            return res.status(200).json(results);
        }else{
            return res.status(500).json(err);
        }
    });
});

//se buscan los pruductos con el id de la categoria y los que se encuentran en true 
router.get('/getByCategory/:id', auth.authenticateToken, checkRole.check_Role, (req, res, next)=>{
    const id_Category_id = req.params.id;
    var query = "SELECT id, name FROM product WHERE category_id=? and status='true'";
    coneccion.query(query, [id_Category_id], (err, results)=>{
        if(!err){
            return res.status(200).json(results);
        }else{
            return res.status(500).json(err);
        }
    });
});

//buscamos por medio de id del product 
router.get('/getByid/:id', auth.authenticateToken, checkRole.check_Role, (req, res, next)=>{
    const id_product_id = req.params.id;
    var query = "SELECT id, name, description, price FROM product WHERE id=?";
    coneccion.query(query, [id_product_id], (err, results)=>{
        if(!err){
            return res.status(200).json(results[0]);
        }else{
            return res.status(500).json(err);
        }
    });
});

//actualizar el name de la categoria 
router.patch('/update', auth.authenticateToken, checkRole.check_Role, (req, res, next)=>{
    let product = req.body;
    var query = "UPDATE product SET name=?, category_id=?, description=?, price=?  WHERE id=?";
    coneccion.query(query, [product.name, product.category_id, product.description, product.price, product.id], (err, results)=>{
        if(!err){
            if (results.affectedRows == 0 ){
                return res.status(404).json({message: "product no encontrada"});
            }else {
                return res.status(200).json({message: "product actualizado correctamente"});
            } 
        }else{
            return res.status(500).json(err);
        }
    });
});

//se elimina el producto del id indicado
router.delete('/delete/:id', auth.authenticateToken, checkRole.check_Role, (req, res, next)=>{
    const id_eliminar = req.params.id;
    var query = "DELETE FROM product WHERE id=?";
    coneccion.query(query, [id_eliminar], (err, results)=>{
        if(!err){
            if (results.affectedRows == 0 ){
                return res.status(404).json({message: "product no encontrada"});
            }else {
                return res.status(200).json({message: "product eliminado correctamente"});
            } 
        }else{
            return res.status(500).json(err);
        }
    });
});


//actualizar el status de los productos
router.patch('/updateStatus', auth.authenticateToken, checkRole.check_Role, (req, res, next)=>{
    let product = req.body;
    var query = "UPDATE product SET status=? WHERE id=?";
    coneccion.query(query, [product.status, product.id], (err, results)=>{
        if(!err){
            if (results.affectedRows == 0 ){
                return res.status(404).json({message: "product no encontrada"});
            }else {
                return res.status(200).json({message: "status actualizada correctamente"});
            } 
        }else{
            return res.status(500).json(err);
        }
    });
});





module.exports = router;
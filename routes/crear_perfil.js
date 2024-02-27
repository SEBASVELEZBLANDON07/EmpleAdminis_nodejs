const express = require('express');
// Conexión a la base de datos. 
const coneccion = require('../database/conexion_db');
const { route } = require('./users_route');

// Definir la variable de rutas para comenzar las funciones. 
const router = express.Router();

// Variables de autenticación de rol y verificación de token. 
const auth = require('../services/authentication');
const checkRole = require('../services/check_Role');

// Ingresar nombre de empresa a la base de datos.  
router.post('/InsEmpre', (req, res) => {
    let crearP =req.body;
    // Se verifica si hay una empresa con el mismo nombre. 
    var query = "select nom_empresa from empresa where nom_empresa=?";
    coneccion.query(query, [crearP.nom_empresa], (err, results) =>{
        if(!err){
            if (results.length <= 0){
                // Se inserta la nueva empresa a la base de datos. 
                query = "insert into empresa (nom_empresa) values (?)";
                coneccion.query(query, [crearP.nom_empresa], (err, results) =>{
                   if (!err){
                    return res.status(200).json({message:"insercion exitosa"});
                   }else{
                        return res.status(500).json(err);
                   } 
                })
            }else{
                return res.status(400).json({message: "empresa ya ingresada"});
            }
        }else{
            return res.status(500).json(err);
        }
    });
});

// Ingresa el usuario administrador de esta empresa creada. 
router.post('/InsEmpreUSer', (req, res) => {
    let crearfP =req.body;
    // Se verifica si hay otro correo idéntico en la base de datos. 
    var query = "select correo from user_perfil_empresa where correo=?";
    coneccion.query(query, [crearfP.nom_empresa], (err, results) =>{
        if(!err){
            if (results.length <= 0){
                
                // Se obtiene el ID de la empresa. 
                query = "SELECT id_empresa FROM empresa WHERE nom_empresa = ?;";
                coneccion.query(query, [crearfP.nom_empresa], (err, results) =>{
                   if (!err){
                        const EMPRESA_id_empresa = results[0].id_empresa;
                        //console.log(EMPRESA_id_empresa)
                    
                        // Se inserta el usuario administrador de la empresa. 
                        query = "insert into user_perfil_empresa (correo, password, EMPRESA_id_empresa, status,  role) values (?,?,?, 'true', 'admin')";
                        coneccion.query(query, [crearfP.correo, crearfP.password, EMPRESA_id_empresa], (err, results) =>{
                            if (!err){
                                return res.status(200).json({message:"empresa y usuario insertado exitosa"});
                            }else{
                                return res.status(500).json(err);
                            } 
                        })
                    }else{
                        return res.status(400).json({message: "empresa no encontrada"});
                    } 
                })
            }else{
                return res.status(400).json({message: "empresa ya ingresada"});
            }
        }else{
            return res.status(500).json(err);
        }
    });
});

//busca el nombre de la empresa con la que se inició sesión. 
router.get('/nombreEmpresa', auth.authenticateToken, checkRole.check_Role, (req, res) => {
    const correo = req.query.correo;
    if(!correo){
        return res.status(500).json('no se inserto correo', error)
    }else{
        console.log(correo);
        // Se busca el nombre de la empresa con el correo desde la tabla user_perfil_empresa
        var query = "SELECT P.nom_empresa AS nombreempresa FROM empresa AS P INNER JOIN user_perfil_empresa AS U ON P.id_empresa = U.EMPRESA_id_empresa WHERE U.correo = ?";
        coneccion.query(query, [correo], (err, results) =>{
            if(err){
                console.error('Error al ejecutar la consulta SQL:', error);
                return res.status(400).json({ error: 'Error interno del servidor' });
            }else{
                if (results.length === 0) {
                    return res.status(404).json({ error: 'No se encontró información para el correo proporcionado.' });
                }
                const nomEmpresa = results[0].nombreempresa;
                // Retorna el nombre de la empresa. 
                return res.status(200).json({ nomEmpresa });
            }
        })
    }
})


module.exports = router;
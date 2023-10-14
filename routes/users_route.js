//se llama a las dependencias instaladas
const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

//coneccion a la base de dastos 
const coneccion = require('../database/conexion_db');

//definir la variable de rutas para comensar las funsiones 
const router = express.Router();

//const { query } = require('express');

//se llmana las variables gobales
require('dotenv').config();

//variables de autenticacion de rol y verificasion de token 
const auth = require('../services/authentication');
const checkRole = require('../services/check_Role');









//verifica el email, y inserta un nuevo usuario si no esiste
router.post('/signup', (req, res) => {
    let user =req.body;
    var query = "select email, password, role, status from prueba_node where email=?";
    coneccion.query(query, [user.email], (err, results) =>{
        if(!err){
            if (results.length <= 0){
                query = "insert into prueba_node (name, contact, email, password, status, role) values (?,?,?,?, 'false', 'user')";
                coneccion.query(query, [user.name, user.contact, user.email, user.password], (err, results) =>{
                   if (!err){
                    return res.status(200).json({message:"insercion exitosa"});
                   }else{
                        return res.status(500).json(err);
                   } 
                })
            }else{
                return res.status(400).json({message: "Email ya ingresado"});
            }
        }else{
            return res.status(500).json(err);
        }
    });
});

//verifica el acceso, a los usuarios permitidos les envia un token, a lo que no estan verificados los manda averificar a la administracion
router.post('/login', (req, res) => {
    const user = req.body;
    var query = "select correo, password, status,  role from user_perfil_empresa where correo=?";
    coneccion.query(query, [user.correo], (err, results) => {
        if (!err){
            if(results.length <= 0 || results[0].password != user.password){
                return res.status(401).json({message: "usuario o contraseña incorrecto"});
            }else{
                if(results[0].status === "false"){
                    return res.status(402).json({message: "comunicarse a la administracion"});
                }else{
                    if(results[0].password == user.password){
                        const resultado = {correo: results[0].correo, role: results[0].role};
                        const accesstoken = jwt.sign(resultado, process.env.ACCESS_TOKEN, {
                            expiresIn: "8H",
                        });
                        return res.status(200).json({ token: accesstoken});
                    }else{
                        return res.status(400).json({message: "sistema caido, intenta mas tarde"});
                    }
                }
            }
        }else{
            return res.status(500).json(err);
        }
    });
});

//por este medio se envia el correo de recuperacion
var transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        //usuario y contraseña de el correo electronico que envia los correos de recuperacion
        user: process.env.EMAIL,
        pass: process.env.PASSWORD_EMAIL
    }
})

//funcion para recuperar las contraseñas
router.post('/forgotpassword', (req, res) => {
    const user = req.body;
    var query = "select email, password from prueba_node where email=?";
    coneccion.query(query, [user.email], (err, results) =>{
        if(!err){
            if(results.length <= 0 ){
                return res.status(200).json({message: "El Correo ingresado no esta registrado en la base de datos"});
            }else{
                var mailOptions = {
                    from: process.env.EMAIL,
                    to: results[0].email,
                    subject: 'EmpleAdmin recuperacion de contraseña',
                    html: '<p> <b>tus credenciales del sistema son los siguientes:</b> <br> <b>EMAIL: <b> '+results[0].email+'</b> <br> <b>password: </b> '+results[0].password+' <br> <a href="http://locaolhost:3000/">click para aceder al sistema</a> <br></p>'
                };
                transport.sendMail(mailOptions, function(error, info){
                    if (error){
                        console.log(error);
                    }else{
                        console.log("correo enviado con exito" + info.response);
                    }
                });
                return res.status(200).json({message: "Email de recuperacion enviado"});
            }
        }else{
            return res.status(500).json(err);
        }
    });
});

//consulta de los datos solo de los que son role = user
router.get('/get', auth.authenticateToken, checkRole.check_Role, (req, res) => {
    var query = "select id, name, email, contact, status from prueba_node where role='user'";
    coneccion.query(query, (err, results) =>{
        if (!err){
            return res.status(200).json(results);
        }else{
            return res.status(500).json(err);
        }
    });
});

//actualizar status 
router.patch('/update', auth.authenticateToken, (req,res)=>{
    let user = req.body;
    var query = "update prueba_node set status=? where id=?";
    coneccion.query(query, [user.status, user.id], (err, results)=>{
        if(!err){
            if(results.affectedRows == 0){
                return res.status(404).json({message: "el usuario no existe "})
            }else{
                //esta aca else elimina 
                return res.status(200).json({message: "usuario actualizado con exito"});
            }
        }else{
            return res.status(500).json(err)
        }
    });
});

//se verifica el token 
router.get('/checkToken', auth.authenticateToken, (req,res)=>{
    return res.status(200).json({message: "true"});
});

//cambiar la contraseña autentifica la contraseña antigua con la ingresada y si son correctas cambia la contraseña por la nueva
router.post('/changePassword', auth.authenticateToken, (req, res) => {
    const user = req.body;
    const email = res.locals.email;
    var query = "select * from prueba_node where email=? and password=?";
    coneccion.query(query, [email, user.oldPassword],(err, results)=>{
        if(!err){
            if(results.length <= 0){
                return res.status(400).json({message: "contraseña autigua incorrecta"});
            }else{
                if(results[0].password == user.oldPassword){
                    query = "update prueba_node set password=? where email=?";
                    coneccion.query(query, [user.newPassword, email], (err, results)=>{
                        if(!err){
                            return res.status(200).json({message: "contraseña cambiada exitosamente"});
                        }else{
                            return res.status(500).json(err)
                        }
                    })
                }else{
                    return res.status(400).json({message: "sistema caido intenta mas tarde"})
                }
            }
        }else{
            return res.status(500).json(err);
        }
    })
})


module.exports = router;
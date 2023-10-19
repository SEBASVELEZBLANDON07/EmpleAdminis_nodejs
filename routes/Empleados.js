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

//se llmana las variables gobales
require('dotenv').config();

//----------------------

function uploadImageToGoogleDrive() {
  const filePath = './controllers/logo_logo.png';
  const fileData = {
    buffer: fs.readFileSync(filePath),
    mimeType: 'image/jpeg', // Cambia el tipo MIME según el tipo de imagen
    originalname: 'logo_experimentando.png', // Nombre original del archivo
  };

  apiDriver.uploadFile(fileData)
  .then((imageUrl) => {
    console.log('URL de la imagen en Google Drive:', imageUrl);
  })
  .catch((error) => {
    console.error('Error al cargar la imagen:', error);
  });
}


// Configura multer para guardar las imágenes en una carpeta
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './controllers');
  },
  filename: function (req, file, cb) {
    // Usa el nombre original del archivo
    cb(null, file.originalname); 
  }
});
const upload = multer({ storage: storage });

//ingresar los datos personales del empleado 
router.post('/InsEmpleado', auth.authenticateToken, checkRole.check_Role, upload.single('imagen'), (req, res) => {
  let inset_empleado = req.body;  

  //se verifica si no hay otro emppleado con ese id 
  var query = "SELECT id_cedula FROM empleado WHERE id_cedula = ?";
  coneccion.query(query, [inset_empleado.id_cedula], (err, results) =>{

    if(!err){

      if(results.length <= 0){

        //se busca la  el id de la empresa a donde se va a ingresar el empleado
        query = "SELECT id_empresa FROM empresa WHERE nom_empresa = ?;";
        coneccion.query(query, [inset_empleado.nom_empresa], (err, results) =>{

          if(!err){
            //console.log("paso el error ")

            if(results.length >= 0){
              const imagen = req.file;

              //se verifica si hay un file llamado imagen 
              if (!imagen) {
                return res.status(403).json({ message: "No se subió ningún archivo" });
              }else{

                //se guarda la imagen en filePath
                const filePath = imagen.path;
                
                //se define el fileobject
                const fileData = {
                  //se octine la imagen a procesar 
                  buffer: fs.readFileSync(filePath),
                  //tipo MIME según el tipo de imagen
                  mimeType: 'image/jpeg', 
                  //nombre con el que se guada el archivo en driver
                  originalname: inset_empleado.id_cedula + '-nombre-' +  inset_empleado.nombre,
                };
                const fotografia = null

                //se procesa la imagen, se envia asia la api de driver para suvirla a driver 
                apiDriver.uploadFile(fileData).then((imageUrl) => {
                  
                  //se guarda la url de la imagen guardada 
                  const fotografia = imageUrl; 
                  console.log('URL de la imagen en Google Drive:', imageUrl);
                 
                  //se relaciona el id de la empresa 
                  const id_empresa_e = results[0].id_empresa;
                  console.log(id_empresa_e);

                  //se insertan los datos del empleado a la base de datos
                  query = "INSERT INTO `empleado`(`id_cedula`, `tipo_documento`, `nombre`, `apellidos`, `fecha_nacimiento`,  `pais`, `num_contacto`, `correo`, `direccion`, `hora_inicio`, `hora_fin`, `primer_dias_laboral`, `ultimo_dias_laboral`, `cargo`, `fotografia`, `estatus_notificacion`, `id_empresa_e`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'true',?);"
                  coneccion.query(query, [inset_empleado.id_cedula, inset_empleado.tipo_documento, inset_empleado.nombre, inset_empleado.apellidos, inset_empleado.fecha_nacimiento, inset_empleado.pais, inset_empleado.num_contacto, inset_empleado.correo, inset_empleado.direccion, inset_empleado.hora_inicio, inset_empleado.hora_fin, inset_empleado.primer_dias_laboral,  inset_empleado.ultimo_dias_laboral, inset_empleado.cargo, fotografia, id_empresa_e], (err, results)=>{
                    
                    if (!err){
                      return res.status(200).json({message:"Función realizada con éxito"});
                    }else{
                      return res.status(500).json(err);
                    } 
                  })

                }).catch((error) => {
                  console.error('Error al cargar la imagen:', error);
                });                 
              }
            }else{
                return res.status(402).json({message: "Empresa no ingresada"});
            }
          }else{
              return res.status(500).json(err);
          } 
        })
      }else{
        return res.status(401).json({message: "Empleado ya ingresada"});
      }
    }else{
      return res.status(500).json(err);
    }   
  })
});

//se ingresa los datos de la cuenta bancaria 
router.post('/cuenBancaria', auth.authenticateToken, checkRole.check_Role, (req, res)=>{
  let cuenta_bancaria = req.body;
  //se verifica si la cuenta bancaria existe en la base de datos 
  var query = "SELECT num_cuenta_bancaria FROM cuenta_bancaria_empleado WHERE num_cuenta_bancaria =?";
  coneccion.query(query, [cuenta_bancaria.num_cuenta_bancaria], (err, results) =>{
    if(!err){
      if(results.length <= 0){
        //se verifica si el empleado se encuentra registrado
        const id_cedula = cuenta_bancaria.id_cedula_c;
        query = "SELECT id_cedula FROM empleado WHERE id_cedula = ?"
        coneccion.query(query, [id_cedula], (err, results)=>{
          if(!err){
            if(results.length <= 0){
              return res.status(401).json({message: "cuenta de empleado no ingresado, ingresalo"})
            }else{
              query ="SELECT id_cedula_c FROM cuenta_bancaria_empleado WHERE id_cedula_c = ?"
              coneccion.query(query, [cuenta_bancaria.id_cedula_c], (err, results)=>{
                if(!err){
                  if(results.length <= 0){
                    //inserto los datos de la cuenta bancaria a la base de datos 
                    query = "INSERT INTO cuenta_bancaria_empleado (num_cuenta_bancaria, nom_banco, tipo_cuenta, salario, id_cedula_c) VALUES (?,?,?,?,?)"
                    coneccion.query(query, [cuenta_bancaria.num_cuenta_bancaria, cuenta_bancaria.nom_banco, cuenta_bancaria.tipo_cuenta, cuenta_bancaria.salario, cuenta_bancaria.id_cedula_c], (err, results)=>{
                      if(!err){
                        return res.status(200).json({message: "cuenta ingresada correctamente"})
                      }else{
                        return res.status(500).json(err);
                      }
                    })
                  }else{
                    return res.status(402).json({message: "el empleado cuneta con una cuenta bancaria ya ingresada"})
                  }
                }else{
                  return res.status(500).json(err);
                }
              })
            }
          }else{
            return res.status(500).json(err);
          }
        })  
      }else{
        return res.status(400).json({message: "cuenta bancaria ya ingresada"});
      }
    }else{
      return res.status(500).json(err);
    }
  })
})







module.exports = router;
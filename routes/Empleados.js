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
const apiDriver = require('../services/api_driver'); // Asegúrate de que la ruta del módulo sea correcta
const fs = require('fs');

//procesar imagen 
const multer = require('multer'); // Importa multer


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
      // Puedes usar imageUrl como necesites, por ejemplo, para mostrar la imagen.
    })
    .catch((error) => {
      console.error('Error al cargar la imagen:', error);
    });
}




/*
const filePath = './controllers/logo_logo.png';


const fileData = {
  buffer: fs.readFileSync(filePath),
  mimeType:'image/jpeg', // Cambia el tipo MIME según el tipo de imagen
  originalname: 'logo_experimentando.png', // Nombre original del archivo
}

apiDriver.uploadFile(fileData)
  .then((imageUrl) => {
    console.log('URL de la imagen en Google Drive:', imageUrl);
    // Puedes usar imageUrl como necesites, por ejemplo, para mostrar la imagen.
  })
  .catch((error) => {
    console.error('Error al cargar la imagen:', error);
  });
*/



//----------------------


//---------------------------------------

// Configura multer para guardar las imágenes en una carpeta
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './controllers');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Usa el nombre original del archivo
  }
});

const upload = multer({ storage: storage });




//---------------------------------------



router.post('/InsEmpleado', upload.single('imagen'), (req, res) => {
    let inset_empleado = req.body;
    
    var query = "SELECT id_cedula FROM empleado WHERE id_cedula = ?";
    coneccion.query(query, [inset_empleado.id_cedula], (err, results) =>{
        if(!err){
            if(results.length <= 0){
                query = "SELECT id_empresa FROM empresa WHERE nom_empresa = ?;";
                coneccion.query(query, [inset_empleado.nom_empresa], (err, results) =>{
                  console.log(results.length)
                    if(!err){
                      console.log("paso el error ")
                        if(results.length >= 0){
                          const imagen = req.file;
                          if (!imagen) {
                            return res.status(403).json({ message: "No se subió ningún archivo" });
                          }else{
                             //-----------------------
                             const filePath = imagen.path;

                             const fileData = {
                               buffer: fs.readFileSync(filePath),
                               mimeType: 'image/jpeg', // Cambia el tipo MIME según el tipo de imagen
                               originalname: 'imagen_prueba_experimentando.jpg', // Nombre original del archivo
                             };
                             
                             const fotografia = null
                             apiDriver.uploadFile(fileData)
                               .then((imageUrl) => {
                                 const fotografia = imageUrl;
                                 console.log('URL de la imagen en Google Drive:', imageUrl);
 
                                 // Puedes usar imageUrl como necesites, por ejemplo, para mostrar la imagen.
 
                                 const id_empresa_e = results[0].id_empresa;
                                 console.log(id_empresa_e);
                                 query = "INSERT INTO `empleado`(`id_cedula`, `tipo_documento`, `nombre`, `apellidos`, `fecha_nacimiento`, `num_contacto`, `correo`, `direccion`, `hora_inicio`, `hora_fin`, `primer_dias_laboral`, `ultimo_dias_laboral`, `cargo`, `fotografia`, `estatus_notificacion`, `id_empresa_e`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,'true',?);"
                                 coneccion.query(query, [inset_empleado.id_cedula, inset_empleado.tipo_documento, inset_empleado.nombre, inset_empleado.apellidos, inset_empleado.fecha_nacimiento, inset_empleado.num_contacto, inset_empleado.correo, inset_empleado.direccion, inset_empleado.hora_inicio, inset_empleado.hora_fin, inset_empleado.primer_dias_laboral,  inset_empleado.ultimo_dias_laboral, inset_empleado.cargo, fotografia, id_empresa_e], (err, results)=>{
                                   if (!err){
                                     return res.status(200).json({message:"Función realizada con éxito"});
                                   }else{
                                         return res.status(500).json(err);
                                   } 
                             })
 
 
                               })
                               .catch((error) => {
                                 console.error('Error al cargar la imagen:', error);
                               });
 
                             //---------------------
                          }
                            // se inserta la imagen en google driver 

                           

                           

                            //res.send('Imagen cargada con éxito');


                            


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








module.exports = router;
const express = require('express');
// conexión a la base de datos. 
const coneccion = require('../database/conexion_db');
const { route } = require('./users_route');

// Definir la variable de rutas para comenzar las funciones. 
const router = express.Router();

// Variables de autenticación de rol y verificación de token. 
const auth = require('../services/authentication');
const checkRole = require('../services/check_Role');

// Se llama al servicio API Google Driver. 
const apiDriver = require('../services/api_driver');
const fs = require('fs');

// Procesar imagen. 
const multer = require('multer'); 
const { authenticate } = require('@google-cloud/local-auth');
const { Console } = require('console');

// Se llaman las variables globales.
require('dotenv').config();

//----------------------
/*
function uploadImageToGoogleDrive() {
  //const filePath = './controllers/logo_logo.png';
  //const fileData = {
    //buffer: fs.readFileSync(filePath),
   // mimeType: 'image/jpeg', // Cambia el tipo MIME según el tipo de imagen
   // originalname: 'logo_experimentando.png', // Nombre original del archivo
  //};
  
  apiDriver.uploadFile(fileData)
  .then((imageUrl) => {
    console.log('URL de la imagen en Google Drive:', imageUrl);
  })
  .catch((error) => {
    console.error('Error al cargar la imagen:', error);
  });
}

*/
// Configura multer para procesar imágenes y guardar las imágenes en una carpeta. 
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './fotografia_almacenar');
  },
  filename: function (req, file, cb) {
    // Usa el nombre original del archivo. 
    cb(null, file.originalname); 
  }
});
const uploadImg = multer({ storage: storage });

// Configura multer para procesar archivos PDF y guardar los PDF en una carpeta.
const storagePDF = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './Incapacidad_pdf');
  },
  filename: function (req, file, cb) {
    // Usa el nombre original del archivo. 
    cb(null, file.originalname); 
  }
});
const uploadPDF = multer({ storage: storagePDF });

// Ingresar los datos personales del empleado con la fotografía del empleado.
router.post('/InsEmpleado', auth.authenticateToken, checkRole.check_Role, uploadImg.single('imagen'), (req, res) => {
  let inset_empleado = req.body;  

  // Se verifica si no hay otro empleado con el ID.  
  var query = "SELECT id_cedula FROM empleado WHERE id_cedula = ?";
  coneccion.query(query, [inset_empleado.id_cedula], (err, results) =>{

    if(!err){

      if(results.length <= 0){

        // Se busca el ID de la empresa a donde se va a ingresar el empleado.
        query = "SELECT id_empresa FROM empresa WHERE nom_empresa = ?;";
        coneccion.query(query, [inset_empleado.nom_empresa], (err, results) =>{

          if(!err){
            //console.log("paso el error ")

            if(results.length >= 0){
              const imagen = req.file;

              // Se verifica si hay un file llamado imagen.
              if (!imagen) {
                return res.status(403).json({ message: "No se subió ningún archivo" });
              }else{

                // Se guarda la imagen en filePath
                const filePath = imagen.path;
                
                // Se define el fileobject 
                const fileData = {
                  buffer: fs.readFileSync(filePath),
                  mimeType: 'image/jpeg', 
                  originalname: inset_empleado.id_cedula + '-fotografia-Nombre-' +  inset_empleado.nombre,
                };

                // Se procesa la imagen, se envía hacia la API de Google Drive para almacenarla. 
                apiDriver.uploadFile(fileData).then((imageUrl) => {
                  
                  // Se guarda la URL de la imagen guardada. 
                  const fotografia = imageUrl; 
                  console.log('URL de la imagen en Google Drive:', imageUrl);
                 
                  // Se relaciona el ID de la empresa. 
                  const id_empresa_e = results[0].id_empresa;
                  console.log(id_empresa_e);

                  // Se insertan los datos del empleado a la base de datos. 
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
                  return res.status(500).json(err);
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

// Se ingresan los datos de la cuenta bancaria.  
router.post('/cuenBancaria', auth.authenticateToken, checkRole.check_Role, (req, res)=>{
  let cuenta_bancaria = req.body;
  // Se verifica si la cuenta bancaria existe en la base de datos. 
  var query = "SELECT num_cuenta_bancaria FROM cuenta_bancaria_empleado WHERE num_cuenta_bancaria =?";
  coneccion.query(query, [cuenta_bancaria.num_cuenta_bancaria], (err, results) =>{
    if(!err){
      if(results.length <= 0){
        // Se verifica si el empleado se encuentra registrado. 
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
                    // Inserto los datos de la cuenta bancaria a la base de datos. 
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

// Buscar empleado retorna el nombre y el apellido del empleado. 
router.post('/buscarEmpleado', auth.authenticateToken, checkRole.check_Role, (req, res) => {
  let buscar = req.body;
  // Se busca el tipo de documento del empleado. 
  var query = "SELECT `id_empresa` FROM `empresa` WHERE nom_empresa = ?";
  coneccion.query(query, [buscar.nom_empresa], (err, results) =>{
      if (!err){
        if(results.length !== 0){
          const id_empresa_e = results[0].id_empresa;
          query = "SELECT `tipo_documento` FROM `empleado` WHERE id_empresa_e = ? AND id_cedula = ?"
          coneccion.query(query, [id_empresa_e, buscar.id_cedula], (err, results)=>{
            if(!err){
              if(results.length !== 0){
                 // Se asignan valores tipo documento de db y de frond 
                  const tipo_documento_db = results[0].tipo_documento;
                  const tipo_document_user = buscar.tipo_documento;
                  // Se comparan los tipos de documentos. 
                  if(tipo_document_user === tipo_documento_db){
                    // Se buscan los datos, nombre y apellido.  
                    query = "SELECT nombre, apellidos FROM empleado WHERE id_cedula = ?"
                    coneccion.query(query, [buscar.id_cedula], (err, results)=>{
                      if(!err){
                        const nombre = results[0].nombre;
                        const apelidos = results[0].apellidos;
                        return res.status(200).json({nombre, apelidos});
                      }else{
                        return res.status(500).json(err);
                      }
                    });
                  }else{
                    return res.status(401).json({message: "verifaca los campos la cedula y el tipo de documento"});
                  }
              }else{
                return res.status(400).json({message: "empleado no encontrado"});
              }
            }else{
              return res.status(500).json(err);
            }
          })
        }else{
          return res.status(400).json({message: "no se encontro la empresa"});
        }
      }else{
        return res.status(500).json(err);
      }
  });
});

// Se ingresan los datos de asistencia. 
router.post('/asistenciaR', auth.authenticateToken, checkRole.check_Role, (req, res)=>{
  let asistencia = req.body
  // Se registra la asistencia. 
  var query = "INSERT INTO asistencia(id_registro_asistencia, fecha, horario, id_cedula_a) VALUES (NULL,?,?,?)";
  coneccion.query(query, [asistencia.fecha, asistencia.horario, asistencia.id_cedula_a], (err, results) =>{
    if(!err){
      return res.status(200).json({message: "asistencia insertada correctamente"})
    }else{
      return res.status(500).json(err);
    }
  });
});

// Se ingresan los datos de horas extras.  
router.post('/horasExtras', auth.authenticateToken, checkRole.check_Role, (req, res)=>{
  let horasExtras = req.body;
  // Se busca el total de horas ingresadas al empleado. 
  var query = "SELECT total FROM horas_extras WHERE id_cedula_h = ? ORDER BY id_registro_horas_extras DESC LIMIT 1;";
  coneccion.query(query, [horasExtras.id_cedula_h], (err, results) =>{
    if(!err){
      if(results.length == 0){
        const total = horasExtras.horas_extras;
        // Se inserta las horas extras cuando es por primera vez. 
        query = "INSERT INTO horas_extras(id_registro_horas_extras, fecha, horas_extras, total, id_cedula_h) VALUES (NULL,?,?,?,?)"
        coneccion.query(query, [horasExtras.fecha, horasExtras.horas_extras, total, horasExtras.id_cedula_h], (err, results)=>{
          if(!err){
            return res.status(200).json({message: "horas extras insertadas correctamente"})
          }else{
            return res.status(500).json(err);
          }
        });
      }else{
        // Se asignan los valores a las variables. 
        const horaTotalDb = parseFloat(results[0].total);
        const horasnuevas = parseFloat(horasExtras.horas_extras);
        // Se suman las horas extras enviadas del fron más las horas registradas en la db
        let total = horaTotalDb + horasnuevas;
        // Se insertan los datos a la base de datos. 
        query = "INSERT INTO horas_extras(id_registro_horas_extras, fecha, horas_extras, total, id_cedula_h) VALUES (NULL,?,?,?,?)"
        coneccion.query(query, [horasExtras.fecha, horasExtras.horas_extras, total, horasExtras.id_cedula_h], (err, results)=>{
          if(!err){
            return res.status(200).json({message: "horas extras insertadas correctamente"})
          }else{
            return res.status(500).json(err);
          }
        });
      } 
    }else{
      return res.status(500).json(err);
    }
  });
});

// Insertar una incapacidad con su comprobante PDF. 
router.post('/incapacidad', auth.authenticateToken, checkRole.check_Role, uploadPDF.single('archivoIncapacidad'), (req, res)=>{
  const incapacidad = req.body;
  const archivoIncapacidad = req.file;
  // Se verifica si hay un file llamado archivoIncapacidad
  if (!archivoIncapacidad) {
    return res.status(403).json({ message: "No se subió ningún archivo" });
  }else{
    // Se consulta el nombre del empleado.
    let query ="SELECT nombre FROM empleado WHERE id_cedula = ?";
    coneccion.query(query, [incapacidad.id_cedula_i], (err, results)=>{
      if(!err){
        if(results.length == 0){
          return res.status(400).json({message: "el id incresado no es valido"})
        }else{
          // Se guarda el PDF en filePath
          const filePath = archivoIncapacidad.path;
          const nombre = results[0].nombre;
          // Se define el fileobject 
          const fileData = {
            buffer: fs.readFileSync(filePath),
            mimeType: 'application/pdf', 
            originalname: incapacidad.id_cedula_i + '-Incapacidad-PDF-Nombre-' +  nombre,
          };
            
          // Se procesa el archivo PDF, se envía hacia la API de Google Drive para almacenarlo. 
          apiDriver.uploadFile(fileData).then((pfdUrl) => {
            // Se guarda la URL de la imagen guardada.
            const archivo_incapacidad = pfdUrl; 
            console.log('URL del pdf en Google Drive:', archivo_incapacidad );
            // Se inserta el registro de incapacidad. 
            query="INSERT INTO incapacidad(Id_registro_incapacidad, fecha_registro, fecha_incapacidad, causa, descripcion, archivo_incapacidad, cantidad_dias_incapacidad, id_cedula_i) VALUES (NULL,?,?,?,?,?,?,?)"
            coneccion.query(query, [incapacidad.fecha_registro, incapacidad.fecha_incapacidad, incapacidad.causa, incapacidad.descripcion, archivo_incapacidad, incapacidad.cantidad_dias_incapacidad, incapacidad.id_cedula_i], (err,results)=>{
              if(!err){
                return res.status(200).json({message: "pdf guadado"});
              }else{
                return res.status(500).json(err);
              }
            });
          }).catch((error) => {
            console.error('Error al cargar la imagen:', error);
            return res.status(500).json(err);
          }); 
        }
      }else{
        return res.status(500).json(err);
      }
    })
  }
})

module.exports = router;
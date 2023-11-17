require('dotenv').config();

const { google } = require("googleapis");
const path = require("path");
const stream = require("stream");
const mime = require('mime');

// Módulo para operaciones de sistema de archivos
const fs = require("fs");

//variables globales 
const KEYFILEPATH = process.env.GOOGLE_DRIVE_KEYFILEPATH; 
const SCOPES = process.env.GOOGLE_DRIVE_SCOPES;
const ID_folder = process.env.GOOGLE_DRIVE_FOLDER_ID;
//const filePath = './controllers/logo_logo.png';

//se autentifica la verificaion 
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

//funcion para llamar a la api de driver para subir la imagen a driver 
const uploadFile = async (fileObject) => {

  const bufferStream = new stream.PassThrough();
  bufferStream.end(fileObject.buffer);
  try {
    const { data } = await google.drive({ version: "v3", auth }).files.create({
      media: {
        mimeType: fileObject.mimeType,
        body: bufferStream,
      },

      requestBody: {
        name: fileObject.originalname,
        //id de la carpeta donde se guarda la imagen
        parents: [ID_folder], 
      },
      fields: "id,name",
    });
    //retorna la url de la imagen guardada
    console.log(`Uploaded file id ${data.name} ${data.id}`);
    return `https://drive.google.com/file/d/${data.id}`;
  } catch (error) {
    console.error("Error al subir el archivo:", error);
    throw error;
  }
};

//funcion para eliminar archivos gusrdados en drive por medio de la api 
const deleteFile = async (fileId) => {
  try{
    await google.drive({ version: "v3", auth }).files.delete({
      fileId: fileId
    });
    console.log('Delete file id ', fileId);
    return fileId;
  }catch (error){
    console.log("error al eliminar el archivo con id ", fileId, error);
    throw error;
  }
};


//pruebas
/*
const fileId = "id del archivo "

deleteFile(fileId).then((delete_File)=>{                 
  
  console.log("funcion realizada con exito ", delete_File)
  //return res.status(200).json({message: "funcion realizada con exito"});  
}).catch((error)=>{
  return res.status(500).json(error);
});
*/



// Función para descargar archivos de Google Drive
async function downloadFile(fileId) {
  const drive = google.drive({ version: 'v3', auth });

  return new Promise(async (resolve, reject) => {
    try {
      const response = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' }
      );

      const chunks = [];

      console.log("descargando archivo con id: ", fileId)
      
      response.data
        .on('data', (chunk) => {
          chunks.push(chunk);
        })
        .on('end', () => {
          const fileContent = Buffer.concat(chunks);
          resolve(fileContent);
        })
        .on('error', (err) => {
          reject(err);
        });
    } catch (error) {
      reject(error);
    }
  });
}

/*
// Función para descargar archivos de Google Drive y almacenarlos localmente 
async function downloadFile(fileId, localFilePath) {
  const drive = google.drive({ version: 'v3', auth });

  try {
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    const dest = fs.createWriteStream(localFilePath);

    return new Promise((resolve, reject) => {
      response.data
        .on('end', () => {
          console.log('Archivo descargado exitosamente.');
          resolve();
        })
        .on('error', (err) => {
          console.error('Error al descargar el archivo:', err);
          reject(err);
        })
        .pipe(dest);
    });
  } catch (error) {
    console.error('Error al descargar el archivo:', error);
    throw error;
  }
}*/

/*
//pruebas
const fileId = 'id de archivo'; 
const localFilePath = 'carpeta donde se almacenara y su nombre';

downloadFile(fileId, localFilePath);
*/


module.exports = {
  uploadFile,
  deleteFile,
  downloadFile,
};




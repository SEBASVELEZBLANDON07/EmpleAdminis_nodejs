require('dotenv').config();

const { google } = require("googleapis");
const path = require("path");
const stream = require("stream"); // Deja esta línea


// Módulo para operaciones de sistema de archivos
const fs = require("fs");


const KEYFILEPATH = process.env.GOOGLE_DRIVE_KEYFILEPATH; 

const SCOPES = process.env.GOOGLE_DRIVE_SCOPES;

const ID_folder = process.env.GOOGLE_DRIVE_FOLDER_ID;

const filePath = './controllers/logo_logo.png';




const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

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
        parents: [ID_folder], // Puedes especificar el ID de una carpeta si lo deseas
      },
      fields: "id,name",
    });
    console.log(`Uploaded file ${data.name} ${data.id}`);
    return `https://drive.google.com/file/d/${data.id}`;
  } catch (error) {
    console.error("Error uploading the file:", error);
    throw error;
  }
};

//--------------------------------------------------------------------------------
/*
const exampleFileObject = {
    buffer: fs.readFileSync(filePath), // Lee el contenido del archivo
    mimeType: "image/jpeg", // Tipo MIME del archivo
    originalname: "logo_logo.png", // Nombre original del archivo
  };
  
//uploadFile(exampleFileObject); // Sube el archivo utilizando la función de carga


  
  module.exports = {
   
    uploadFiles,
    downloadFile,
  }

*/
module.exports = {
    uploadFile,
  };




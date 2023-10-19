require('dotenv').config();

const { google } = require("googleapis");
const path = require("path");
const stream = require("stream");

// Módulo para operaciones de sistema de archivos
const fs = require("fs");

//variables globales 
const KEYFILEPATH = process.env.GOOGLE_DRIVE_KEYFILEPATH; 
const SCOPES = process.env.GOOGLE_DRIVE_SCOPES;
const ID_folder = process.env.GOOGLE_DRIVE_FOLDER_ID;
const filePath = './controllers/logo_logo.png';

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
    console.log(`Uploaded file ${data.name} ${data.id}`);
    return `https://drive.google.com/file/d/${data.id}`;
  } catch (error) {
    console.error("Error uploading the file:", error);
    throw error;
  }
};

module.exports = {
  uploadFile,
};




require('dotenv').config();

const fs = require('fs').promises;
const path = require('path');
const { google } = require('googleapis');
const { authenticate } = require('@google-cloud/local-auth');

const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
const CREDENTIALS_PATH = path.join(__dirname, '../credentials.json');
const TOKEN_PATH = path.join(__dirname, '../token_Drive_api.json');

const drive = google.drive({ version: 'v3' });

async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

async function listFiles(authClient) {
  const drive = google.drive({ version: 'v3', auth: authClient });
  const res = await drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
  });
  const files = res.data.files;
  if (files.length === 0) {
    console.log('No files found.');
    return;
  }

  console.log('Files:');
  files.forEach((file) => {
    console.log(`${file.name} (${file.id})`);
  });
}

authorize()
  .then(listFiles)
  .catch(console.error);

async function uploadFile(filePath, fileName) {
  // Tu función de carga de archivos aquí
}

async function downloadFile(fileId, destinationPath) {
  // Tu función de descarga de archivos aquí
}

module.exports = {
  authorize,
  uploadFile,
  downloadFile,
};










































/*require('dotenv').config();

//const fs = require('fs').promises;
//const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
//const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
//const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(__dirname,'credentials.json');

const fs = require('fs').promises;
const path = require('path');
const { google } = require('googleapis');

// Configura las credenciales y el token de acceso
const credentials = path.join(process.cwd(), 'credentials.json');
/* {
    
  client_id: process.env.GOOGLE_CLIENT_ID,
  client_secret: process.env.GOOGLE_CLIENT_SECRET,
  redirect_uris: [process.env.GOOGLE_REDIRECT_URI],
};

const TOKEN_PATH =  path.join(__dirname, '../token_Drive_api.json'); // Ruta donde se guarda el token

const drive = google.drive({ version: 'v3'/*, auth: null });






 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}


 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}


 * Load or request or authorization to call APIs.
 *
 
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}


 * Lists the names and IDs of up to 10 files.
 * @param {OAuth2Client} authClient An authorized OAuth2 client.
 
async function listFiles(authClient) {
  const drive = google.drive({version: 'v3', auth: authClient});
  const res = await drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
  });
  const files = res.data.files;
  if (files.length === 0) {
    console.log('No files found.');
    return;
  }

  console.log('Files:');
  files.map((file) => {
    console.log(`${file.name} (${file.id})`);
  });
}

authorize().then(listFiles).catch(console.error);







async function authorize() {
  const tokenContent = await fs.readFile(TOKEN_PATH);
  credentials.token = JSON.parse(tokenContent);
  const { client_id, client_secret } = credentials;

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret);
  oAuth2Client.setCredentials(token);

  // Set the authorized client to the Google Drive API
  drive.options.auth = oAuth2Client;
}

async function uploadFile(filePath, fileName) {
  const media = {
    mimeType: 'image/jpeg', // Cambia esto según el tipo de archivo que estás subiendo
    body: fs.createReadStream(filePath),
  };

  try {
    const response = await drive.files.create({
      media: media,
      requestBody: {
        name: fileName,
      },
    });

    console.log('Archivo subido a Google Drive con ID:', response.data.id);
    return response.data.id;
  } catch (error) {
    console.error('Error al subir el archivo a Google Drive:', error);
    throw error;
  }
}

async function downloadFile(fileId, destinationPath) {
  try {
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    const dest = fs.createWriteStream(destinationPath);

    return new Promise((resolve, reject) => {
      response.data
        .on('end', () => {
          console.log('Archivo descargado con éxito');
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
}

module.exports = {
  authorize,
  uploadFile,
  downloadFile,
};
*/
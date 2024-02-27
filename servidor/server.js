// Se llaman las variables globales. 
require('dotenv').config();

const http = require('http');
const app = require('./index')
const server = http.createServer(app);

// Se establece el puerto.  
server.listen(process.env.PORT);

console.log(process.env.PORT)
   


//se llmana las variables gobales
require('dotenv').config();

const http = require('http');
const app = require('./index')
const server = http.createServer(app);




//se establece el puerto 
server.listen(process.env.PORT);






console.log(process.env.PORT)
   


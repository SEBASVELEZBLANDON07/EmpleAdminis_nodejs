const express = require('express')
const cors = require('cors');

//Se llaman los archivos de conexión y de rutas.
const db = require('../database/conexion_db'); 

// Variable de ruta.  
const userRoute = require('../routes/users_route');
const bill_route = require('../routes/bill');
const crearF_route = require('../routes/crear_perfil');
const empleado_edic_route = require('../routes/insertEmpleados');
const deleteEmpleado = require('../routes/deletEmpleado');
const infoEmpleado = require('../routes/infoEmpleado');
const inventarioEmpleados = require('../routes/inventarioEmpleados');

// Ruta de API de Google Driver. 
require('../services/api_driver');

// Ruta de procesos automatizados.
// Script para verificar la asistencia de los empleados.
require('../scripts/automaticInsertionInasistencia');
//

const app = express(); 

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Rutas
app.use('/userRoute', userRoute);
app.use('/bill_route', bill_route);
app.use('/crearF_route', crearF_route);
app.use('/Empleado_edic', empleado_edic_route);
app.use('/delet_Empleado', deleteEmpleado);
app.use('/info_empleado', infoEmpleado);
app.use('/inventarioEmple', inventarioEmpleados);



module.exports = app;

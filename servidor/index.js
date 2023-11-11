const express = require('express')
const cors = require('cors');

//se llaman los archivos de coneccion y de routes
const db = require('../database/conexion_db'); 

//variables de ruta 
const userRoute = require('../routes/users_route');
const category_route = require('../routes/category_route');
const product_route = require('../routes/product');
const bill_route = require('../routes/bill');
const bashboard_route = require('../routes/dashboard_route');
const crearF_route = require('../routes/crear_perfil');
const empleado_edic_route = require('../routes/insertEmpleados');
const deleteEmpleado = require('../routes/deletEmpleado');
const infoEmpleado = require('../routes/infoEmpleado');

//ruta de api driver
const api_driver = require('../services/api_driver');

const app = express(); 

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended: true}));

//rutas
app.use('/userRoute', userRoute);
app.use('/category_route', category_route);
app.use('/product_route', product_route);
app.use('/bill_route', bill_route);
app.use('/dashboard_route', bashboard_route);
app.use('/crearF_route', crearF_route);
app.use('/Empleado_edic', empleado_edic_route);
app.use('/delet_Empleado', deleteEmpleado);
app.use('/info_empleado', infoEmpleado);

module.exports = app;
/*
// Configuraciones
app.set('port', process.env.PORT || 3000);

app.use(express.json());
app.use(cors({origin: 'http://localhost:4200'})); 

// rutas de nuestro servidor
//app.use('/api/empleados',require('./routes/empleado.routes'));

// Iniciando el servidor
app.listen(app.get('port'), () => {// esta es una mejor manera de configurar el puerto
    console.log('server activo en el puerto', app.get('port'));
}); 
*/
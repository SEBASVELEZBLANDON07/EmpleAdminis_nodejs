//se llmana las variables gobales
require('dotenv').config();

//temporizador node-cron
const cron = require('node-cron');

//coneccion a la base de dastos 
const coneccion = require('../database/conexion_db');

//funcion determinar dias no laborales 
//retorna un listado de dias no laborales 
function obtenerDiasNoLaborables(primerDia, ultimoDia) {
    // dias de la semana
    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    // se octinen posiscion del array de dias 
    const indicePrimerDia = diasSemana.indexOf(primerDia.toLowerCase());
    const indiceUltimoDia = diasSemana.indexOf(ultimoDia.toLowerCase());
    //si es -1 significa que que no esta en el array 
    if (indicePrimerDia === -1 || indiceUltimoDia === -1) {
      return;
    }
    // Crear una lista de días no laborables
    const diasNoLaborables = [];
    if(indicePrimerDia > indiceUltimoDia){
        const diferencia = indicePrimerDia - indiceUltimoDia
        const contador = diferencia -1; 
        for(let a = 0; a < contador; a++){
            const diaNoLaboral = indiceUltimoDia + 1 + a
            diasNoLaborables.push(diasSemana[diaNoLaboral]);
        }
    }else{
      for (let i = 0; i < diasSemana.length; i++) {
          if (i < indicePrimerDia || i > indiceUltimoDia) {
            diasNoLaborables.push(diasSemana[i]);
          }
        }
    }
    return diasNoLaborables;
}

// funcion que compara los dias no laborales con el dia actual 
// retorna false si el dias actual no es laboral 
// retorna true si el dia actual es laboral 
// retorna null si los parametros ingresados no son validos 
function esDiaLaboral(primerDia, ultimoDia) {
    const diasNoLaborables = obtenerDiasNoLaborables(primerDia, ultimoDia);
    if (!diasNoLaborables) {
      return null;
    }
    // se octinen el dia actual de la semana 
    const diaActual = new Date().toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
    if (diasNoLaborables.includes(diaActual)) {
      return false;
    } else {
      return true;
    }
  }

//funcion para insertar inasistencia
const insertarInasistencia = (id_cedula_inasistencia)=>{
    const fechainasistencia = new Date();
    // Restar 5 horas a la fecha actual
    fechainasistencia.setHours(fechainasistencia.getHours() - 5);
    const id_cedula = id_cedula_inasistencia;
    var query ="INSERT INTO `inasistencia`(`id_registro_inasistencia`, `fecha`, `id_cedula_ina`) VALUES (NULL, ?, ?)"
    coneccion.query(query, [fechainasistencia, id_cedula], (err, results) =>{
        if(!err){
            return console.log("inasitencia realizada con exito", id_cedula)
        }else{
            return console.log(err)
        }
    })
}

//funcion para consultar asistencia 
const consultarAsistencia = ()=>{
    const fechaActualRegistroInacistencia = new Date().toLocaleString("es-CO", {timeZone: "america/Bogota"});
    // se buscan las empresas ingresadas 
    var query = "SELECT `id_empresa` FROM `empresa` WHERE 1";
    coneccion.query(query, (err, results) => {
        if(!err){
            const empresasid = results;
            //bucle for realiza verificasion de asistencia empresas por empresa 
            empresasid.forEach((empresa) => {
                const id_empresa = empresa.id_empresa;
                //se buscan los empleados de la empresa 
                query = "SELECT `id_cedula` FROM `empleado` WHERE id_empresa_e = ?;";
                coneccion.query(query, [id_empresa], (err, results)=>{
                if(!err){
                    if(results.length == 0){
                        console.log("empresa id ", id_empresa, "no tiene empleados");
                    }else{
                        const idEmpleados = results;
                        //bucle for para verificar la asistencia de cada empleado segun sus tiempos laborales
                        idEmpleados.forEach(empleado => {
                            const id_cedula = empleado.id_cedula;
                            // se verifica si el dia actual el empleado labora
                            query = "SELECT  `primer_dias_laboral`, `ultimo_dias_laboral` FROM `empleado` WHERE id_cedula = ?";
                            coneccion.query(query, [id_cedula], (err, results)=>{
                                if(!err){
                                    const primerDiaLabor = results[0].primer_dias_laboral;
                                    const ultimoDialabor = results[0].ultimo_dias_laboral;
                                    
                                    //se llama a la funcion que de termina si el dia actual es laboral o no 
                                    const resultado = esDiaLaboral(primerDiaLabor, ultimoDialabor);
                            
                                    if (resultado === true) {
                                        //consultamos las asistencias de los empleados para terminar inasistencias del dia actual
                                        query = "SELECT `fecha` FROM `asistencia` WHERE id_cedula_a = ? ORDER BY `id_registro_asistencia` DESC LIMIT 1;"
                                        coneccion.query(query, [id_cedula], (err, results)=>{
                                            if(!err){
                                                if(results.length > 0){                                 
                                                    const asistencia = results

                                                    // se octiene la fecha actual
                                                    const fechaActual = new Date();

                                                    // se octine el primer objeto de la consulta 
                                                    const fechaAsistencia = new Date(asistencia[0].fecha);

                                                    // Restar 5 horas a la fecha actual
                                                    fechaActual.setHours(fechaActual.getHours() - 5);

                                                    // extraer solo la parte de la fecha (día, mes, año) de ambas fechas
                                                    const fechaActualSinHora = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate());
                                                    const fechaAsistenciaSinHora = new Date(fechaAsistencia.getFullYear(), fechaAsistencia.getMonth(), fechaAsistencia.getDate());

                                                    // comparamos la fecha actual con la fecha extraida de la consulta a la tabla asistencia
                                                    if (fechaActualSinHora.getTime() === fechaAsistenciaSinHora.getTime()) {
                                                        console.log('asistencia cumplida ', id_cedula);
                                                    } else {
                                                        //se ejecuta la funcion insertar inasistencia cuando la fecha actaul no coincide con la ultima asistencia ingresada 
                                                        insertarInasistencia(id_cedula);
                                                    }
                                                }else{
                                                    //se ejecuta la funcion insertar inasistencia cuando no se encontra ningun registro de asistencia 
                                                    insertarInasistencia(id_cedula);  
                                                }
                                            }else{
                                                return console.log(err)
                                            }
                                        })
                                    } else if (resultado === false) {
                                        return console.log("empleado no labura ", id_cedula);
                                    } else {
                                        return console.log("error valor de la semana no valido ")
                                    }
                                }else{
                                    return console.log(err)
                                }
                            })   
                        });
                    }
                }else{
                    return console.log(err);
                } 
                })
            });
                return console.log("funcion inaistencia finalizadad dia ", fechaActualRegistroInacistencia)
        }else{
            return console.log(err);
        } 
    })
}

//se programa la ejecucion de la inasistencia, se ejecuta a las 11:58 P.M todos los dias 
cron.schedule('58 23 * * *', ()=>{
    consultarAsistencia();
},{
    timezone:'America/Bogota'
})


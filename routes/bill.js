const express = require('express');
const coneccion = require('../database/conexion_db');
const router = express.Router();

//paquetes instalados
let ejs = require('ejs');
let pdf = require('html-pdf');
let paht = require('path');
let fs = require('fs');
let uuid = require('uuid');


const auth = require('../services/authentication');

router.post('/generateRepor', auth.authenticateToken, (req, res)=>{
    const generateUuid = uuid.v1();
    const orderDatalis = req.body;
    var productDetailsReport = JSON.parse(orderDatalis.productDetails);

    var query = "INSERT INTO  bill ( uuid, name, email, contact, paymentMethod, total, productDetails, createBy) VALUES (?,?,?,?,?,?,?,?)";
    coneccion.query(query, [generateUuid, orderDatalis.name, orderDatalis.email, orderDatalis.contact, orderDatalis.paymentMethod, orderDatalis.totalAmount, orderDatalis.productDetails, res.locals.email], (err, results)=>{
        if(!err){
            ejs.renderFile(paht.join(__dirname, '', '../report/report.ejs'), {productDetails: productDetailsReport, name: orderDatalis.name, email: orderDatalis.email, contact: orderDatalis.contact, paymentMethod: orderDatalis.paymentMethod, totalAmount: orderDatalis.totalAmount}, (err, results)=>{
                if(err){
                    return res.status(500).json(err);

                }else{
                    pdf.create(results).toFile('./backend//generated_pdf/EmpleAdminis-'+ generateUuid + '.pdf', function(err, data){
                        if(err){
                            console.log(err);
                            return res.status(500).json(err);

                        }else{
                            return res.status(200).json({uuid: generateUuid });                        
                        }   
                    });
                }
            });
        }else{
            return res.status(500).json(err)
        }
    });
});

router.post('/getPDF', auth.authenticateToken, (req, res)=>{
    const orderDatalis = req.body;
    const pdfPath = './backend//generated_pdf/EmpleAdminis-'+ orderDatalis.uuid + '.pdf';
    if(fs.existsSync(pdfPath)){
        res.contentType("application/pdf");
        fs.createReadStream(pdfPath).pipe(res);
    }else{
        var productDetailsReport = JSON.parse(orderDatalis.productDetails);
        ejs.renderFile(paht.join(__dirname, '', '../report/report.ejs'), {productDetails: productDetailsReport, name: orderDatalis.name, email: orderDatalis.email, contact: orderDatalis.contact, paymentMethod: orderDatalis.paymentMethod, totalAmount: orderDatalis.totalAmount}, (err, results)=>{
            if(err){
                return res.status(500).json(err);
            }else{
                pdf.create(results).toFile('./backend//generated_pdf/EmpleAdminis-'+ orderDatalis.uuid + '.pdf', function(err, data){
                    if(err){
                        console.log(err);
                        return res.status(500).json(err);
                    }else{
                        res.contentType("application/pdf");
                        fs.createReadStream(pdfPath).pipe(res);
                       // return res.status(200).json()          
                    }   
                });
            }
        });
    }
});

router.get('/getBillis', auth.authenticateToken, (req, res, next)=>{
    var query = "SELECT * FROM bill ORDER BY id DESC";
    coneccion.query(query, (err, results)=>{
        if(!err){
            return res.status(200).json(results);
        }else{
            return res.status(500).json(err);
        }
    });
});

router.delete('/delete/:id', auth.authenticateToken, (req, res, next)=>{
    const id_eliminar = req.params.id;
    var query = "DELETE FROM bill WHERE id=?";
    coneccion.query(query, [id_eliminar], (err, results)=>{
        if(!err){
            if (results.affectedRows == 0 ){
                return res.status(404).json({message: "bill no encontrada"});
            }else {
                return res.status(200).json({message: "bill eliminado correctamente"});
            } 
        }else{
            return res.status(500).json(err);
        }
    });
});

module.exports = router;
require('dotenv').config();

// Verifica el rol. 
function check_Role(req, res, next){
    if(res.locals.role === process.env.USER)
        next()
    else
        
        res.sendStatus(401);
}

module.exports = {check_Role: check_Role}


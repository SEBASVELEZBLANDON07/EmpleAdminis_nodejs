require('dotenv').config();

//verifica el rol
function check_Role(req, res, next){
    if(res.locals.role == process.env.USER)
        res.sendStatus(401);
    else
        next()
}

module.exports = {check_Role: check_Role}


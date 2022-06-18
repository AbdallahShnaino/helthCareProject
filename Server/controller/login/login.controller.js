const validator = require('validator');

let registrationValidation = function (errors , id , emailAddress , postion) {
    if(!id || validator.isEmpty(id)){
        errors.message.push("Missing ID , It Sould Be Supplied")
    }
    if( !emailAddress || validator.isEmpty(emailAddress)){
        errors.message.push("Missing E-mail Address , It Should Be Supplied")
    }

    if(!postion || validator.isEmpty(postion) || postion === "postion"){
        errors.message.push("Missing Postion , It Should Be Supplied")
    }
    if(postion !== "Doctor" && postion !== "Patient" && postion !== "Administrator"){
        errors.message.push("UnKnown Postion")
   
    }

    if(id){
        if( id.length !== 10 ) {
            errors.message.push("ID Should Be 10 Degits")
        }
    }

}
let DBregisterOp = function (errors , id , emailAddress , postion  ,res ) {
    let result = false
    if (result == false) {
        errors.message.push("User Not Found, Try Again With New Data ")
    }
}
module.exports = {
    registrationValidation,
    DBregisterOp,
}
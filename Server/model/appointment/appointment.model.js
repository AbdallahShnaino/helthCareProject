
const Appointment = require('./appointment.schema')

async function insertAppointment(document) {
    let doc = {
        date:document.date ,
        time:document.time ,
        doctor:document.doctor ,
        patient:document.patient ,
    }
    if (doc.doctor && doc.patient){
        return Appointment.create(doc);
    }else{
        return null
    }
}

async function isAvailabelAppointment (id , dateTime) {
    let canBook = false
  //  let userDate = addMinutes(new Date(dateTime) , 120)
  let userDate = new Date(dateTime)
    let bookingPeriod = 20
    let currentAppointment = {
        year:userDate.getFullYear(),
        month:userDate.getMonth() + 1,
        day:userDate.getDate(),
        h:userDate.getHours(),
        m:userDate.getMinutes()
    }
    let times = []
    return await Appointment.find({doctor:id}).then( result => {
        
        for ( let index of result) {
            console.log(index.date)
            let dateTimeO = index.date.split('T')
            let objDate = String(dateTimeO[0])
            let objTime = String(dateTimeO[1])
            console.log(objDate , objTime)
                let obj = {
                    year:objDate.split("-")[0],
                    month:objDate.split("-")[1],
                    day:objDate.split("-")[2],
                    h:objTime.split(":")[0],
                    m:objTime.split(":")[1]
                }
                times.push(obj)
            }

 
            for ( let time of times) {        
                if (currentAppointment.year != time.year ) {
                    time.clash = false
                }else{
                    console.log("clash in year .....")
                    if (currentAppointment.month == time.month ) {

                        console.log("clash in month .....")

                        if (currentAppointment.day == time.day){
                            console.log("clash in day .....")
                            if (currentAppointment.h == time.h) {
                                if ( Math.abs(currentAppointment.m - time.m) >= 
                                bookingPeriod) {
                                    console.log("nooo clash in mm .....")
                                    time.clash = false
                                }else{
                                    console.log(" clash in mm .....")
                                    time.clash = true
                                }
                            }else{
                                time.clash = false

                            }
                        }else{
                            time.clash = false
                        }

                    }else{
                        time.clash = false

                    }
                }
            }
            console.log(times , " a a ")
                let x = false
                if (times.length == 0) {
                    x = true
                }else{
                    for ( let time of times) {
                        if (time.clash == true) {
                            x = false
                            }else{
                            x = true
                            }
                        }
                }
                    if (x == false) {
                        canBook = false
                    }else{
                        canBook = true
                    }
                if ( canBook == true)              
                    console.log("he can hold new appointment")
                else
                    console.log("he can not hold new appointment")
                    
        
    }).then(()=>{
        return canBook
    })
}
async function getPatientAppointment (id) {
    return await Appointment.find({patient:id})
}
async function getDoctorAppointment (id) {
    return await Appointment.find({doctor:id})
}

async function doctorAcceptAppointment (appointmentId) {
    await Appointment.updateOne({_id: appointmentId},{$set:{doctorAccept
        :true}})
}

function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}

function isMoreThan (value , date1 , date2) {
    const diffTime = Math.abs(date2 - date1) / 60000;
    if (diffTime > value) {
        return true
    }else{
        return false
    }
}
module.exports = {isAvailabelAppointment,insertAppointment,getDoctorAppointment,getPatientAppointment , doctorAcceptAppointment}




const {google} = require('googleapis')
const nodemailer = require('nodemailer')
const CLIENT_ID =process.env.CLIENT_ID
const CLIENT_SECRIT = process.env.CLIENT_SECRIT
const REDIRECT_URL = process.env.REDIRECT_URL
const REFRISH_TOKEN =process.env.REFRISH_TOKEN

const oAuth2client = new google.auth.OAuth2(CLIENT_ID , CLIENT_SECRIT , REDIRECT_URL);
oAuth2client.setCredentials({refresh_token:REFRISH_TOKEN})


async function sendEmail (to , subject ,text){
    try{
        let accessToken = await oAuth2client.getAccessToken();
        let transport = nodemailer.createTransport({
            service:'gmail',
            auth:{
             type:'OAuth2',   
             user:'abdallah.shnaino@gmail.com',
            clientId:CLIENT_ID,
            clientSecret:CLIENT_SECRIT,
            refreshToken:REFRISH_TOKEN,
            accessToken:accessToken,
            }
        });
        const mailOptions = {
            from:"Health Care System <abdallah.shnaino@gmail.com>",
            to:to,
            subject:subject,
            text:text,
            html:"<h4>"+ text +"</h4>"
        }

        const result = await transport.sendMail(mailOptions)
        return result
    }catch(e){
        return e
    }
}
/* 


        let to = curser.emailAddress
        let subject = "Notification of account cancellation"
        let text = "We inform you that your account has been deleted for certain reasons. We apologize"
        sendEmail( to,subject,text ).then(()=>{
			console.log('the email was sent')
            return res.status(200).redirect('/admin/patient/update')
        })


*/
module.exports = sendEmail
require("dotenv").config();
const twilioClient = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const verificationSID = process.env.TWILIO_VERIFY_SID;

const mongoclient = require('mongodb').MongoClient
const express = require('express')
const app = express()
const bodyparser = require('body-parser')
app.use(bodyparser.urlencoded({ extended: true }))




mongoclient.connect('mongodb+srv://ShivanshGupta:india@2006@blogdb.xowev.mongodb.net/test?retryWrites=true&w=majority', {
    useUnifiedTopology: true
})


    .then(client => {
        console.log('Connected to database')
        app.set('view engine', 'ejs')
        const db = client.db('AuthServiceDB')
        const userInfo = db.collection('UserInfo')

        app.get('/', function (req, res) {
            res.sendFile(__dirname + '/index.html')
        })
        app.set('views', __dirname + '/views');
        app.post("/check", (req, res) => {
            
let userInfoStore = {
    name: req.body.name,
    mail: req.body.mail,
    password: req.body.password
}
twilioClient.verify
  .services(verificationSID)
  .verificationChecks.create({ to: req.body.mail, code: req.body.code })
  .then(verification_check => {
    if (verification_check.status === "approved") {
        userInfo
        .insertOne(userInfoStore)
        .then((result) => {
          res.redirect("/users")
        })
        .catch((error) => console.log(error));
    } else {
      res.redirect("/failure");
    }
  })
  .catch(error => {
    console.log(error);
    res.redirect("/failure");
  });

        });
          app.post("/verify", (req, res) => {
              
        twilioClient.verify
            .services(verificationSID)
            .verifications.create({ to: req.body.mail, channel: "email" })
            .then(verification => {
              console.log("Verification email sent");
              
            })
            .catch(error => {
              console.log(error);
            });
            res.render("verify.ejs",{Name:req.body.name, Password:req.body.password, Mail: req.body.mail})

          });
          app.get("/users", (req,res)=>{
            userInfo
            .find()
            .toArray()
            .then((result) => {
              res.render("users.ejs", { UserInfo: result });
            })
            .catch((errr) => console.log(err));
          })
          app.get("/failure", (req,res)=>{
            res.render("failure.ejs");
          })


    }).catch(err=>console.error(err))
    

app.listen(3000, function (req, res) {
    console.log('The server is running')

})
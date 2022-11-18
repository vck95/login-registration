const express = require('express');
const app = express();
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//db connection...
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'task'
});

db.connect( (err, result) => {
    if (err)
        console.log('error', err);
    else
        console.log('Databse conncected');
});

// Router
app.post('/api/register', async (req, res) => {

    var value = req.body.password;
    const salt = await bcrypt.genSalt(8);
    value = await bcrypt.hash(value, salt);

    const SQL = `INSERT INTO users(firstName,lastName,mobileNumber,emailID,password,createdAt,updatedAt)
VALUES('${req.body.firstName}', '${req.body.lastName}', '${req.body.mobileNumber}', '${req.body.emailID}', '${value}', '${req.body.createdAt}', '${req.body.updatedAt}')`
    // console.log(SQL);
    db.query(SQL, (err, result) => {
        if (err) {
            console.log(err);
        }
        else {
            res.send('User registered');
        }
    })
})


app.post('/api/login', (req, res) => {
    // const emailID = req.body.emailID;

    const checkSql = `SELECT * FROM users WHERE emailID = '${req.body.emailID}'`;
// console.log(checkSql);
    db.query(checkSql, (err, result) => {
         console.log(result);

        if (err) {
            res.send("error");
        }
        else {
            
            if (result.length == 0) {
                res.json({ error: "mail id not mtched" });
            }
            console.log(result);
            bcrypt.compare(req.body.password, result[0].password,function (err, results) {

            if (results) {
                jwt.sign(result[0], "secretkey",(err, token)=>{
                if (err) {
                    throw (err, res.json({ Acesstoken: "token not genrated" }));
                }
                res.json({ Acesstoken: token });
                });

            }else{
                res.json({ msg: "password not matched" });
            }
                
            })
           }


    })
});

app.listen('3002', () => {
    console.log("Server is running");
})



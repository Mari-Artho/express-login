import express from 'express';
import mongoose from "mongoose";
import PostModel from './models/post.js';
import cookieParser from 'cookie-parser';
//import logger from 'morgan';
import mongodb from "mongodb";
const MongoClient = mongodb.MongoClient;
import cors from 'cors';
import { application } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import CryptoJs from 'crypto-js';

//app.use(express.static("server.js"))

const port = 5000;
const app = express();
const SALT = "taketon"

app.use(express.json());
//↓Method to recognize received data as JSON object
app.use(cookieParser());
//↓urlencoded = Method for recognizing input data as a character string or array
app.use(express.urlencoded({ extended: true }));
app.use(cors());

let users = []
let login = false

//mongoDB Atlas
const url = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWD}@${process.env.HOST_NAME}/${process.env.DB_NAME}?retryWrites=true&w=majority`
console.log(url)
//mongoose.connect("mongodb://localhost/express-login", (err)=> {
    mongoose.connect(url, (err)=> {
    if(err){
        console.log(err);
    }else{
        console.log("Database is connected by mongoose");
    }
})

//port
app.listen(port, ()=> {
    console.log(`Application is running on port ${port}`)
})

//post
app.post('/signup', async (req, res)=> {
    try {
        var cryptoPassword = CryptoJs.SHA512(SALT + req.body.password).toString();
        req.body.password = cryptoPassword
      const posts = await PostModel.create(req.body)
      res.status(201).json(posts)
    } catch (err) { // on empty email/password, show error on console
        console.log(err)
        res.status(400).json(err.message)
    }
})

//subscribe, put is update.
app.put('/subscribe', async(req, res)=> {
    await updateSubscribeStatus(req.body)
    res.status(201).json("Subscription status updated")
 })

async function updateSubscribeStatus(body){
    await PostModel.findOneAndUpdate({ "email": body.email, "password" : body.password}, { subscribe: body.subscribe });
}

/* check if user with matching ID exists in Mongo database */
async function findUserByID(id){
    let foundUser = await PostModel.findOne({ "_id": id });
    return foundUser; // null if not found
}

//restore login session
app.post("/restore", (req, res)=> {
    let foundUser = findUserByID(req.body.id)
    foundUser.then(result => {
        if (result != null) {
            res.send(result); // return user data
        } else {
            res.send({"email" : "", "password": ""})
            // return a JSON-formatted record with empty user data
        }
    }
    )
})

/* check if user with matching email/password exists in Mongo database */
async function findUser(email, password){
    let foundUser = await PostModel.findOne({ "email": email, "password" : password});
    return foundUser; // null if not found
}

//log in
app.post("/login", (req, res)=> {
    var cryptoPassword = CryptoJs.SHA512(SALT + req.body.password).toString();
    req.body.password = cryptoPassword
    let foundUser = findUser(req.body.email, req.body.password)
    foundUser.then(result => { 
        if (result != null) {
            res.send(result); // return user data
        } else {
            res.send({"email" : "", "password": ""})
            // return a JSON-formatted record with empty user data
        }
    })
})

//connect to mongoDB Atlas
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true});
client.connect(err => {
  const collection = client.db("express-login").collection("users");
  // perform actions on the collection object
  console.log("Connected with mongoDB Atlas!!");
  client.close();
});

//Admin
app.post("/admin", (req, res)=> {
    if (req.body.email == "admin" && req.body.password == "admin") {
        login = true;
        res.redirect("/users");
    }
    else {
        res.send("Wrong email or password, please try again");
    }
})

// list of users
app.get("/users", async (req, res)=> {
    try{
        const users = await PostModel.find()
        showUsers(users, res)
    } catch(err){
        console.log(err)
        res.json(err.message)
    }
})

function showUsers(data, res) {
    if (login) {
        let html = '<html><body><h1>All users</h1>'
        html += '<ol>';
        //Show all users
        data.forEach(user => {
            html += '<li>';
            html += `name/email:  ${user.email}, <br>  password: ${user.password},  <br> ${user.subscribe ? 'Subscribed': 'Not subscribed'}<br>`;
            html += '</li>'
        })
        html += '</ol>'
        
        //Show email + subsucribers
        html += '<h1>Subscribed users</h1>'
        html += '<ol>'
        data.forEach(user => {
            if(user.subscribe){
                html += '<li>'
                html += ` ${user.email}`
                html += '</li>'
            }
        })
        html += '</ol>'
        html += '</body></html>'
        res.send(html)
    } else {
        res.send('<html><body><h1>Please log in</h1></body></html>')
    }
}

//Admin show
app.get("/",  (req, res)=> {
    let adminForm = `<form action="admin" method="post">
    <h1>Admin page</h1>
    <section>
    <input type="text" name="email" id="signupEmail" placeholder="email/username">
    <input type="password" name="password" id="signupPassword" placeholder="password">
    <input type="submit" id="signupBtn" value="Log in">
    </section>
    </form>
    `
    res.send(adminForm)
})




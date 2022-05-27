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

const port = 4000;
const app = express();

app.use(express.json())
app.use(cookieParser());
app.use(cors());

// //mongoDB Atlas

const url = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWD}@${process.env.HOST_NAME}/${process.env.DB_NAME}?retryWrites=true&w=majority`;
//参考リポ： mongodb-cloud-food
//mongoose.connect("mongodb://localhost/express-login", (err)=> {
    mongoose.connect(url, (err)=> {
    if(err){
        console.log(err);
    }else{
        console.log("Database is connected by mongoose");
    }
})

//
app.listen(port, ()=> {
    console.log(`Application is running on port ${port}`)
})

//GET
app.get("/users", async (req, res)=> {
    try{
        const posts = await PostModel.find()
        res.json(posts)
    } catch(err){
        console.log(err)
        res.json(err.message)
    }
})

//Admin
app.get("/admin", async (req, res)=> {
    try{
        const posts = await PostModel.find()
        res.json(posts)
    } catch(err){
        console.log(err)
        res.json(err.message)
    }
})

//Get by id
app.get("/login/:id", async (req, res)=>{
    try{
        const post = await PostModel.findById(req.params.id)
        res.json(post)
    } catch(err){
        console.log(err)
        res.json(err.message)
    }
})

//post
app.post('/signup', async (req, res)=> {
    try {
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

/* check if user with matching email/password exists in Mongo database */
async function findUser(email, password){
    let foundUser = await PostModel.findOne({ "email": email, "password" : password});
    return foundUser; // null if not found
}

//log in
//2
app.post("/login", (req, res)=> {
    let foundUser = findUser(req.body.email, req.body.password)
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

//admin
app.get('/admin', (req, res)=> {

})

// //post key(ここに書いたものがrestからデータベースに送れる？)
// app.post('/api/post/:key', async (req, res)=> {
//     try{
//         if(req.params.key != "123"){
//             return res.status(401).json("This message is from server.js(backen)")
//         }
//         const newPost = new PostModel(req.body)
//         console.log(newPost)
//         newPost.save()
//         res.json("New post is saved!")
//     } catch(err){
//         console.log(err)
//         res.json(err.message)
//     }
// })


const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true});
client.connect(err => {
  const collection = client.db("express-login").collection("userlist");
  // perform actions on the collection object
  console.log("Connected with mongoDB アトラス!!");
  //client.close();
});

//参考リポ： vs code: monolit-users, repo: users-front, users-backend
//下の usersではこのファイルのログインでも使うので消さないで！
let users = []

/* GET users list. */
app.get('/', function(req, res, next) {
    res.json(users);
  });
  
app.post('/', (req, res)=> {
    let user = {
      email: req.body.email,
      password: req.body.password,
      subscribe: req.body.subscribe
    };
    users.push(user);
    res.json("success");
    //下のメッセージをフロントのscript.jsへ送る。パスワードなど送りたくない場合に、選択したもの、ここではIDだけを送ったりできる。
    res.json({"message":"success",  "email": user.email});
  })



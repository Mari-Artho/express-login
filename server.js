import express from 'express';
import mongoose from "mongoose";
import PostModel from './models/post.js';
import cookieParser from 'cookie-parser';
//import logger from 'morgan';
import mongodb from "mongodb";
const MongoClient = mongodb.MongoClient;
import cors from 'cors';

const port = 4000;
const app = express();

app.use(express.json())
app.use(cookieParser());
app.use(cors());

//参考リポ： mongodb-cloud-food
mongoose.connect("mongodb://localhost/express-login", (err)=> {
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
    const posts = await PostModel.create(req.body)
    res.status(201).json(posts)
})

async function findUser(email, password)
{
    let foundUser = await PostModel.findOne({ "email": email, "password" : password});
console.log(foundUser);
    return (foundUser != null);
}
//log in
//2
app.post("/login", (req, res)=> {
    let foundUser = findUser(req.body.email, req.body.password)
    foundUser.then(result => { 
        console.log(result);
        if(result){
            res.json("loginSuccess");
            return //res.send("You are now logged in!!")
        }
    
        res.json("loginFailed")
    }
    )
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

// //mongoDB Atlas
// const DB_NAME = `express-login`;
// const USER_NAME = `MariDevelop`;
// const USER_PASSWD = `fixlater`;
// const HOST_NAME = `cluster0.dpi5u.mongodb.net`; 

// const url = `mongodb+srv://${USER_NAME}:${USER_PASSWD}@${HOST_NAME}/${DB_NAME}?retryWrites=true&w=majority`;
// const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true});
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   console.log("Connected with mongoDB ATLAS!!");
//   client.close();
// });

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



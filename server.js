import express from 'express';
import mongoose from "mongoose";
import PostModel from './models/post.js';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import mongodb from "mongodb";
const MongoClient = mongodb.MongoClient;

const port = 4000;
const app = express();

app.use(express.json())

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
app.get("/api/post", async (req, res)=> {
    try{
        const posts = await PostModel.find()
        res.json(posts)
    } catch(err){
        console.log(err)
        res.json(err.message)
    }
})

//Get by id
app.get("/api/post/:id", async (req, res)=>{
    try{
        const post = await PostModel.findById(req.params.id)
        res.json(post)
    } catch(err){
        console.log(err)
        res.json(err.message)
    }
})

//Get by page
app.get('/api/post/batch/:page', async (req, res)=> {
    const limit = 5
    try{
        const posts = await PostModel.find().limit(limit).skip((req.params.page -1) * limit).exec()

        const count = await PostModel.countDocuments()

        res.json({
            posts,
            numOfResults: posts.length,
            currentPage: Number(req.params.page),
            totalPages: Math.ceil(count/limit)
        })
    } catch(err){
        console.log(err)
        res.json(err.message)
    }
})

//post key
app.post('/api/post/:key', async (req, res)=> {
    try{
        if(req.params.key != "123"){
            return res.status(401).json("No need")
        }
        const newPost = new PostModel(req.body)
        console.log(newPost)
        newPost.save()
        res.json("New post is saved!")
    } catch(err){
        console.log(err)
        res.json(err.message)
    }
})

//mongoDB Atlas
const DB_NAME = `express-login`;
const USER_NAME = `MariDevelop`;
const USER_PASSWD = `Usako123!`;
const HOST_NAME = `cluster0.dpi5u.mongodb.net`; 

const url = `mongodb+srv://${USER_NAME}:${USER_PASSWD}@${HOST_NAME}/${DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true});
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  console.log("Connected with mongoDB ATLAS!!");
  client.close();
});

app.use(express.json());
app.use(cookieParser());

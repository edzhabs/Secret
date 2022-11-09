//jshint esversion:6
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const ejs  = require("ejs");
const https = require("node:https");
const { Schema } = mongoose;
const encrypt = require("mongoose-encryption");

const app = express();

mongoose.connect("mongodb://localhost:27017/userDB")

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs");


app.get("/", (req, res)=>{
    res.render("home")
})

app.get("/login", (req, res)=>{
    res.render("login")
})

app.get("/register", (req, res)=>{
    res.render("register")
})

const userSchema = new Schema({
    email: String,
    password: String
})

console.log(process.env.API_KEY);

userSchema.plugin(encrypt, {secret: process.env.SECRET, requireAuthenticationCode: false, encryptedFields: ["password"]});

const User = mongoose.model("User", userSchema);

app.post("/register", (req, res)=>{
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    })
    newUser.save((err)=>{
        if(!err){
            res.render("secrets")
        } else {
            console.log(err);
        }
    })
})

app.post("/login", (req, res)=>{
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}, (err, foundUser)=>{
        if(!err) {
            if(foundUser) {
                if(foundUser.password === password) {
                    res.render("secrets")
                }
            }
        } else {
            console.log(err);
        }
    })
})


app.listen(3000, ()=>{
    console.log("Server is running in Port 3000.");
})
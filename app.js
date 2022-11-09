//jshint esversion:6
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const ejs  = require("ejs");
const https = require("node:https");
const { Schema } = mongoose;
const encrypt = require("mongoose-encryption");

const bcrypt = require("bcrypt");
const saltRounds = parseInt(process.env.SALT_ROUNDS);

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

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

const User = mongoose.model("User", userSchema);

app.post("/register", (req, res)=>{
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        if(!err){
            const newUser = new User({
                email: req.body.username,
                password: hash
            })
            newUser.save((error)=>{
                if(!error){
                    res.render("secrets")
                } else {
                    console.log(error);
                }
            })
        } else {
            console.log(err);
        }
    });
})

app.post("/login", (req, res)=>{
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}, (err, foundUser)=>{
        if(!err) {
            bcrypt.compare(password, foundUser.password, function(error, result) {
                if(result === true) {
                    res.render("secrets")
                }
            });
        } else {
            console.log(err);
        }
    })
})


app.listen(3000, ()=>{
    console.log("Server is running in Port 3000.");
})
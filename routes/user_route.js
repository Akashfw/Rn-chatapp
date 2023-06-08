const express= require("express");
const bcrypt= require("bcrypt");
const nodemailer = require("nodemailer");
const jwt= require("jsonwebtoken");
const {Usermodel}= require("../models/user_model");
const {authenticate} = require("../middleware/authentication");
const userRoute= express.Router();

userRoute.post("/register", async(req,res)=>{
    const {username,email,password} = req.body;
        try {
            let user= await Usermodel.find({email});
            if(user.length==0){
                bcrypt.hash(password,5,async(err,hash)=>{
                    const user = new Usermodel({username,email,password:hash});
                    await user.save();
                    res.send({"msg":"User Signup Successfully please verify your email to login"});
                });
                
                const transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 587,
                    auth: {
                      user: "masaischoolproject@gmail.com",
                      pass: "pssmfzaekhcypqlj",
                    },
                  });

                  transporter.sendMail({
                    to:req.body.email,
                    from:"shuklaakash704904@gmail.com",
                    subject:"Email Verification !",
                    html: `<p>Hii ${username}, please click hear <a href="https://frolicking-duckanoo-737413.netlify.app/verify-page.html?email=${email}">Link</a> to verify your account</p>`
                })
               

            }else{
                res.send({"msg":"User already present please login"});
            }
            


        } catch (err) {
            res.status(404).send("Unable to register user");
            console.log(err);
        }
});





userRoute.post("/login", async(req,res)=>{
    const {email,password} = req.body;
    try {
        const user = await Usermodel.find({email});
        if(user[0].isVerified=="false"){
            res.send({"msg":"user not verified"})
        }else{
            if(user.length>0){
                bcrypt.compare(password, user[0].password,(err,result)=>{
                    if(result){
                        const token= jwt.sign({userid:user._id},"masai",{expiresIn:"1d"});
                        res.send({"msg":"Login Successful", "token":token});
                    }else{
                        res.status(404).send({"msg":"wrong Password"})
                    }
                });
            }else{
                res.status(404).send({"msg":"register first"});
            }
        }
        
    } catch (err) {
        res.status(404).send({"msg":"Unable to login"});
        console.log(err);
    }
});


userRoute.patch("/verify/:email", async(req,res)=>{
    let {email}= req.params;
    try {
        let user = await Usermodel.updateOne({email},{isVerified:true});
        res.send({"msg":`User Verified Successfully`})

    } catch (err) {
        res.render({"msg":"user not verified"});
        console.log(err)
    }
})


module.exports={
    userRoute
}
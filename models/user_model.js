const mongoose = require("mongoose");

const userSchema= mongoose.Schema({
  username: String,
  email: String,
  password: String,
  isVerified:{type:String, default:false}
});

const Usermodel = mongoose.model("User",userSchema);

module.exports={
    Usermodel
}
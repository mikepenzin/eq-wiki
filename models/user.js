var mongoose                = require('mongoose'),
    passportLocalMongoose   = require("passport-local-mongoose");
    
    
var UserSchema = new mongoose.Schema({
    username: String ,
    password: String,
    email: String,
    firstName: String,
    lastName: String,
    ranking: Number,
    role:  {
        type: String, 
        default: "member"
    }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
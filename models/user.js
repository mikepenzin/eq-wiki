var mongoose                = require('mongoose'),
    passportLocalMongoose   = require("passport-local-mongoose");
    
    
var UserSchema = new mongoose.Schema({
    sso: String ,
    password: String,
    email: String,
    firstName: String,
    lastName: String,
    ranking: Number,
    role: String //need to be default value - worker
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
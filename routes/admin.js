var express     = require("express");
var router      = express.Router();
var post        = require('../models/post');
var User        = require('../models/user');
var middleware  = require('../middleware');


router.get("/:user_id", middleware.isUserAdmin, function(req, res){
    User.findById(req.params.user_id, function(err, foundUser){
        if (err) {
            console.log(err);    
        } else {
            User.find({ role: { $nin: [ 'manager' ] }}, function(err, foundUsers){
              if(err){
                console.log(err);
              } else {
                res.render("admin/profile", {user:foundUser, users:foundUsers});
              }
            });      
        }
    });
});

module.exports = router;
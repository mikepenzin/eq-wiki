var express     = require("express");
var router      = express.Router();
var post        = require('../models/post');
var User        = require('../models/user');
var middleware  = require('../middleware');


router.get("/:user_id", middleware.isLoggedIn, function(req, res){
    User.findById(req.params.user_id, function(err, foundUser){
        if (err) {
            console.log(err);    
        } else {
            post.find({}, function(err, foundPosts){
              if(err){
                console.log(err);
              } else {
                var AuthorPosts = [];
                
                for (var i = 0; i < foundPosts.length; i++) {
                    var postID = foundPosts[i].author.id;
                    var userID = foundUser._id;
                    if (postID.equals(userID)){
                        AuthorPosts.push(foundPosts[i]);
                    }    
                }
                res.render("user/profile", {user:foundUser, posts:AuthorPosts});
              }
            });      
        }
    });
});

module.exports = router;
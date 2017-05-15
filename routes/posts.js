var express     = require("express");
var router      = express.Router();
var post        = require('../models/post');
var Comment     = require('../models/comment');
var User        = require('../models/user');
var middleware  = require('../middleware');
var timeago     = require('timeago-simple');

// INDEX route - show all data
router.get("/", function(req, res){
    post.find({}, function(err, AllPosts){
      if(err){
        console.log(err);
      } else {
        res.render("post/index", {posts:AllPosts});
      }
    });
});


// SEARCH Route
router.get("/search", function(req, res){
    var search = req.query.search;
    var newSearch = search.split(", ");
    post.find({ tags: { "$in" : newSearch} }, function(err, foundPosts){
      if(err){
        console.log(err);
      } else {
        res.render("post/searchResult", {posts:foundPosts, search:search});
      }
    });
});

router.post("/", middleware.isLoggedIn, function(req, res){
        var name = req.body.name;
        var descr = req.sanitize(req.body.descr);
        var author = {
            id: req.user._id,
            username: req.user.username
        };
        var ranking = 0;
        var tags = req.body.tag;
        tags = tags.split(", ");
        var newpost = {name: name, descr: descr, author: author, ranking: ranking, tags:tags};
        //Create a new post and save to DB
        post.create(newpost, function(err, newlyCreated){
            if(err){
                console.log(err);
            } else{
                //redirect back to posts page
                res.redirect("/posts");       
            }
        });
    //  });
});

//NEW - show form to add new item to the db
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("post/new");
});

//SHOW - shows more info about posts
router.get("/:id", function(req, res){
    post.findById(req.params.id).populate('comments').exec(function(err, foundPost){
        if(err){
          console.log(err);
        } else {
          User.findById(foundPost.author.id, function(err, foundAuthor) {
              var authorRanking = foundAuthor.ranking;
              var userID = [];
              for(var i = 0; i < foundPost.comments.length; i++){
                  userID.push(foundPost.comments[i].author.id);
              }
                User.find({'_id': { $in: userID}}, function(err, foundPosters){
                      var tags = foundPost.tags;
                      res.render("post/show", {post:foundPost, commenters:foundPosters, authorRanking:authorRanking, tags:tags});
                });
          }); 
        }
    });
    
});

//EDIT - post route
router.get("/:id/edit", middleware.checkPostOwnership, function(req, res){
    post.findById(req.params.id, function(err, foundPost){
        res.render("post/edit", {post:foundPost});
    });
});

//UPDATE - post route
router.put("/:id", middleware.checkPostOwnership, function(req, res){
    var name = req.body.name;
    var descr = req.body.descr;
    var tags = req.body.tag.split(",");
    var newpost = {name: name, descr: descr, tags:tags};
  post.findByIdAndUpdate(req.params.id, newpost, function(err, updatedPost){
    if(err){
      console.log(err);
      res.redirect("back");
    } else {
      res.redirect("/posts/" + req.params.id);
    }
  });
});

//DELETE - post route
router.delete("/:id", middleware.checkPostOwnership, function(req, res){
   // remove comments
   post.findById(req.params.id, function(err, foundPost){
      if (err) {
         console.error(err);
      } else {
         // Remove associated comments
         var foundPosts = foundPost.comments;
         foundPosts.forEach(function(commentID){
            Comment.findByIdAndRemove(commentID, function(err){
               if(err) {
                  console.log("Error removing comment: " + err);
               }
            });
         });

         // Remove post
         foundPost.remove(req.params.id, function(err, post){
            if (err) {
               res.redirect("/posts");
            } else {
               res.redirect("/posts/");
            }        
         });
      }      
   });
});


//Add post ranking - put route (update route)
router.post("/:id/RankUp", middleware.checkPostVoteOwnership, function(req, res){
    post.findById(req.params.id, function(err, foundPost){
    if (err) {
        console.error(err);
      } else {
        var indexRanked = foundPost.rankedBy.indexOf(req.user._id);
        if(indexRanked == -1){
             foundPost.ranking++;
             foundPost.rankedBy.push(req.user._id);
             foundPost.save();
             User.findById(foundPost.author.id, function(err, foundUser){
                if (foundUser.ranking == undefined) {
                    foundUser.ranking = 0;
                } 
                foundUser.ranking++;
                foundUser.save();
             });
             res.redirect("back");
        } else {
            req.flash("error", "You already voted for this post!");
            res.redirect("back");
        } 
      }
   });
});

//Remove post ranking - put route (update route)
router.post("/:id/RankDown", middleware.checkPostVoteOwnership, function(req, res){
    post.findById(req.params.id, function(err, foundPost){
    if (err) {
        console.error(err);
      } else {
        var indexRanked = foundPost.rankedBy.indexOf(req.user._id);
        if(indexRanked != -1){
             foundPost.rankedBy.splice(indexRanked, 1);
        }
        foundPost.rankedBy.push(req.user._id);
        foundPost.ranking--;
        foundPost.save();
        User.findById(foundPost.author.id, function(err, foundUser){
            if (foundUser.ranking == undefined) {
                foundUser.ranking = 0;
            } 
            foundUser.ranking--;
            foundUser.save();
        });
        res.redirect("back");
      }
   });
});

module.exports = router;
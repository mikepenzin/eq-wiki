var bodyParser              = require("body-parser"),
    mongoose                = require('mongoose'),
    methodOverride          = require('method-override'),
    passport                = require("passport"),
    LocalStrategy           = require("passport-local"),
    flash                   = require("connect-flash"),
    User                    = require('./models/user'),
    compression             = require('compression'),
    express                 = require("express"),
    expressSanitizer        = require('express-sanitizer'),
    app                     = express();


app.use(compression(9));

//requring routes
var commentRoutes   = require("./routes/comments"),
    postRoutes      = require("./routes/posts"),
    indexRoutes     = require("./routes/index"),
    userRoutes      = require("./routes/users"),
    adminRoutes      = require("./routes/admin");


// If process.env.DATABASEURL = undefined - need to perform:
// export DATABASEURL=mongodb://localhost/eqwiki
mongoose.Promise = global.Promise;
mongoose.connect(process.env.DATABASEURL || 'mongodb://localhost/eqwiki');

// Adding public folder to Express routes to serve JS and CSS files from /public and /bower_components folders
app.use(express.static(__dirname + "/public", { maxAge: 86400000 }));
app.use(express.static(__dirname + "/bower_components", { maxAge: 86400000 }));

// to not use .ejs ending
app.set("view engine","ejs");

//method override
app.use(methodOverride("_method"));

//tell express to use body-parser
app.use(bodyParser.urlencoded({extended: true}));

//use sanitizer in order to prevend entering js scripts in textarea
app.use(expressSanitizer());

//app to use flash
app.use(flash());

//=========================
// Passport configuration
//=========================

app.use(require("express-session")({
    secret: "We made it!",
    resave: false,
    saveUninitialized: false
}));

//for Passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

//=========================
// END - Passport configuration
//=========================


app.use("/", indexRoutes);
app.use("/profile", userRoutes);
app.use("/posts", postRoutes);
app.use("/posts/:id/comments", commentRoutes);
app.use("/admin", adminRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("=========================");
    console.log("Wiki Server has started!");
    console.log("=========================");
});
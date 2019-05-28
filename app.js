var express					            = require("express"),
    app                         = express(),
    methodOverride			        = require("method-override"),
    mongoose				            = require("mongoose"),
    MongoClient                 = require('mongodb').MongoClient,
    flash                       = require("connect-flash"),
    expressSanitizer            = require("express-sanitizer"),
    bodyParser                  = require("body-parser"),
    nodeMailor                  = require("nodemailer"),
    rwg                         = require("random-word-generator"),
    dotenv                      = require('dotenv/config'),
    fs                          = require('fs'),
    // upload                      = require('express-fileupload'),
    multer                      = require('multer'),
    session                     = require('express-session'),
    passport                    = require('passport'),
    generator                   = new rwg();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //////////////////////////
 // Environment Variable //
//////////////////////////

var PORT                    = process.env.PORT,
    EMAIL                   = process.env.EMAIL,
    TOMAIL                  = process.env.TOMAIL,
    PASSWORD                = process.env.PASSWORD,
    DB                      = process.env.DB,
    DBNAME                  = process.env.DBNAME,
    SECRET                  = process.env.SECRET;
    
var storage = multer.diskStorage({
  destination: './public/resume',
  function(req,file,cb){
    cb(null,file.originalname);
  }
});

mongoose.connect(
  DB,
  { useNewUrlParser: true}
)
  .then(()=> console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const upload = multer({
  storage: storage
});

var transporter = nodeMailor.createTransport({
  host: 'smtp.gmail.com',
  port:587,
  secure: false,
  auth: {
    user: EMAIL,
    pass: PASSWORD
  },
  tls:{
    rejectUnauthorized:false
  }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /////////////////
 // Connections //
/////////////////

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /////////////////////
 // Passport Config //
/////////////////////

require('./config/passport')(passport);
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);
app.use(passport.initialize())
app.use(passport.session())
app.use(flash());
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  ////////////
 // Routes //
////////////


app.use('/', require('./routes/index.js'));
app.use('/admin', require('./routes/users.js'));

app.get('*',(req,res)=>{
  res.render('notfound');
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //////////////
 // Listener //
//////////////

app.listen(PORT, function() {
	console.log("SERVER ONLINE");
});

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
    DBNAME                  = process.env.DBNAME;
    
var storage = multer.diskStorage({
  destination: './public/resume',
  function(req,file,cb){
    cb(null,file.originalname);
  }
});

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
// mongoose.connect(DB,{useMongoClient:true});
// MongoClient.connect(DB,(err,client)=>{
//   if(err) return console.log(err);
//   db=client.db(DBNAME);
// });
app.use(expressSanitizer());
app.use(methodOverride("_method"));
// app.use(upload());
// app.use(flash());

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  ////////////
 // Routes //
////////////


app.get("/",(req,res)=>{
    res.render('home');
});

app.get('/about',(req,res)=>{
    res.render('about');
});

app.get('/contact',(req,res)=>{
    res.render('contact');
});

app.get('/error',(req,res)=>{
  res.render('errorpage')
});

// app.get('/career',(req,res)=>{
//   res.render('careerpage')
// });

app.post('/uploadResume',upload.single('file'),(req,res)=>{
  const file=req.file;
  if(file){
    console.log(req.file);
    var filename=file.filename;
    var candCv=filename,
        cvPath='./public/resume/'+candCv;
    const output = `
        <b>Jobs Master Alert</b>
        <p>Your CV has successfully been uploaded to our portal.</p>
        <h3>Contact Details</h3>
        <p>Please verify your contact details</p>
        <ul>  
          <li>Name: ${req.body.candname}</li>
          <li>Email: ${req.body.candemail}</li>
          <li>Phone: ${req.body.candphone}</li>
          <li>City: ${req.body.candcity}</li>
        </ul>`;
      
    const userRecord = `
        <b>Jobs Master Alert</b>
        <p>A new candidate uploaded their CV</p>
        <h3>Contact Details</h3>
        <ul>  
          <li>Name: ${req.body.candname}</li>
          <li>Email: ${req.body.candemail}</li>
          <li>Phone: ${req.body.candphone}</li>
          <li>City: ${req.body.candcity}</li>
        </ul>`;
    
    let mailOptions= {
      from:EMAIL,
      to: TOMAIL,
      subject: 'Job Masters-Candidate request',
      text: 'Candidate Request',
      attachments:[{
        filename: candCv,
        path: cvPath,
        contentType: 'application/pdf'
      }],
      html: userRecord
    };
    let mailOptions2= {
      from:EMAIL,
      to: req.body.candemail,
      subject: 'Job Master',
      text: 'Please verify your details',
      html: output
    };
    transporter.sendMail(mailOptions,(err,info)=>{
      if(err){
        console.log(err);
        return res.redirect('/error');
      }
      console.log('Message: %s sent: %s',info.messageId,info.response);
      // console.log(info);
    });
    transporter.sendMail(mailOptions2,(err,info)=>{
      if(err){
        onsole.log(err);
        return res.redirect('/error');
      }
      console.log('Message: %s sent: %s',info.messageId,info.response);
      res.redirect('/');
    });
    }
  // res.redirect('/');
});

app.post('/postjob',(req,res)=>{
  var compname=req.body.compname,
      compemail=req.body.compemail,
      joblocation=req.body.complocation,
      jobtitle=req.body.compjobtitle,
      salary=req.body.compsalary,
      compopening=req.body.compopening,
      jobtype=req.body.compjtype,
      experience=req.body.compjexperience,
      jobcategory=req.body.compjcategory,
      description=req.body.compjdesc;


  let transporter = nodeMailor.createTransport({
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
  const output = `
      <b>Jobs Master Alert</b>
      <p>Your job has been posted to our portal.</p>
      <h3>Contact Details</h3>
      <p>Please verify your contact details</p>
      <ul>  
        <li>Company Name: ${compname}</li>
        <li>Company Email: ${compemail}</li>
        <li>Job Location: ${joblocation}</li>
        <li>Job Title: ${jobtitle}</li>
        <li>In-hand Salary: ${salary}</li>
        <li>No of Openings: ${compopening}</li>
        <li>Job Type: ${jobtype}</li>
        <li>Job Experience: ${experience}</li>
        <li>Job Category: ${jobcategory}</li>
        <li>Job Description: ${description}</li>
      </ul>`;
  
  const userRecord = `
      <b>Jobs Master Alert</b>
      <p>A new job has been posted on your portal</p>
      <h3>Contact Details</h3>
      <ul>  
        <li>Company Name: ${compname}</li>
        <li>Company Email: ${compemail}</li>
        <li>Job Location: ${joblocation}</li>
        <li>Job Title: ${jobtitle}</li>
        <li>In-hand Salary: ${salary}</li>
        <li>No of Openings: ${compopening}</li>
        <li>Job Type: ${jobtype}</li>
        <li>Job Experience: ${experience}</li>
        <li>Job Category: ${jobcategory}</li>
        <li>Job Description: ${description}</li>
      </ul>`;

  let mailOptions= {
    from:EMAIL,
    to: TOMAIL,
    subject: 'Job Masters-Company request',
    text: 'Job Posted',
    html: userRecord
  };
  let mailOptions2= {
    from:EMAIL,
    to: compemail,
    subject: 'Job Master',
    text: 'Please verify your details',
    html: output
  };
  transporter.sendMail(mailOptions2,(err,info)=>{
    if(err){
      console.log(err);
      // return res.redirect('/error');
    }
    console.log('Message: %s sent: %s',info.messageId,info.response);
  });
  transporter.sendMail(mailOptions,(err,info)=>{
    if(err){
      console.log(err);
      // return res.redirect('/error');
    }
    console.log('Message: %s sent: %s',info.messageId,info.response);
    res.redirect('/');
  });
});

app.post('/querymail',(req,res)=>{
  var compname=req.body.queryname,
      compemail=req.body.queryemail,
      joblocation=req.body.querysubj,
      jobtitle=req.body.querymessage;


  // let transporter = nodeMailor.createTransport({
  //   host: 'smtp.gmail.com',
  //   port:587,
  //   secure: false,
  //   auth: {
  //     user: EMAIL,
  //     pass: PASSWORD
  //   },
  //   tls:{
  //     rejectUnauthorized:false
  //   }
  // });
  const output = `
      <b>Jobs Master Alert</b>
      <p>Your query has been recieved by our officials.</p>
      <h3>Contact Details</h3>
      <p>Thank you for your effort, we will reach out to you.</p>`;
  
  const userRecord = `
      <b>Jobs Master Alert</b>
      <p>A new job has been posted on your portal</p>
      <h3>Contact Details</h3>
      <ul>  
        <li>Name: ${compname}</li>
        <li>Email: ${compemail}</li>
        <li>Query Subject: ${joblocation}</li>
        <li>Query Message: ${jobtitle}</li>
      </ul>`;

  let mailOptions= {
    from:EMAIL,
    to: TOMAIL,
    subject: 'Job Masters-Query',
    text: 'Query',
    html: userRecord
  };
  let mailOptions2= {
    from:EMAIL,
    to: compemail,
    subject: 'Job Master',
    text: 'Please verify your details',
    html: output
  };
  transporter.sendMail(mailOptions2,(err,info)=>{
    if(err){
      console.log(err);
      return res.redirect('/error');
    }
    console.log('Message: %s sent: %s',info.messageId,info.response);
  });
  transporter.sendMail(mailOptions,(err,info)=>{
    if(err){
      console.log(err);
      return res.redirect('/error');
    }
    console.log('Message: %s sent: %s',info.messageId,info.response);
    res.redirect('/');
  });
});

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
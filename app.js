var express					            = require("express"),
    app                         = express(),
    methodOverride			        = require("method-override"),
    mongoose				            = require("mongoose"),
    flash                       = require("connect-flash"),
    expressSanitizer            = require("express-sanitizer"),
    bodyParser                  = require("body-parser"),
    nodeMailor                  = require("nodemailer"),
    rwg                         = require("random-word-generator"),
    dotenv                      = require('dotenv/config'),
    upload                      = require('express-fileupload'),
    generator                   = new rwg();
    
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //////////////////////////
 // Environment Variable //
//////////////////////////

var PORT                    = process.env.PORT,
    EMAIL                   = process.env.EMAIL,
    TOMAIL                  = process.env.TOMAIL,
    PASSWORD                = process.env.PASSWORD,
    DB                      = process.env.DB;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /////////////////
 // Connections //
/////////////////

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));
mongoose.connect("mongodb://localhost/tezzpolicy", {useMongoClient: true});
app.use(expressSanitizer());
app.use(methodOverride("_method"));
app.use(upload());
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

app.post('/uploadResume',(req,res)=>{
  if(req.files){
    console.log(req.files.file);
    var file=req.files.file,
        filename=file.name;
        prefix=generator.generate();
        candCv=prefix+filename,
        cvPath='./resume/'+candCv;
    file.mv(cvPath,(err)=>{
      if(err){
        console.log(err);
        res.redirect('/error');
      }else{
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
      }
    });
  }
  
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

app.post('/querymail',(req,res)=>{
  var compname=req.body.queryname,
      compemail=req.body.queryemail,
      joblocation=req.body.querysubj,
      jobtitle=req.body.querymessage;


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
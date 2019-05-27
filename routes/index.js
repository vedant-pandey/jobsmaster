const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const multer = require('multer');
const fs = require('fs');
const mongo = require('mongodb');
const MongoClient = require('mongodb').MongoClient
const DBURI = process.env.DBURI;
const DBNAME = process.env.DBNAME;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'resume')
    }
});

const upload = multer({
  storage: storage
});
 
MongoClient.connect(DBURI, (err, client) => {
  if (err) return console.log(err)
  db = client.db(DBNAME);
})

router.get("/", (req,res)=>{
    res.render('home');
});

router.get('/about', (req,res)=>{
    res.render('about');
});

router.get('/contact', (req,res)=>{
    res.render('contact');
});

router.get('/error', (req,res)=>{
  res.render('errorpage')
});

// router.get('/career',(req,res)=>{
//   res.render('careerpage')
// });

router.get('/dashboard', ensureAuthenticated, (req, res) =>{
    var informations=[]
    var resumes=[]
    db.collection('resumes').find().toArray((err,inforesult)=>{
        if (err) return console.log(err);
        db.collection('resumes').find({},{CV:1}).toArray((err,cvresult)=>{
            if (err) return console.log(err);
            informations = inforesult.reverse();
            
            res.render('dashboard', {
                user: req.user,
                informations: informations
            });
        });
    });
});

router.get('/dashboard/:id', ensureAuthenticated, (req,res) => {
    var docname = new mongo.ObjectID(req.params.id);
    db.collection('resumes').findOne({'_id':docname},(err,result) => {
        if (err) return console.log(err);

        res.contentType('application/pdf');
        res.send(result.CV.CV.buffer);
    })
})

router.post('/uploadResume', upload.single('file'),(req,res)=>{
    const file=req.file;
    var doc=fs.readFileSync(file.path);
    var encoded_doc=doc.toString('base64');
    var finalDoc={
        contentType: file.mimetype,
        CV: new Buffer(encoded_doc, 'base64')
    };
    var candComplete = {
        name: req.body.candname,
        email: req.body.candemail,
        phone: req.body.candphone,
        city: req.body.candcity,
        CV: finalDoc,
        dos: Date.now()
    }
    db.collection('resumes').insertOne(candComplete, (err, result) => {
        console.log(result);
        if (err) return console.log(err);
        console.log('Saved To Database');
        res.redirect('/');
    });
});

router.post('/postjob', (req,res)=>{
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

router.post('/querymail', (req,res)=>{
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
  

module.exports = router;
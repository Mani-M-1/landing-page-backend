const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config();

const app = express();


// port 
const port = process.env.PORT || 8080;


// mongodb connection 
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGOOSE_URI);
        console.log('DB connected successfully!');
    }
    catch(err) {
        console.log(err.message);
        process.exit(1);
    }
}

connectDB();


// middlewares 
app.use(cors());
app.use(express.json());


// Schema 
const userSchema = new mongoose.Schema({
    fullname: {type: String},
    email: {type: String},
    message: {type: String}
})


// Model
const User = mongoose.model('User', userSchema);



// mail logic 
function sendEmail(fullname, email, message) {
  const output = `
        <h3> You have a request through Banking App</h3>
        <p>A user has sent you a message</p>
        <h2>The Client Details</h2>
        <p><b>Fullname:</b> ${fullname}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b> ${message}</p>
        `
  const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
          user: process.env.ORG_EMAIL,
          pass: process.env.EMAIL_PASSKEY
      }
  });

  const options = {
      to: process.env.ORG_EMAIL,
      subject: "Banking And News App - Client Details",
      text: "Hello World!",
      html : output
  };

  transporter.sendMail(options, (err, info) => {
      if (err) {
          console.log(err);
          res.status(500).json({ error: 'An error occurred while sending the email.' });
      } else {
          console.log("Email sent: " + info.response);
          res.json({ message: 'Email sent successfully.' });
      }
  });
}




// routes 

// for showing default message when backend is deployed
app.get('/', async (req, res) => {
    res.status(200).json({message: "Deployed successfully!"});
})


// this api is used to store user details
app.post('/user', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();

        

        res.status(200).json({message: "User created successfully!", userDetails: user});
    } 
    catch(err) {
        res.status(500).json({err_msg: "API Error occured while creating user!", err_desc: err.message});
    }

    // trigger send email 
    sendEmail(req.body.fullname, req.body.email, req.body.message);
})


// starting server
app.listen(port, () => {
    console.log(`Server listening at ${port}`);
});
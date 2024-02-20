const Sib = require("sib-api-v3-sdk");
require("dotenv").config();

const { v4: uuidv4 } = require("uuid");
const ForgotPassword = require("../models/forgotpassword");
const sequelize = require("../util/database");
const bcrypt = require("bcrypt");
const User = require("../models/sign-up");

exports.generateForgotPasswordLink = async (req, res) => {
  try {
console.log(req.body, "hello");
    const {email} = req.body;
    console.log(email, "welcome");

    const user = await User.findOne({ where: { email:email } }); 
    console.log(user);
if (user) {
      const uuid = uuidv4();
      await user.createForgotpassword({
        id: uuid,
        isActive: true,
        
      });

      const url = `http://localhost:3000/password/forgotpassword/${uuid}`;
      console.log(url);

      const client = Sib.ApiClient.instance;

      const apiKey = client.authentications["api-key"];
      apiKey.apiKey = process.env.API_KEY;


      const tranEmailApi = new Sib.TransactionalEmailsApi();
    //console.log(tranEmailApi);

      const sender = {
        email: "creativeganguly91@gmail.com",
        name: "expense app",
      };
      

      const receivers = [{ email: email }];
      await tranEmailApi.sendTransacEmail({
        sender,
        to: receivers,
        subject: "forgot password",
        htmlContent: `<h3>click below link to reset password</h3>
            <a href=${url}>click here</a>`,
      });
      console.log(receivers);
      res.status(200).json({ message: "success" });
    } else {
      throw new Error();
      
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: error });
  }
  
};

exports.resetPassword = async (req, res) => {
  try {

   
  

    console.log("ASDFG");
    console.log(req.params, "wow");
    const id = req.params.id;
    const forgotpasswordrequest = await ForgotPassword.findByPk(id); 
    if (forgotpasswordrequest.isActive === true) {
      forgotpasswordrequest.update({ isActive: false});

      res.status(200).send(`<html>
      <script>
          function formsubmitted(e){
              e.preventDefault();
              console.log('called')i
          }
      </script>


      <form action="http://localhost:3000/password/updatepassword/${id}" method="GET">
          <label for="newpassword">Enter New password</label>
          <input name="newpassword" type="password" required></input>
          <button>reset password</button>
      </form>
     </html>`);
      res.end();
    } else {
      throw new Error("link expired");
    }
  } catch (error) {

    console.log(error);
    res.status(404).json({ message: "link is expired" });
  }
};



exports.updatepassword=async(req,res)=>{
  try {
    console.log("789", req.query, req.params);
      const {newpassword}  = req.query;
      const {resetpasswordid}  = req.params;
      ForgotPassword.findOne({ where : { id: resetpasswordid }}).then(resetpasswordrequest => {
        console.log("hello");
          User.findOne({where: { id : resetpasswordrequest.userId}}).then(user => {
               console.log('userDetails', user)
              if(user) {
                  //encrypt the password

                  const saltRounds = 10;
                  bcrypt.genSalt(saltRounds, function(err, salt) {
                      if(err){
                          console.log(err);
                          throw new Error(err);
                      }
                      bcrypt.hash(newpassword, salt, function(err, hash) {
                          // Store hash in DB
                          if(err){
                              console.log(err);
                              throw new Error(err);
                          }
                          user.update({ password: hash }).then(() => {
                              res.status(201).json({message: 'Successfuly update the new password'})
                          })
                      });
                  });
          } else{
              return res.status(404).json({ error: 'No user Exists', success: false})
          }
          })
      })
  } catch(error){
      return res.status(500).json({ error, success: false } )
  }

}



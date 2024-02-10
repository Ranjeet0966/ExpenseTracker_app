const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const cors = require("cors");


const app = express();
//const router = require('./routes/password'); 
const Sequelize = require("./util/database");
const signUpRouter = require("./routes/sign-up");
const logInRouter = require("./routes/login");
const expenseRouter = require("./routes/expense");
const purchaseRouter = require("./routes/purchase");
const premiumRouter = require("./routes/premium");
const forgotPasswordRouter = require("./routes/password");

const User = require("./models/sign-up");
const Expenses = require("./models/expense");
const Order = require("./models/orders");
const ForgotPasswordRequests = require("./models/forgotpassword");
const FileURL = require("./models/fileurl");

/*const helmet = require("helmet");
const compression = require('compression')
const morgan = require("morgan");

app.use(cors());
app.use(helmet());
app.use(compression());
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
 );
app.use(morgan("combined", { stream: accessLogStream }));*/

app.use(bodyParser.json({ extended: false }));
app.use(express.static('public'));
app.get("/" ,(req, res) => {
  //res.sendFile(path.join(__dirname, `public/${req.url}`));
  
    res.sendFile('signup.html', {root: 'signup'})

});
app.use("/user", signUpRouter);
app.use("/user", logInRouter);
app.use("/user", expenseRouter);
app.use("/purchase", purchaseRouter);
app.use("/premium", premiumRouter);
app.use("/password", forgotPasswordRouter);

app.use((req, res) => {
  res.sendFile(path.join(__dirname, `public/${req.url}`));
  
    

});

User.hasMany(Expenses);
Expenses.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(ForgotPasswordRequests);
ForgotPasswordRequests.belongsTo(User);

User.hasMany(FileURL);
FileURL.belongsTo(User);

Sequelize.sync()
  .then(() => {
    app.listen(process.env.PORT || 3000);
    //updating
  })
  .catch((err) => console.log(err));

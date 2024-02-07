const passwordController = require("../controllers/password");
const express = require("express");
const router = express.Router();


router.post("/forgotpassword", passwordController.generateForgotPasswordLink);

router.get("/forgotpassword/:id", passwordController.resetPassword);

router.get("/updatepassword/:resetpasswordid", passwordController.updatepassword);



module.exports = router;
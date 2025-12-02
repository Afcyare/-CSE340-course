const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");
const auth = require("../utilities/auth-middleware");

// Login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Registration
router.get("/register", utilities.handleErrors(accountController.buildRegister));
router.post("/register", regValidate.registrationRules(), regValidate.checkRegData, 
           utilities.handleErrors(accountController.registerAccount));

// Login process
router.post("/login", regValidate.loginRules(), regValidate.checkLoginData, 
           utilities.handleErrors(accountController.accountLogin));

// Account management
router.get("/", auth.checkLogin, utilities.handleErrors(accountController.buildManagement));

// Update account routes
router.get("/update/:account_id", auth.checkLogin, 
           utilities.handleErrors(accountController.buildUpdateAccount));
router.post("/update", auth.checkLogin, regValidate.updateAccountRules(), 
           regValidate.checkUpdateData, utilities.handleErrors(accountController.updateAccount));
router.post("/update-password", auth.checkLogin, regValidate.passwordRules(), 
           regValidate.checkPasswordData, utilities.handleErrors(accountController.updatePassword));

// Logout
router.get("/logout", utilities.handleErrors(accountController.logout));

module.exports = router;
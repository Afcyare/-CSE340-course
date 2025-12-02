const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration."
    );
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    });
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }
  
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      
      // DEBUG: Log what's being included in JWT
      console.log("Creating JWT with accountData:", accountData);
      
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      );
      
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
      }
      
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Please check your credentials and try again.");
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    throw new Error("Access Forbidden");
  }
}

/* ****************************************
 *  Build Account Management View - Task 3
 * ************************************ */
async function buildManagement(req, res) {
  let nav = await utilities.getNav();
  const accountData = res.locals.accountData;
  
  res.render("account/accountManagement", {
    title: "Account Management",
    nav,
    errors: null,
    message: req.flash("notice"),
    accountData,
  });
}

/* ****************************************
 *  Build Update Account View - Task 4
 * ************************************ */
async function buildUpdateAccount(req, res) {
  try {
    let nav = await utilities.getNav();
    const account_id = parseInt(req.params.account_id);
    
    // Check if logged in user is updating their own account
    if (res.locals.accountData.account_id !== account_id) {
      req.flash("notice", "You can only update your own account.");
      return res.redirect("/account/");
    }
    
    const accountData = await accountModel.getAccountById(account_id);
    
    if (!accountData) {
      req.flash("notice", "Account not found.");
      return res.redirect("/account/");
    }
    
    res.render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
    });
  } catch (error) {
    next(error);
  }
}

/* ****************************************
 *  Update Account Information - Task 5
 * ************************************ */
async function updateAccount(req, res) {
  try {
    let nav = await utilities.getNav();
    const { account_id, account_firstname, account_lastname, account_email } = req.body;
    
    // Check if logged in user is updating their own account
    if (res.locals.accountData.account_id != account_id) {
      req.flash("notice", "You can only update your own account.");
      return res.redirect("/account/");
    }
    
    const updateResult = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    );
    
    if (updateResult) {
      // Get updated account data
      const updatedAccount = await accountModel.getAccountById(account_id);
      delete updatedAccount.account_password;
      
      // Update JWT token with new data
      const accessToken = jwt.sign(
        updatedAccount,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      );
      
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
      }
      
      req.flash("notice", "Account information updated successfully.");
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Sorry, the update failed.");
      res.render("account/update", {
        title: "Update Account",
        nav,
        errors: null,
        account_id,
        account_firstname,
        account_lastname,
        account_email,
      });
    }
  } catch (error) {
    next(error);
  }
}

/* ****************************************
 *  Update Password - Task 5
 * ************************************ */
async function updatePassword(req, res) {
  try {
    let nav = await utilities.getNav();
    const { account_id, account_password } = req.body;
    
    // Check if logged in user is updating their own account
    if (res.locals.accountData.account_id != account_id) {
      req.flash("notice", "You can only update your own account.");
      return res.redirect("/account/");
    }
    
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hashSync(account_password, 10);
    } catch (error) {
      req.flash("notice", "Sorry, there was an error processing the password change.");
      return res.redirect(`/account/update/${account_id}`);
    }
    
    const updateResult = await accountModel.updatePassword(account_id, hashedPassword);
    
    if (updateResult) {
      req.flash("notice", "Password updated successfully.");
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Sorry, the password update failed.");
      return res.redirect(`/account/update/${account_id}`);
    }
  } catch (error) {
    next(error);
  }
}

/* ****************************************
 *  Logout Process - Task 6
 * ************************************ */
async function logout(req, res) {
  res.clearCookie("jwt");
  req.flash("notice", "You have been logged out.");
  res.redirect("/");
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildManagement,
  buildUpdateAccount,
  updateAccount,
  updatePassword,
  logout,
};
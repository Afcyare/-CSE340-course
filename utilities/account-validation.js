const utilities = require("./index");
const accountModel = require("../models/account-model");
const { body, validationResult } = require("express-validator");
const validate = {};

/* **********************************
 * Registration Data Validation Rules
 * ********************************* */
validate.registrationRules = () => {
  return [
    body("account_firstname")
      .trim()
      .notEmpty()
      .withMessage("Please provide a first name."),
    body("account_lastname")
      .trim()
      .notEmpty()
      .withMessage("Please provide a last name."),
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email);
        if (emailExists) {
          throw new Error("Email exists. Please log in or use different email");
        }
      }),
    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

/* **********************************
 * Login Validation Rules
 * ********************************* */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("A valid password is required."),
  ];
};

/* **********************************
 * Update Account Validation Rules
 * ********************************* */
validate.updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .notEmpty()
      .withMessage("Please provide a first name."),
    body("account_lastname")
      .trim()
      .notEmpty()
      .withMessage("Please provide a last name."),
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        const accountData = await accountModel.getAccountByEmail(account_email);
        if (accountData && accountData.account_id != req.body.account_id) {
          throw new Error("Email exists. Please use a different email");
        }
      }),
  ];
};

/* **********************************
 * Password Validation Rules
 * ********************************* */
validate.passwordRules = () => {
  return [
    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
    body("account_password_confirm")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.account_password) {
          throw new Error("Passwords do not match");
        }
        return true;
      }),
  ];
};

/* **********************************
 * Check Registration Data
 * ********************************* */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.render("account/register", {
      errors: errors.array(),
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    });
  }
  next();
};

/* **********************************
 * Check Login Data
 * ********************************* */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.render("account/login", {
      errors: errors.array(),
      title: "Login",
      nav,
      account_email,
    });
  }
  next();
};

/* **********************************
 * Check Update Data
 * ********************************* */
validate.checkUpdateData = async (req, res, next) => {
  const { account_id, account_firstname, account_lastname, account_email } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const accountData = await accountModel.getAccountById(account_id);

    return res.render("account/update", {
      errors: { account: errors.array() },
      title: "Update Account",
      nav,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    });
  }
  next();
};

/* **********************************
 * Check Password Data
 * ********************************* */
validate.checkPasswordData = async (req, res, next) => {
  const { account_id } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const accountData = await accountModel.getAccountById(account_id);

    return res.render("account/update", {
      errors: { password: errors.array() },
      title: "Update Account",
      nav,
      account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
    });
  }
  next();
};

module.exports = validate;
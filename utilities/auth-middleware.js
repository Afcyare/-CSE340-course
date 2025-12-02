const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
 * Middleware to check JWT token
 **************************************** */
const checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          console.log("JWT verification error:", err.message);
          req.flash("notice", "Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }
        console.log("JWT decoded accountData:", accountData); // DEBUG
        res.locals.accountData = accountData;
        res.locals.loggedin = 1;
        next();
      }
    );
  } else {
    console.log("No JWT cookie found"); // DEBUG
    next();
  }
};

/* ****************************************
 * Middleware to check if user is logged in
 **************************************** */
const checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    console.log("User is logged in, account type:", res.locals.accountData?.account_type); // DEBUG
    next();
  } else {
    console.log("User not logged in, redirecting to login"); // DEBUG
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
};

/* ****************************************
 * Middleware to check if user is Employee or Admin
 **************************************** */
const checkEmployeeOrAdmin = (req, res, next) => {
  const accountType = res.locals.accountData?.account_type;
  console.log("Checking account type for route:", req.originalUrl, "Type:", accountType); // DEBUG
  
  if (accountType === "Employee" || accountType === "Admin") {
    console.log("Access granted for:", accountType); // DEBUG
    next();
  } else {
    console.log("Access denied. Account type:", accountType); // DEBUG
    req.flash("notice", "You must be an employee or administrator to access this page.");
    return res.redirect("/account/login");
  }
};

module.exports = { checkJWTToken, checkLogin, checkEmployeeOrAdmin };
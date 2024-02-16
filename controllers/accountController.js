const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")

const jwt = require("jsonwebtoken")
require("dotenv").config()


async function buildLogin(req, res, next){
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null,
    })
}


async function buildAccount(req, res, next) {
  let nav = await utilities.getNav()
  res.render("./account/management", {
    title: "Account Management",
    nav,
    errors: null,
  })
}


async function buildRegister(req, res, next){
    let nav = await utilities.getNav()
    res.render("account/registration", {
        title: "Register",
        nav,
        errors: null
    })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    // Hash the password before storing
    let hashedPassword
    try {
    // regular password and cost (salt is generated automatically)
      hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("problem", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/registration", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
  
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
  )
  
    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you\'re registered ${account_firstname}. Please log in.`
      )
      res.status(201).render("account/login", {
        title: "Login",
        nav,
      })
    } else {
      req.flash("problem", "Sorry, the registration failed.")
      res.status(501).render("account/registration", {
        title: "Registration",
        nav,
      })
    }
  }

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
   req.flash("notice", "Please check your credentials and try again.")
   res.status(400).render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email,
   })
  return
  }
  try {
   if (await bcrypt.compare(account_password, accountData.account_password)) {
   delete accountData.account_password
   const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
   res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
   return res.redirect("/account/login")
   }
  } catch (error) {
   return new Error('Access Forbidden')
  }
 }



/* ****************************************
*  Deliver accountManagement view
* *************************************** */
async function accountManagement(req, res, next) {
  let nav = await utilities.getNav();
  let account_id = res.locals.accountData.account_id
  let account_firstname = res.locals.accountData.account_firstname
  let account_type = res.locals.accountData.account_type
  res.render("./account/add-account", {
    title: "Account Management",
    nav,
    errors: null,
    account_firstname,
    account_type,
    account_id,
  });
}

/* ****************************************
*  Deliver Update view
* *************************************** */
async function BuildUpdateView(req, res) {
  let nav = await utilities.getNav();
  res.render("./account/edit-account", {
    title: "Update View",
    nav,
    errors:null,
    account_id: res.locals.accountData.account_id,
    account_firstname: res.locals.accountData.account_firstname,
    account_lastname: res.locals.accountData.account_lastname,
    account_email: res.locals.accountData.account_email,
  })
}

async function updateAccount(req, res, next) {
      let nav = await utilities.getNav();
      const {account_firstname,account_lastname, account_email, account_id} = req.body;
      const updateResult = await accountModel.updateAccount(account_firstname, account_lastname, account_email, account_id)
      let updatedAccessToken = ""
      if (updateResult) {
        const updateAcc = await accountModel.getAccountDetails(account_id)
        delete updateAcc.account_password
        updatedAccessToken = jwt.sign(updateAcc, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });
    res.cookie("jwt", updatedAccessToken, { httpOnly: true, maxAge: 3600 * 1000 })
    req.flash("msg", `Congratulations, your account information has been updated.`)
    res.redirect("/account/")
      } else {
        req.flash('problem', 'Sorry, the update failed.');
        res.status(501).render('account/edit-account'), {
          title: 'Update account',
          nav,
          errors: null,
          account_firstname, 
          account_lastname, 
          account_email, 
          account_id,
}}
}


/* ****************************************
 *  Update password  
 * ************************************ */
async function updatePassword (req, res) {
  let nav= await utilities.getNav()
  const { account_firstname, account_lastname, account_email} = req.body
  const account_password = req.body.account_password
  const account_id = res.locals.accountData.account_id
  
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("problem", 'Sorry, there was an error processing the registration.')
    res.status(500).render("./account/edit-account", {
      title: "Edit Account",
      nav,
      errors:null,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    })}

    const passwordUpdateResult = await accountModel.changePassword(hashedPassword, account_id)

    if (passwordUpdateResult){
      req.flash("msg", `Congratulations, your password has been updated`)
      res.redirect("/account/")
    }else{
      req.flash("problem", "Sorry, the change password failed.")
      res.status(501).render("./account/edit-account",{
        title: "Edit Account",
        nav,
        errors:null,
        account_id,
        account_firstname,
        account_lastname,
        account_email,
      })
    }
}
async function BuildDeleteView(req, res) {
  let nav = await utilities.getNav();
  res.render("account/delete-account", {
    title: "Delete Account",
    nav,
    errors: null,
    account_id: res.locals.accountData.account_id,
    account_firstname: res.locals.accountData.account_firstname,
    account_lastname: res.locals.accountData.account_lastname,
    account_email: res.locals.accountData.account_email,
  });
}


async function deleteAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_password } = req.body;
  const account_id = res.locals.accountData.account_id;

  try {
    const deletedAccount = await accountModel.deleteAccount(account_id, account_password); 
    
    res.clearCookie('jwt');
    req.flash("msg", "Account deleted successfully");
    res.redirect("/"); 
    

  } catch (error) {
    console.error("Model error: " + error);
    req.flash("notice", error.message);
    res.status(500).render("./account/delete-account", {
      title: "Delete Account",
      nav,
      errors: null,
      account_id: res.locals.accountData.account_id,
      account_firstname: res.locals.accountData.account_firstname,
      account_lastname: res.locals.accountData.account_lastname,
      account_email: res.locals.accountData.account_email,
    });
  }
}

async function logout(req, res) {
  res.clearCookie('jwt');
  res.redirect('/');
}






  module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccount }
  
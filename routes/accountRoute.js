const regValidate = require('../utilities/account-validation')

// Needed Resources 
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")


router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccount));
router.get("/registration", utilities.handleErrors(accountController.buildRegister))
router.post('/registration',regValidate.registationRules(), regValidate.checkRegData, utilities.handleErrors(accountController.registerAccount));

// Process the registration data
router.post(
    "/registration",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
  )

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)


module.exports = router
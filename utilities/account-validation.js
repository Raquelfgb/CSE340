const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const accountModel = require("../models/account-model")

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // password is required and must be strong password
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
    ]
  }

  validate.inventoryRules = () => {
    return [
      // make is required and must be a string
      body("inv_make")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide a make."), // on error this message is sent.
  
      // model is required and must be a string
      body("inv_model")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide a model."), // on error this message is sent.
  
      // year is required and must be a 4-character string representing a valid year
      body("inv_year")
        .trim()
        .isLength({ min: 4, max: 4 })
        .withMessage("Please provide a valid 4-digit year."), // on error this message is sent.
  
      // description is required and must be a string
      body("inv_description")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide a description."), // on error this message is sent.
  
      // thumbnail is required and must be a string
      body("inv_thumbnail")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide a thumbnail."), // on error this message is sent.
  
      // price is required and must be a number
      body("inv_price")
        .trim()
        .isNumeric()
        .withMessage("Please provide a valid price."), // on error this message is sent.
  
      // miles is required and must be an integer
      body("inv_miles")
        .trim()
        .isInt({ min: 0 })
        .withMessage("Please provide valid miles."), // on error this message is sent.
  
      // color is required and must be a string
      body("inv_color")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide a color."), // on error this message is sent.
  
      // classification_id is required and must be an integer
      body("classification_id")
        .trim()
        .isInt({ min: 1 })
        .withMessage("Please provide a valid classification ID."), // on error this message is sent.
    ];
  };
  



/*  **********************************
 *  Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
    return [
      // valid email is required and cannot already exist in the database
      body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail() // refer to validator.js docs
        .withMessage("A valid email is required.")
        .custom(async (account_email) => {
          const emailExists = await accountModel.checkExistingEmail(account_email)
          if (!emailExists){
            throw new Error("Email not found. Please log in with a different email")
          }
        })
    ]
  }

  /* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("account/registration", {
        errors,
        title: "Registration",
        nav,
        account_firstname,
        account_lastname,
        account_email,
      })
      return
    }
    next()
  }
  
  validate.checkLoginData = async (req, res, next) => {
    const account_email  = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("account/login", {
        errors,
        title: "Login",
        nav,
        account_email,
      })
      return
    }
    next()
  }

  validate.checkInvData = async (req, res, next) => {
    const inv_make = req.body.inv_make 
    const inv_model = req.body.inv_model;
    const inv_year = req.body.inv_year;
    const inv_description = req.body.inv_description;
    const inv_image = req.body.inv_image;
    const inv_thumbnail = req.body.inv_thumbnail;
    const inv_price = parseFloat(req.body.inv_price);
    const inv_miles = parseInt(req.body.inv_miles);
    const inv_color = req.body.inv_color;
    const classification_id = parseInt(req.body.classification_id);
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      let classificationList = await utilities.getClassificationSelects()
      res.render("inventory/add-inventory", {
        errors,
        title: "Add Inventory",
        nav,
        classificationList,
        inv_make, 
        inv_model, 
        inv_year, 
        inv_description, 
        inv_image, 
        inv_thumbnail,
        inv_price, 
        inv_miles,
        inv_color, 
        classification_id
      })
      return
    }
    next()
  }

  module.exports = validate
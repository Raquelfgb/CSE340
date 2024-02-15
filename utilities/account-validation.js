const utilities = require("../models/account-model")
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

      // valid email is required and cannot already exist in the database
      body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
      const emailExists = await accountModel.checkExistingEmail(account_email)
      if (emailExists){
          throw new Error("Email exists. Please log in or use different email")
      }

    }),

  
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
      }),


    //password is required and must be strong password 
    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    })
    .withMessage("Password does not meet requirements") // on error this message is sent 
]
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

validate.addAccountRules = () => {
  return [
    // First Name
    body("account_firstname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide the first name of the account."),
    
    // Last Name
    body("account_lastname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide the last name of the account."),
    
    // Email
    body("account_email")
      .trim()
      .isEmail()
      .withMessage("Please provide a valid email address."),
    
    // Password
    body("account_password")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long."),
    
    // Account Type
    body("account_type")
      .isIn(["client", "manager", "admin"])
      .withMessage("Please select a valid account type.")
  ];
};


validate.checkAddAccount = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email, account_password, account_type } = req.body;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("./account/add-account", {
      errors,
      title: "Add Account",
      nav,
      account_firstname,
      account_lastname,
      account_email,
      account_password,
      account_type
    });
    return;
  }
  next();
};

validate.updateAccountRules = () => {
  return [
    // First Name
    body("account_firstname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Updated first name of the account."),
    
    // Last Name
    body("account_lastname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Updated last name of the account."),
    
    // Email
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email, req) => {
        const existing_account = await accountModel.getAccountByEmail(account_email)
        if(req.req.body.account_id != existing_account.account_id){
          throw new Error("Email exists. Please log in or use different email")
        }
    }),
    // First Name
    body("account_id")
      .trim()
      .isNumeric()
      .withMessage("Please provide the updated first name of the account."),
  ];
};
validate.checkAccountUpdate = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email, account_id } = req.body;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("./account/edit-account", {
      errors,
      title: "Edit Account",
      nav,
      account_firstname,
      account_lastname,
      account_email,
      account_id, 
    });
    return;
  }
  next();
};


validate.deleteAccountRules = () => {
  return [
    // Account ID
    body("account_id")
      .isInt({ min: 1 })
      .withMessage("Invalid account ID."),
  ];
};

validate.checkDeleteAccount = async (req, res, next) => {
  const { account_id } = req.params;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("./account/edelete-account", {
      errors,
      title: "Delete Account",
      nav,
    });
    return;
  }
  next();
};

validate.changePasswordRules = () => {
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
  ]

}

validate.checkResetPassword = async (req, res, next) => {
  const { account_id, account_password } = req.params;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("./account/edit-account", {
      errors,
      title: "Edit Account",
      nav,
    });
    return;
  }


  next();
}
module.exports = validate
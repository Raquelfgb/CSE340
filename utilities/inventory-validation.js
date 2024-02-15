const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validater = {}
const inventoryModel = require("../models/inventory-model")

validater.addClassificationRules = () => {
    return [
        body("classification_name")
        .trim()
        .isAlpha()
        .withMessage("Valid classification name is required. Follow the instruction")
        .isLength({min:1})   
        .custom(async (classification_name) => {
            const classificationExists = await inventoryModel.checkExistingClassification(classification_name)
            if (classificationExists){
                throw new Error("Classification Exists. Please input another classification")
            }
        }),
    ]
}

validater.inventoryRules = () => {
  return [
      body("inv_make")
      .trim()
      .isLength({ min: 1 })
      .withMessage('Enter valid Make')
      .custom(value => !/\s/.test(value))
      .withMessage('No spaces are allowed in the Make'),

      body("inv_model")
      .trim()
      .isLength({min: 1})
      .withMessage("Enter valid Model"),

      body("inv_year")
      .trim()
      .isLength({ min: 4})
      .withMessage("Enter valid year")
      .isLength({ max: 4})
      .withMessage("Enter 4 numbers only for year"),

      body("inv_description")
      .trim()
      .isLength({ min: 1})
      .withMessage("Enter description"),

      body("inv_image")
      .trim()
      .isLength({min: 1})
      .withMessage("Enter image path"),

      body("inv_thumbnail")
      .trim()
      .isLength({min: 1})
      .withMessage("Enter image thumbnail path"),

      body("inv_price")
      .trim()
      .isLength({min: 1})
      .withMessage("Enter valid price without symbol, comma and period"),

      body("inv_miles")
      .trim()
      .isLength({min: 1})
      .withMessage("Enter miles without symbol, comman and period"),

      body("inv_color")
      .trim()
      .isLength({min: 1})
      .withMessage("Enter color"),
  ]
}

validater.checkAddClassification = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()){
        let nav = await utilities.getNav()
        res.render("./inventory/add-classification",{
            errors,
            title: "Add Classification",
            nav,
            classification_name,
        })
        return
    }
    next()
}

  
  /* ******************************
   * Check data and return errors or continue to Inventory addition
   * ***************************** */
  
  
  
  
  validater.checkInventoryData = async (req, res, next) => {
    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles,  inv_color, classification_id} = req.body
    let classification = await utilities.selectClassification(classification_id)
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav(); 
      res.render("inventory/add-inventory", {
        errors,
        title: "Add New Vehicle",
        nav,
        classification,
        inv_make, 
        inv_model, 
        inv_year, 
        inv_description, 
        inv_image, 
        inv_thumbnail, 
        inv_price, 
        inv_miles, 
        inv_color,
      });
      return;
    }
  
    next(); // Move to the next middleware (or route handler) if there are no validation errors
  };
  
  
  /* ******************************
   * Check data and return errors or  continue to Inventory update
   * ***************************** */
  validater.checkUpdateData = async (req, res, next) => {
    const { inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles,  inv_color, classification_id} = req.body
    let classification = await utilities.selectClassification(classification_id)
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav(); 
      res.render("inventory/edit-inventory", {
        errors,
        title: "Edit " + inv_model + inv_make,
        nav,
        classification,
        inv_id,
        inv_make, 
        inv_model, 
        inv_year, 
        inv_description, 
        inv_image, 
        inv_thumbnail, 
        inv_price, 
        inv_miles, 
        inv_color,
      });
      return;
    }
  
    next(); // Move to the next middleware (or route handler) if there are no validation errors
  };


  
module.exports = validater 
    
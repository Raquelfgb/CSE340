const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validateReview = {}

validateReview.reviewRules = () => {
    return [
        body("description")
            .trim()
            .isLength({min: 1})
            .withMessage("Sorry, you need to provide a valid review"), 
    ]
}

/*  **********************************
 *  Review Validation
 * ********************************* */
validateReview.reviewCheck = async (req, res, next) => {
    const {description, inv_id, account_id} = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("./inv_id", {
            errors,
            nav,
            description,
            inv_id,
            account_id
        })
        return
    }
    next()
}

module.exports = validateReview
const utilities = require("../utilities")
const reviewModel = require("../models/review-model")
const reviewController = {}

reviewController.addReview = async function(req, res) {
    let nav = await utilities.getNav()
    const {description, inv_id,  account_id} = req.body
    const addResult = await reviewModel.addReview(description, inv_id, account_id)

    if (addResult) {
        req.flash(
            "notice",
            "Thank you for your review"
        )
        res.status(201).redirect("/account")
    } else {
        req.flash("notice", "Adding review failed")
        res.redirect("/inv_id")
    }
}

module.exports = reviewController
const express = require("express")
const utilities = require("../utilities")
const router = new express.Router()
const validateReview = require("../utilities/review-validation")
const reviewController = require("../controllers/reviewController")



// Route to process new classification
router.post("/",
    validateReview.reviewRules(),
    validateReview.reviewCheck,
    utilities.handleErrors(reviewController.addReview)
)

module.exports = router
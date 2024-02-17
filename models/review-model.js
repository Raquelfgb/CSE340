const pool = require("../database/")


/* ***************************
 *  Inventory id
 * ************************** */
const inventoryReviews = async function(inv_id) {
    try {
        let data = await pool.query(
            "SELECT * FROM public.review WHERE inv_id = $1",
            [inv_id]
        )
        return data.rows
    } catch (error) {
        console.log("inventoryreviews" + error)
    }
}

/* ***************************
 *  Account id
 * ************************** */
const accountReviews = async function(account_id) {
    try {
        let data = await pool.query(
            "SELECT * FROM public.review WHERE account_id = $1",
            [account_id]
        )
        return data.rows
    } catch (error) {
        console.log("accountreviews" + error)
    }
}

/* ***************************
 *  Get all review by inventory
 * ************************** */
const addReview = async function(description, inv_id,  account_id) {
    try {
        let data = await pool.query(
            "Insert INTO public.review (review_text, inv_id, account_id) VALUES ($1, $2, $3)",
            [description, inv_id, account_id]
        )
        return data.rows
    } catch (error) {
        console.log("inventoryreviews" + error)
    }
}



module.exports = { inventoryReviews, addReview, accountReviews }

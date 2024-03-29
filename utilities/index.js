const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()


/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}


/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
    let grid
    if(data.length > 0){
      grid = '<ul id="inv-display">'
      data.forEach(vehicle => { 
        grid += '<li>'
        grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
        + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
        + 'details"><img src="' + vehicle.inv_thumbnail 
        +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
        +' on CSE Motors" /></a>'
        grid += '<div class="namePrice">'
        grid += '<hr />'
        grid += '<h2>'
        grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
        grid += '</h2>'
        grid += '<span>$' 
        + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
        grid += '</div>'
        grid += '</li>'
      })
      grid += '</ul>'
    } else { 
      grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
  }


/* ****************************************
 * Build the inventory view HTML
 **************************************** */
Util.buildInventoryDetail = async function(data){
  let detail = '<div class="cardetail">'
  detail += '<img src="' + data[0].inv_image + '" alt="Image of ' + data[0].inv_make + ' ' + data[0].v_model + '">'
  detail += '<div class="carinfo">'
  detail += '<p>Year: ' + data[0].inv_year + '</p>'
  detail += '<p>Price: $' + new Intl.NumberFormat('en-US').format(data[0].inv_price) + '</p>'
  detail += '<p>Mileage: ' + new Intl.NumberFormat('en-US').format(data[0].inv_miles) + '</p>'
  detail += '<p><strong>Description: </strong>' + data[0].inv_description + '</p>'
  detail += '</div>'
  detail += '</div>'
  return detail
}


/* ************************
 * Constructs the add inventory
 ************************** */
Util.getClassificationSelects = async function (classification_id) {
  let data = await invModel.getClassifications();
  let list = `<select id="classificationList" name="classification_id" required>`
  list += `<option value="">Choose an option</option>`
  data.rows.forEach((row) => {
    list += `<option value="${row.classification_id}>`
    if (row.classification_id = classification_id){
      list += 'selected'}
    list += `${row.classification_name}</option>`

    })
    
  list +="</select>"
  return list
    
}


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */

Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)


/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
 }


/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

/* ****************************************
 *  Check Account Type  
 * ************************************ */
Util.checkAccountType = (req, res, next) => {
  if (res.locals.accountData) {
    if(res.locals.accountData.account_type == "Employee" || res.locals.accountData.account_type == "Admin") next()
  } else {
    req.flash("problem", "You are not authorized")
    return res.redirect("/")
  }
 }


Util.checkAccountUpdateAccess = (req, res, next) => {
  if (res.locals.accountData) {
    if(res.locals.accountData.account_type == "Employee" || res.locals.accountData.account_type == "Admin"){
      next()
    }else{
      if(res.locals.account_id != res.locals.accountData.account_id){
        req.flash("notice", "You are not authorized to access this page")
    return res.redirect("/")
      }
    }
  } else {
    req.flash("problem", "You are not authorized")
    return res.redirect("/")
  }
 }




module.exports = Util;



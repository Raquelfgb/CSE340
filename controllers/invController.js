const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
try {
  invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("/inv/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}
}
catch(error) {
  console.error(error);
  res.status(500).render("/errors/error", {
    title: 'Error 500 Server Error',
    message: 'Internal Server Error'
  });
}

invCont.buildCarDetailPageById = async function (req, res, next) {
  try {
    const inventoryId = req.params.inventoryId
    const data = await invModel.getInventoryById(inventoryId)
    const grid = await utilities.buildDetaiilsGrid(data)
    let nav = await utilities.getNav()
    const vehicleName = `${data.v_make} ${data.v_model}`;
    res.render("/inv/details", {
      title: vehicleName + " details",
      nav,
      grid,
    })
  }
  catch(error) {
    console.error(error);
    res.status(500).render("/errors/error", {
      title: 'Error 500 Server Error',
      message: 'Internal Server Error'
    });
  }
  
}

invCont.buildManagement  = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationSelect = await utilities.getClassificationSelects(0, true)
  res.render("./inventory/management", {
    title: "Manager Dashboard",
    nav,
    classificationSelect,
    errors: null,
  })
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEdit = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const classificationSelect = await utilities.getClassificationSelects(itemData.classification_id)
  const itemName = `${itemData.v_make} ${itemData.v_model}`
  res.render("/inv/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.v_make,
    inv_model: itemData.v_model,
    inv_year: itemData.v_year,
    inv_description: itemData.v_description,
    inv_image: itemData.v_image,
    inv_thumbnail: itemData.v_thumbnail,
    inv_price: itemData.v_price,
    inv_miles: itemData.v_miles,
    inv_color: itemData.v_color,
    classification_id: itemData.classification_id
  })
}


/* ***************************
 *  Build detail car page
 * ************************** */
invCont.carDetailByInventoryId = async function (req, res, next) {
  const inventory_id = req.params.inventoryId;
  const data = await invModel.getcarDetailByInventoryId(inventory_id);
  const section = await utilities.carDetailSection(data);
  let nav = await utilities.getNav();
  const vehicleYear = data[0].v_year;
  const vehicleMake = data[0].v_make;
  const vehicleModel = data[0].v_model;
  const classificationSelect = await utilities.buildClassificationGrid()

  res.render("/inv/details", {
    title: vehicleYear + " " + vehicleMake + " " + vehicleModel,
    nav,
    section
  });
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    v_make,
    v_model,
    v_description,
    v_image,
    v_thumbnail,
    v_price,
    v_year,
    v_miles,
    v_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    v_make,
    v_model,
    v_description,
    v_image,
    v_thumbnail,
    v_price,
    v_year,
    v_miles,
    v_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.v_make + " " + updateResult.v_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/management")
  } else {
    const classificationSelect = await utilities.buildClassificationGrid(classification_id)
    const itemName = `${v_make} ${v_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("/inv/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    v_make,
    v_model,
    v_year,
    v_description,
    v_image,
    v_thumbnail,
    v_price,
    v_miles,
    v_color,
    classification_id
    })
  }
}
 

/* ***************************
 *  Build delete inventory view
 * ************************** */
invCont.buildDeletion = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const itemName = `${itemData.v_make} ${itemData.v_model}`
  res.render("./inventory/delete", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.v_make,
    inv_model: itemData.v_model,
    inv_year: itemData.v_year,
    inv_price: itemData.v_price
  })
}

/* ***************************
 *  Delete Inventory Data
 * ************************** */
invCont.postDeletion = async function (req, res, next) {
  let nav = await utilities.getNav()
  const inv_id = parseInt(req.body.inv_id)

  const deleteResult = await invModel.deleteInventoryItem(inv_id)

  if (deleteResult) {
    const itemName = deleteResult.v_make + " " + deleteResult.v_model
    req.flash("notice", `The ${itemName} was successfully deleted.`)
    res.redirect("/inv/management")
  } else {
    const itemName = `${v_make} ${v_model}`
    req.flash("notice", "Sorry, the delete failed.")
    res.status(501).render("/inv/delete", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id,
    v_make,
    v_model,
    v_year,
    v_price,
    })
  }
}


/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}


invCont.buildAddClassification  = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("/inv/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
  })
}

invCont.postClassification = async function (req, res) {
  let nav = await utilities.getNav()
  const classification_name = req.body.classification_name

  const regResult = await invModel.addClassification(classification_name)

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, the Classfifcartion ${classification_name} was added.`
    )
    res.status(201).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, an error ocurred.")
    res.status(501).render("/inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
    })
  }
}

invCont.postInventory = async function (req, res) {
  let nav = await utilities.getNav()
  let classificationList = await utilities.getClassificationSelects()
  const inv_make = req.body.v_make 
  const inv_model = req.body.v_model;
  const inv_year = req.body.v_year;
  const inv_description = req.body.v_description;
  const inv_image = req.body.v_image;
  const inv_thumbnail = req.body.v_thumbnail;
  const inv_price = parseFloat(req.body.v_price);
  const inv_miles = parseInt(req.body.v_miles);
  const inv_color = req.body.v_color;
  const classification_id = parseInt(req.body.classification_id);
  const regResult = await invModel.addInventory(v_make, v_model, v_year, v_description, v_image, v_thumbnail,v_price, v_miles,v_color, classification_id)

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, the Inventory ${v_make + " " + v_model} was added.`
    )
    res.status(201).render("/inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, an error ocurred.")
    res.status(501).render("/inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: null,
    })
  }
}

invCont.buildAddInventory  = async function (req, res, next) {
  let nav = await utilities.getNav()
  let classificationList = await utilities.getClassificationSelects()
  res.render("/inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    classificationList,
    errors: null,
  })
}


module.exports = invCont
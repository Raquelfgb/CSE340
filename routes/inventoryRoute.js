// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const validate = require('../utilities/inventory-validation');

// Route to build inventory by classification view


router.post("/update/", invController.updateInventory)



// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build details with the detail view
router.get("/details/:inv_id", utilities.handleErrors(invController.buildByInventoryId));

// Route to build vehicle management view
router.get("/", utilities.handleErrors(invController.buildManagement))


// Route to build add classification view
router.get("/addClassification", utilities.handleErrors(invController.buildAddClassification));
// Process the new classification data
router.post("/addClassification", utilities.handleErrors(invController.addClassification));


// route to get inventory list for management view
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Route to build add vehicle view
router.get("/add-inventory", utilities.handleErrors(invController.buildAddVehicle))
// Process the new vehicle data
router.post("/add-inventory", utilities.handleErrors(invController.addVehicle))



// Update Inventory Information
router.get("/update/:inv_id", utilities.handleErrors(invController.editInventoryView))
router.post("/update/", utilities.handleErrors(invController.updateInventory))


//route to delete inventory item view
router.get("/delete/:inv_id", utilities.handleErrors(invController.buildDeleteView))
router.post("/delete/", utilities.handleErrors(invController.deleteVehicle))

// Router for server error messages
router.get("/error", utilities.handleErrors(invController.buildError));



module.exports = router;
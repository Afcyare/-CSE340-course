const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const invController = require("../controllers/invController");
const invValidate = require("../utilities/inventory-validation");
const auth = require("../utilities/auth-middleware");

// Public routes (no authentication needed)
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildDetailView));

// ALL inventory management routes need Employee/Admin access
router.get("/", auth.checkLogin, auth.checkEmployeeOrAdmin, 
           utilities.handleErrors(invController.buildManagementView));

router.get("/add-classification", auth.checkLogin, auth.checkEmployeeOrAdmin, 
           utilities.handleErrors(invController.buildAddClassification));

router.post("/add-classification", auth.checkLogin, auth.checkEmployeeOrAdmin, 
           invValidate.classificationRules(), invValidate.checkClassificationData, 
           utilities.handleErrors(invController.registerClassification));

router.get("/add-inventory", auth.checkLogin, auth.checkEmployeeOrAdmin, 
           utilities.handleErrors(invController.buildAddInventory));

router.post("/add-inventory", auth.checkLogin, auth.checkEmployeeOrAdmin, 
           invValidate.inventoryRules(), invValidate.checkInventoryData, 
           utilities.handleErrors(invController.registerInventory));

router.get("/edit/:inv_id", auth.checkLogin, auth.checkEmployeeOrAdmin, 
           utilities.handleErrors(invController.editInventoryView));

router.post("/update", auth.checkLogin, auth.checkEmployeeOrAdmin, 
           invValidate.inventoryRules(), invValidate.checkUpdateData, 
           utilities.handleErrors(invController.updateInventory));

router.get("/delete/:inv_id", auth.checkLogin, auth.checkEmployeeOrAdmin, 
           utilities.handleErrors(invController.buildDeleteConfirmation));

router.post("/delete", auth.checkLogin, auth.checkEmployeeOrAdmin, 
           utilities.handleErrors(invController.deleteInventoryItem));

// AJAX route also needs Employee/Admin access
router.get("/getInventory/:classification_id", auth.checkLogin, auth.checkEmployeeOrAdmin, 
           utilities.handleErrors(invController.getInventoryJSON));

module.exports = router;
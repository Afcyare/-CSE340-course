const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

invCont.buildDetailView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);

    const data = await invModel.getVehicleById(inv_id);

    if (!data) {
      return res.status(404).render("errors/error", {
        title: "Not Found",
        message: "Vehicle not found.",
      });
    }

    const nav = await utilities.getNav();

    res.render("./inventory/details", {
      title: `${data.inv_make} ${data.inv_model}`,
      nav,
      vehicle: data,
    });
  } catch (error) {
    next(error);
  }
};

// Intentional 500 error for testing
invCont.throwError = async function (req, res, next) {
  throw new Error("Intentional server error for testing.");
};

/* ****************************************
 * Task 1: Build Management View
 * **************************************** */
invCont.buildManagementView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const message = req.flash("notice");

    const classificationSelect = await utilities.buildClassificationList();

    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      message,
      classificationSelect,
    });
  } catch (error) {
    next(error);
  }
};

/* ****************************************
 * Task 2a: Build Add Classification View
 * **************************************** */
invCont.buildAddClassification = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const message = req.flash("notice");
    res.render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      message,
      errors: null,
      classification_name: "",
    });
  } catch (error) {
    next(error);
  }
};

/* ****************************************
 * Task 2b: Register Classification
 * **************************************** */
invCont.registerClassification = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const { classification_name } = req.body;

    const result = await invModel.addClassification(classification_name);

    if (result.rowCount > 0) {
      req.flash(
        "notice",
        `Classification "${classification_name}" added successfully.`
      );
      res.redirect("/inv/");
    } else {
      req.flash("notice", "Failed to add classification.");
      res.status(501).render("./inventory/add-classification", {
        title: "Add Classification",
        nav,
        message: req.flash("notice"),
        errors: null,
        classification_name,
      });
    }
  } catch (error) {
    next(error);
  }
};

/* ****************************************
 * Task 3a: Build Add Inventory View
 * **************************************** */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    const message = req.flash("notice");

    res.render("./inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      message,
      errors: null,
      classificationList,
      inv_make: "",
      inv_model: "",
      inv_year: "",
      inv_description: "",
      inv_price: "",
      inv_miles: "",
      inv_color: "",
      inv_image: "/images/no-image.png",
      inv_thumbnail: "/images/no-image-tn.png",
    });
  } catch (error) {
    next(error);
  }
};

/* ****************************************
 * Task 3b: Register Inventory
 * **************************************** */
invCont.registerInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const {
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      inv_image,
      inv_thumbnail,
    } = req.body;

    const invImg = inv_image || "/images/no-image.png";
    const invThumb = inv_thumbnail || "/images/no-image-tn.png";

    const result = await invModel.addInventory(
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      invImg,
      invThumb,
      inv_price,
      inv_miles,
      inv_color
    );

    if (result.rowCount > 0) {
      req.flash(
        "notice",
        `Inventory item "${inv_make} ${inv_model}" added successfully.`
      );
      res.redirect("/inv/");
    } else {
      req.flash("notice", "Failed to add inventory item.");
      const classificationList = await utilities.buildClassificationList(
        classification_id
      );
      res.status(501).render("./inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        message: req.flash("notice"),
        errors: null,
        classificationList,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_price,
        inv_miles,
        inv_color,
        inv_image: invImg,
        inv_thumbnail: invThumb,
      });
    }
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  try {
    const classification_id = parseInt(req.params.classification_id);
    console.log("Getting inventory for classification_id:", classification_id); // ADD THIS
    
    const invData = await invModel.getInventoryByClassificationId(classification_id);
    console.log("Data returned from model:", invData); // ADD THIS
    
    if (invData && invData.length > 0) {
      console.log("Sending JSON data with", invData.length, "items"); // ADD THIS
      return res.json(invData);
    } else {
      console.log("No data found, returning empty array"); // ADD THIS
      return res.json([]);
    }
  } catch (error) {
    console.error("Error in getInventoryJSON:", error);
    return res.json([]);
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    let nav = await utilities.getNav();
    const itemData = await invModel.getVehicleById(inv_id); // Use getVehicleById

    if (!itemData) {
      req.flash("notice", "Vehicle not found.");
      return res.redirect("/inv/");
    }

    const classificationSelect = await utilities.buildClassificationList(
      itemData.classification_id
    );
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;

  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  );

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model;
    req.flash("notice", `The ${itemName} was successfully updated.`);
    res.redirect("/inv/");
  } else {
    const classificationSelect = await utilities.buildClassificationList(
      classification_id
    );
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("notice", "Sorry, the update failed.");
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
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
      classification_id,
    });
  }
};

/* ***************************
 *  Build delete confirmation view
 * ************************** */
invCont.buildDeleteConfirmation = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    let nav = await utilities.getNav();
    const itemData = await invModel.getVehicleById(inv_id);

    if (!itemData) {
      req.flash("notice", "Vehicle not found.");
      return res.redirect("/inv/");
    }

    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("./inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Delete Inventory Item
 * ************************** */
invCont.deleteInventoryItem = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.body.inv_id);
    const deleteResult = await invModel.deleteInventoryItem(inv_id);

    if (deleteResult && deleteResult.rowCount > 0) {
      req.flash("notice", "The vehicle was successfully deleted.");
      res.redirect("/inv/");
    } else {
      req.flash("notice", "Sorry, the delete failed.");
      res.redirect(`/inv/delete/${inv_id}`);
    }
  } catch (error) {
    next(error);
  }
};
module.exports = invCont;

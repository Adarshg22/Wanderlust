const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");

//Server-side validator
const listingValidate = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//Index Route
router.get("/", async (req, res) => {
  let allList = await Listing.find({});
  res.render("./listings/index.ejs", { allList });
});

//New Route
router.get("/new", (req, res) => {
  res.render("./listings/new.ejs");
});

//Create Route
router.post(
  "/",
  listingValidate,
  wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listing");
  })
);

//Show Route
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
      req.flash("error", "Listing you requested, Does not exist!");
      res.redirect("/listing");
    }
    res.render("./listings/show.ejs", { listing });
  })
);

//Edit Route
router.get(
  "/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing you requested, Does not exist!");
      res.redirect("/listing");
    }
    re;
    res.render("./listings/edit.ejs", { listing });
  })
);

//Update Route
router.put(
  "/:id",
  listingValidate,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing Updated!");
    res.redirect(`/listing/${id}`);
  })
);

//Destroy Route
router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listing");
  })
);

module.exports = router;

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const Listing = require("./models/listing.js");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

main()
  .then(() => {
    console.log("Connection Successful");
  })
  .catch((err) => {
    console.log(err);
  });

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
app.get("/listing", async (req, res) => {
  let allList = await Listing.find({});
  res.render("./listings/index.ejs", { allList });
});

//New Route
app.get("/listing/new", (req, res) => {
  res.render("./listings/new.ejs");
});

//Create Route
app.post(
  "/listing",
  listingValidate,
  wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listing");
  })
);

//Show Route
app.get(
  "/listing/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("./listings/show.ejs", { listing });
  })
);

//Edit Route
app.get(
  "/listing/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("./listings/edit.ejs", { listing });
  })
);

//Update Route
app.put(
  "/listing/:id",
  listingValidate,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listing/${id}`);
  })
);

//Destroy Route
app.delete(
  "/listing/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listing");
  })
);

//Universal Route
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went Wrong" } = err;
  res.status(statusCode).render("./listings/error.ejs", { message });
});

app.get("/", (req, res) => {
  res.send("Server word properly");
});

app.listen(3000, () => {
  console.log("Port is listening");
});

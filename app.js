// Set a default value for NODE_ENV if it's not set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Load environment variables from .env file
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const express = require("express");
const connectDB = require("./config/db");
const path = require("path");
const morgan = require("morgan");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const flash = require("connect-flash");


// Passport config
require("./config/passport")(passport);

// Connect to database
connectDB();

const app = express();

// Body parser middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Method override for PUT/DELETE requests
app.use(methodOverride("_method"));

// Morgan logging in development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Static folder
app.use(express.static(path.join(__dirname, "public")));

// EJS setup
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("layout", "layouts/main");
app.set("views", path.join(__dirname, "views"));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "pet-pat-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.success_msg = req.session.success_msg;
  res.locals.error_msg = req.session.error_msg;
  res.locals.error = req.flash("error");

  // Clear flash messages after displaying them
  delete req.session.success_msg;
  delete req.session.error_msg;

  next();
});

// Routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));
app.use("/pets", require("./routes/pets"));
app.use("/services", require("./routes/services"));
app.use("/appointments", require("./routes/appointments"));
app.use("/admin", require("./routes/admin"));

// Error handling - 404
app.use((req, res, next) => {
  res.status(404).render("error/404", {
    title: "Page Not Found",
  });
});

// Error handling - 500
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("error/500", {
    title: "Server Error",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

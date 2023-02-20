const express = require("express");
const nunjucks = require("nunjucks");
const createError = require("http-errors");

const app = express();

// app routers
const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");

// nunjucks configuration
nunjucks.configure(["./src/views", "./src/_layouts"], {
  autoescape: true,
  express: app,
});
// view engine setup
app.set("view engine", "njk");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// static assets (main.css)
app.use(express.static(path.join("./", "public")));

// app routes
app.use("/", indexRouter);
app.use("/", authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

module.exports = app;

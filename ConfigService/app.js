require("dotenv").config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');

var app = express();

let categoryRouter = require('./router/Category');
let websiteRouter = require('./router/Website');
let articleConfigRouter = require('./router/ArticleConfiguration');
let linkConfigRouter = require('./router/LinkConfiguration');
const errorHandler = require('./middlewares/errorHandler');

// connect to database
const db = require('./config/connect')
db.connect();

// view engine setup
app.set('views', path.join(__dirname, 'views'));


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/article-config', articleConfigRouter);

app.use('/link-config', linkConfigRouter);

app.use('/category', categoryRouter);
app.use('/website', websiteRouter);

app.use(errorHandler);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.status(404).send('404 not found');
});


module.exports = app;

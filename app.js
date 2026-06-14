var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var productosRouter = require('./routes/productos');
var clientesRouter = require('./routes/clientes');
var proveedorRouter = require('./routes/proveedor');
var loginRouter = require('./routes/login');
var producersRouter = require('./routes/producers');
var ironsRouter = require('./routes/irons');

var app = express();

// Asegurar que las carpetas de subida de imágenes existan al iniciar el servidor
var fs = require('fs');
var uploadsDir = path.join(__dirname, 'uploads');
var tempDir = path.join(uploadsDir, 'temp');
var hierrosDir = path.join(uploadsDir, 'hierros');

[uploadsDir, tempDir, hierrosDir].forEach(function(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/', indexRouter);
app.use('/productos', productosRouter);
app.use('/clientes', clientesRouter);
app.use('/proveedor', proveedorRouter);
app.use('/login', loginRouter);
app.use('/api/producers', producersRouter);
app.use('/api/irons', ironsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

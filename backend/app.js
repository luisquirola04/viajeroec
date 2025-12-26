var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors')
const bodyParser = require('body-parser');

const sequelize = require('./config/config');

//clases
const Pais= require('./models/pais');
const Provincia= require('./models/provincia');
const Parroquia= require('./models/parroquia');
const Canton= require('./models/canton');
const Categoria= require('./models/categoria');
const Lugar= require('./models/lugar');
const Cuenta= require('./models/cuenta');
const MultimediaLugar = require('./models/multimediaLugar');
//relaciones de clases

// País <---- 1:N ----> Provincia
 Pais.hasMany( Provincia, { foreignKey: 'paisId', as: 'Provincias' });
 Provincia.belongsTo( Pais, { foreignKey: 'paisId', as: 'Pais' });

// Provincia <---- 1:N ----> Canton
 Provincia.hasMany( Canton, { foreignKey: 'provinciaId', as: 'Cantones' });
 Canton.belongsTo( Provincia, { foreignKey: 'provinciaId', as: 'Provincia' });

// Canton <---- 1:N ----> Parroquia
 Canton.hasMany( Parroquia, { foreignKey: 'cantonId', as: 'Parroquias' });
 Parroquia.belongsTo( Canton, { foreignKey: 'cantonId', as: 'Canton' });

// --- 2.3. Relaciones de Lugares y Categorías ---

// Parroquia <---- 1:N (0..*) ----> Lugar
 Parroquia.hasMany( Lugar, { foreignKey: 'parroquiaId', as: 'Lugares' });
 Lugar.belongsTo( Parroquia, { foreignKey: 'parroquiaId', as: 'Parroquia' });

// Categoria <---- 1:N (1..*) ----> Lugar
 Categoria.hasMany( Lugar, { foreignKey: 'categoriaId', as: 'Lugares' });
 Lugar.belongsTo( Categoria, { foreignKey: 'categoriaId', as: 'Categoria' });

// Lugar <---- 1:N ----> MultimediaLugar
Lugar.hasMany(MultimediaLugar, {
  foreignKey: 'lugarId',
  as: 'Multimedia'
});

MultimediaLugar.belongsTo(Lugar, {
  foreignKey: 'lugarId',
  as: 'Lugar'
});





var app = express();

sequelize.sync({ alter: true })
    .then(() => {
        console.log('Base de datos sincronizada');
    })
    .catch(error => {
        console.error('Error al sincronizar la base de datos:', error);
    });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(cors())
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
console.log('--- DEBUG PAIS ROUTER ---');
console.log(paisRouter);
console.log('-------------------------');



// routes
var paisRouter = require('./routes/paisRoutes');
var provinciaRouter = require('./routes/provinciaRoutes');
var cantonRouter = require('./routes/cantonRoutes');
var parroquiaRouter  = require('./routes/parroquiaRoutes');
var categoriaRouter  = require('./routes/categoriaRoutes');
var lugarRouter  = require('./routes/lugarRoutes');
var authRouter  = require('./routes/authRoutes');

app.use('/pais', paisRouter);
app.use('/provincia', provinciaRouter);
app.use('/parroquia', parroquiaRouter);
app.use('/lugar', lugarRouter);
app.use('/categoria', categoriaRouter);
app.use('/canton', cantonRouter);
app.use('/auth',authRouter)







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

const port = 5000;
app.listen(port, () => {
    console.log("server is listening on port", port);
});
app.use((req, res, next) => { res.status(404).json({ code: 404, msg: "ERROR", data: 'Ruta no encontrada' }); });

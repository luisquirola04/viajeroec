var express = require("express");
const CategoriaController = require("../controller/categoriaController");
var router = express.Router();

router.get('/get', CategoriaController.getCategoriasActivas);
router.post('/crear', CategoriaController.crearCategoria);




module.exports = router;

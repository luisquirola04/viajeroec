var express = require("express");
const CategoriaController = require("../controller/categoriaController");
var router = express.Router();
const auth = require("../middleware/AuthAdmin");

router.get('/get', CategoriaController.getCategoriasActivas);
router.post('/crear', auth, CategoriaController.crearCategoria);




module.exports = router;

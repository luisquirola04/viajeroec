var express = require("express");
const CategoriaController = require("../controller/categoriaController");
var router = express.Router();
const auth = require("../middleware/AuthAdmin");

router.get('/get', CategoriaController.getCategoriasActivas);
router.post('/crear', auth, CategoriaController.crearCategoria);
router.get('/getHijas/:externalPadre', CategoriaController.getCategoriasActivasHijas);
router.post('/crearHija', auth, CategoriaController.crearCategoriaHija);
router.get('/getCategoria/:externalCategoria',auth, CategoriaController.getCategoria);
router.post('/editar', auth, CategoriaController.editarCategoria);



module.exports = router;

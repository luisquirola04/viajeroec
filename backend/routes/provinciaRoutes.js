var express = require("express");
const ProvinciaController = require("../controller/provinciaController");
var router = express.Router();
const auth = require("../middleware/AuthAdmin");

router.get('/get', ProvinciaController.getProvinciasActivas);
router.post('/crear',auth, ProvinciaController.crearProvincia);
router.get('/getEc', ProvinciaController.listarProvinciaEc);
router.get('/getProvincia', auth,ProvinciaController.getProvincia);
router.post('/editar',auth, ProvinciaController.editarProvincia);


module.exports = router;

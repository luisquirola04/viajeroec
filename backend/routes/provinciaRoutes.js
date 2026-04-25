var express = require("express");
const ProvinciaController = require("../controller/provinciaController");
var router = express.Router();
const auth = require("../middleware/AuthAdmin");

router.get('/get', ProvinciaController.getProvinciasActivas);
router.post('/crear',auth, ProvinciaController.crearProvincia);
router.get('/getEc', ProvinciaController.listarProvinciaEc);
router.get('/getProvincia/:externalProvincia', auth,ProvinciaController.getProvincia);
router.post('/editar',auth, ProvinciaController.editarProvincia);
router.get('/cambiarEstadoProvincia/:externalProvincia', auth,ProvinciaController.cambiarEstadoProvincia);


module.exports = router;

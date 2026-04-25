var express = require("express");
const PaisController = require("../controller/paisController");
var router = express.Router();
const auth = require("../middleware/AuthAdmin");

router.get('/get', PaisController.getPaisesActivos);
router.post('/crear', auth,PaisController.crearPais);
router.get('/getPais/:externalPais', auth, PaisController.getPais);
router.post('/editar', auth,PaisController.editarPais);
router.get('/cambiarEstadoPais/:externalPais', auth, PaisController.cambiarEstadoPais);


module.exports = router;

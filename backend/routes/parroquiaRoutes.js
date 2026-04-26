var express = require("express");
const ParroquiaController = require("../controller/parroquiaController");
var router = express.Router();
const auth = require("../middleware/AuthAdmin");

router.get('/get', ParroquiaController.getParroquiasActivas);
router.post('/crear',auth, ParroquiaController.crearParroquia);
router.get('/get/:externalCanton', ParroquiaController.getParroquiasActivasCanton);

router.get('/getParroquia/:externalParroquia', auth,ParroquiaController.getParroquia);
router.post('/editar',auth, ParroquiaController.editarParroquia);

router.get('/cambiarEstadoParroquia/:externalParroquia', ParroquiaController.cambiarEstadoParroquia);


module.exports = router;

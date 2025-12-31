var express = require("express");
const ParroquiaController = require("../controller/parroquiaController");
var router = express.Router();
const auth = require("../middleware/AuthAdmin");

router.get('/get', ParroquiaController.getParroquiasActivas);
router.post('/crear',auth, ParroquiaController.crearParroquia);
router.get('/get/:externalCanton', ParroquiaController.getParroquiasActivasCanton);




module.exports = router;

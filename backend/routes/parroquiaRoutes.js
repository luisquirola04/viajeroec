var express = require("express");
const ParroquiaController = require("../controller/parroquiaController");
var router = express.Router();

router.get('/get', ParroquiaController.getParroquiasActivas);
router.post('/crear', ParroquiaController.crearParroquia);




module.exports = router;

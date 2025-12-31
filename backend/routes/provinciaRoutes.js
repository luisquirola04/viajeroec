var express = require("express");
const ProvinciaController = require("../controller/provinciaController");
var router = express.Router();
const auth = require("../middleware/AuthAdmin");

router.get('/get', ProvinciaController.getProvinciasActivas);
router.post('/crear',auth, ProvinciaController.crearProvincia);
router.get('/getEc', ProvinciaController.listarProvinciaEc);




module.exports = router;

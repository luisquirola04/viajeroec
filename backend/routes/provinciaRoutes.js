var express = require("express");
const ProvinciaController = require("../controller/provinciaController");
var router = express.Router();

router.get('/get', ProvinciaController.getProvinciasActivas);
router.post('/crear', ProvinciaController.crearProvincia);




module.exports = router;

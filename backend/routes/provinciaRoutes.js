var express = require("express");
const ProvinciaController = require("../controller/provinciaController");
var router = express.Router();
const auth = require("../middleware/AuthAdmin");

router.get('/get', ProvinciaController.getProvinciasActivas);
router.post('/crear',auth, ProvinciaController.crearProvincia);




module.exports = router;

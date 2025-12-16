var express = require("express");
const PaisController = require("../controller/paisController");
var router = express.Router();

router.get('/get', PaisController.getPaisesActivos);
router.post('/crear', PaisController.crearPais);




module.exports = router;

var express = require("express");
const CantonController = require("../controller/cantonController");
var router = express.Router();

router.get('/get', CantonController.getCantonesActivos);
router.post('/crear', CantonController.crearCanton);




module.exports = router;

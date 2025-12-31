var express = require("express");
const CantonController = require("../controller/cantonController");
var router = express.Router();
const auth = require("../middleware/AuthAdmin");

router.get('/get', CantonController.getCantonesActivos);
router.post('/crear', auth,CantonController.crearCanton);
router.get('/get/:externalProvincia', CantonController.getCantonesActivosProvincia);




module.exports = router;

var express = require("express");
const LugarController = require("../controller/lugarController");
var router = express.Router();
const auth = require("../middleware/AuthAdmin");

router.get('/get', LugarController.getLugaresActivos);
router.post('/crear',auth, LugarController.crearLugar);




module.exports = router;

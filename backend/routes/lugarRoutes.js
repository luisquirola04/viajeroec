var express = require("express");
const LugarController = require("../controller/lugarController");
var router = express.Router();

router.get('/get', LugarController.getLugaresActivos);
router.post('/crear', LugarController.crearLugar);




module.exports = router;

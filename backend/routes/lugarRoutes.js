var express = require("express");
const LugarController = require("../controller/lugarController");
var router = express.Router();
const auth = require("../middleware/AuthAdmin");

router.get('/get', LugarController.getLugaresActivos);
router.post('/crear', auth, LugarController.crearLugar);
router.post('/editar', auth, LugarController.editarLugar);
router.get('/get/:externalLugar', LugarController.getLugar);
router.get('/eliminar/:externalLugar', LugarController.eliminarLugar);




module.exports = router;

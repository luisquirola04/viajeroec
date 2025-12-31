var express = require("express");
const LugarController = require("../controller/lugarController");
var router = express.Router();
const auth = require("../middleware/AuthAdmin");

router.get('/get', LugarController.getLugaresActivos);
router.post('/crear', auth, LugarController.crearLugar);
router.post('/editar', auth, LugarController.editarLugar);
router.get('/get/:externalLugar', LugarController.getLugar);
router.get('/eliminar/:externalLugar', LugarController.eliminarLugar);
router.get('/get/:externalCategoria/:externalParroquia', LugarController.listarLugaresParroquiaCategoria);
router.get('/getLugar/:externalLugar', LugarController.listarLugarExternal);




module.exports = router;

var express = require("express");
const PaisController = require("../controller/paisController");
var router = express.Router();
const auth = require("../middleware/AuthAdmin");

router.get('/get', PaisController.getPaisesActivos);
router.post('/crear', auth,PaisController.crearPais);
router.get('/getPais', auth, PaisController.getPais);
router.post('/editar', auth,PaisController.editarPais);


module.exports = router;

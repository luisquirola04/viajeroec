var express = require("express");
const PaisController = require("../controller/paisController");
var router = express.Router();
const Controller = new PaisController();

router.get('/get', (req, res) => Controller.getPaisesActivos(req, res));
router.post('/crear', (req,res)=> Controller.crearPais(req,res));




module.exports = router;

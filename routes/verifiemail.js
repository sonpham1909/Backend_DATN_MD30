const express = require('express');
const sendVerifiController = require('../controller/sendVerifiController');
const router = express.Router();

router.post('/sendVerifiEmail',sendVerifiController.sendVerifiEmail);

router.post('/verifiCode',sendVerifiController.verifiCode);



module.exports =router;
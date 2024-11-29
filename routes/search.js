
const express = require('express');
const middlewareController = require('../controller/middlewareController');
const router = express.Router();
const searchController = require('../controller/SearchController');



router.post('/search', middlewareController.verifyToken, searchController.addSearch);

router.get('/getHistoryUser', middlewareController.verifyToken, searchController.getHistoryUser);

router.delete('/deleteSearch/:id', middlewareController.verifyToken, searchController.deleteSearchTerm);

module.exports = router;
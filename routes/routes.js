const express = require('express')
const controller = require('../controllers/controller')

const  router = express.Router();

//
router.post('/daily',controller.postTransactions);
router.get('/payPeriod/:date?',controller.getTransactionsByPeriod);
router.get('/summary',controller.getSummary);


module.exports =router;
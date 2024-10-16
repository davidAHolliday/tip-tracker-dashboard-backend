const express = require('express')
const controller = require('../controllers/controller')

const  router = express.Router();

//
router.post('/daily',controller.postTransactions);
router.get('/payPeriod/:date?',controller.getTransactionsByPeriod);
router.get('/summary/:date?',controller.getSummary);
router.delete('/daily/:id',controller.deleteTransactionById);




module.exports =router;
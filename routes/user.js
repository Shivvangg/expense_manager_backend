const express = require('express');
const {createUser, loginUser, createExpense, createCategory, getUserDetails, listExpensesByCategory, searchCategoryById, getMonthlyExpenseSum} = require('../controllers/user');
const router = express.Router();

// user routes
router.post('/create/user', createUser);
router.post('/login/user', loginUser);
router.get('/get/user/:_id', getUserDetails);

//expenses
router.post('/add/newExpense', createExpense);
router.post('/expenses/category', listExpensesByCategory);
router.post('/monthly/expense', getMonthlyExpenseSum);

//category
router.post('/add/newCategory', createCategory);
router.get('/get/category/:_id', searchCategoryById);

module.exports = router;
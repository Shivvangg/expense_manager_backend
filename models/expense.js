const mongoose = require('mongoose')

const expenseSchema = new mongoose.Schema({
    date:{
        type:Date,
        required:true,
        default:Date.now(),
    },
    label:{
        type:String,
        required:true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId, // Change this to ObjectId
        ref: 'Category', // Reference the Category model
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    repeatable: {
        type: Boolean,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
})

module.exports = mongoose.model('Expense', expenseSchema);
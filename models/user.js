const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    categories: [{  // Change field name to `categories` and update its type
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    }],
    expenses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Expense',
    }],
});

module.exports = mongoose.model('User', userSchema);

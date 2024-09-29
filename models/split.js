const mongoose = require('mongoose');

const splitSchema = new mongoose.Schema({
    creatorId: {
        type: mongoose.Schema.Types.ObjectId, // User who created the split
        ref: 'User',
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    participants: [{  // Array of users involved in the split
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        splitAmount: {
            type: Number,  // Amount each user owes or contributed
            required: true
        },
        paid: {
            type: Boolean, // If this user has settled their part
            default: false
        }
    }],
    expense: {  // Link the split with expenses
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Expense'
    },
    settled: {
        type: Boolean, // Whether the entire split has been settled
        default: false
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Split', splitSchema);

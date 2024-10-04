const Split = require('../models/split');  
const User = require('../models/user');  // Assuming you have the User model imported

const addSplit = async (req, res) => {
    try {
        const { creatorId, totalAmount, participants } = req.body;

        // Iterate through participants to check if they are existing users or need to be created
        const updatedParticipants = await Promise.all(participants.map(async (participant) => {
            const { phone, splitAmount } = participant;

            // Check if the user with the given phone number already exists
            let user = await User.findOne({ phone });

            if (!user) {
                // If user does not exist, create a new user with the default password
                user = new User({
                    email: `${phone}@example.com`,  // Temporary email as required
                    username: `user_${phone}`,      // Temporary username based on phone
                    phone,
                    password: '123',               // Default password
                });

                // Save the new user to the database
                await user.save();
            }

            // Return the participant information with the user ID
            return {
                user: user._id,       // The ID of the user (either existing or newly created)
                splitAmount,          // Amount the user needs to pay
                paid: false           // Set default paid status
            };
        }));

        // Create a new split with the processed participants
        const newSplit = new Split({
            creatorId,
            totalAmount,
            participants: updatedParticipants
        });

        const savedSplit = await newSplit.save();

        res.status(201).json({
            message: 'Split added successfully',
            split: savedSplit
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error adding split',
            error: error.message
        });
    }
};


const getSplits = async (req, res) => {
    try {
        const { userId } = req.params;
        const splits = userId
            ? await Split.find({ 'participants.user': userId })
            : await Split.find();

        res.status(200).json({
            message: 'Splits fetched successfully',
            split: splits,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching splits',
            error: error.message
        });
    }
};

const deleteSplit = async (req, res) => {
    try {
        const { splitId } = req.params;

        const deletedSplit = await Split.findByIdAndRemove(splitId);
        if (!deletedSplit) {
            return res.status(404).json({
                message: 'Split not found'
            });
        }

        res.status(200).json({
            message: 'Split deleted successfully',
            split: deletedSplit
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting split',
            error: error.message
        });
    }
};

module.exports = {addSplit, getSplits, deleteSplit};

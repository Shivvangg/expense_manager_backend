const Split = require('../models/split');  
// const User = require("../models/user");

const addSplit = async (req, res) => {
    try {
        const { creatorId, totalAmount, participants } = req.body;

        const newSplit = new Split({
            creatorId,
            totalAmount,
            participants
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
            ? await Split.find({ 'participants.user': userId }).populate('creator participants.user')
            : await Split.find().populate('creator participants.user');

        res.status(200).json({
            message: 'Splits fetched successfully',
            splits
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

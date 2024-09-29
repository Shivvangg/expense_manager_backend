const User = require("../models/user");
const expense = require("../models/expense");
const Category = require("../models/category");
const mongoose = require('mongoose');

const createUser = async (req, res) => {
    let { email, username, phone, password, category } = req.body;

    try {
        const newUser = await User.create({
            email,
            username,
            phone,
            password,
        });
        return res.status(201).json({ message: "User Created Successfully", user: newUser });
    } 
    
    catch (error) {
        res.status(400).json({message: `Error creating user ${error.message}`, error});
    }
};

const loginUser = async (req, res) => {
    try{
        const {email, password} = req.body;
        const user = await User.findOne({ email });
        if(!user){
            return res.status(404).json({ message: "User not found"});
        }
        if(password !== user.password){
            return res.status(400).json({ message : "Wrong Password"});
        }

        res.status(200).json({ message : "Logged in successfully", user: user});
    } catch(error){
        return res.status(500).json({message: "Internal Server Error"});
    }
};

const createExpense = async (req, res) => {
    const { date, label, category, amount, repeatable, userId } = req.body;

    try {
        // Create a new expense
        const newExpense = await expense.create({
            userId,
            date,
            label,
            category,
            amount,
            repeatable,
        });

        console.log("1");

        // Find the user and populate their expenses
        const user = await User.findById(userId).populate('expenses');

        console.log("2");

        if (user) {
            // Add the new expense to the user's expenses array
            user.expenses.push(newExpense._id);

            console.log("3");

            // Save the updated user
            await user.save();

            console.log("4");

            // Return the response with populated expenses
            return res.status(201).json({
                message: "Expense Added Successfully",
                expense: newExpense,
                user: user
            });

            console.log("5");
        } else {
            return res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("Error:", error); // Log detailed error
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const createCategory = async (req, res) => {
    const { categoryName, userId } = req.body;
    try {
        // Create a new category
        const newCategory = await Category.create({
            categoryName,
            userId
        });

        // Find the user and populate categories
        const user = await User.findById(userId).populate('categories').exec();
        
        if (user) {
            // Add the new category to the user's categories array
            user.categories.push(newCategory._id);
            await user.save();

            // Re-populate the categories to include the new category
            // await user.populate('categories').execPopulate();

            return res.status(201).json({
                message: "Category Added Successfully",
                category: newCategory,
                user: user
            });
        } else {
            return res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const getUserDetails = async (req,res) => {
    const userId = req.params;
    try {
        console.log("1");
        const user = await User.findById(userId).populate('categories').populate('expenses');
        console.log("2");
        if(user){
            return res.status(200).json({message: "User Data Retrieved",user: user});
        } else {
            return res.status(404).json({ message: "User not found" });
        }
    } catch(error) {
        return res.status(500).json({message: "Internal server error", error: error});
    }
};

const listExpensesByCategory = async (req, res) => {
    const { userId, categoryId } = req.body; // Extract userId and categoryId from request parameters

    try {
        // Validate that userId and categoryId are valid MongoDB ObjectIds
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ message: "Invalid category ID" });
        }

        // Find expenses by category ID and user ID
        const expenses = await expense.find({ 
            category: categoryId, 
            userId: userId 
        });

        // Check if any expenses are found
        if (expenses.length === 0) {
            return res.status(404).json({ message: "No expenses found for this category and user" });
        }

        // Return the list of expenses
        return res.status(200).json({
            message: "Expenses retrieved successfully",
            expenses: expenses
        });
    } catch (error) {
        console.error("Error:", error); // Log the error for debugging
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const searchExpensesByLabel = async (req, res) => {
    const {userId, searchTerm} = req.query;

    try{
        if(!mongoose.Types.ObjectId.isValid(userId)){
            return res.status(400).json({message: "Invalid user ID"});
        }
        if(!searchTerm || searchTerm.trim() === "") {
            return res.status(400).json({message: "Enter the label to search"});
        }

        const expenses = await expense.find({
            userId: userId,
            label: { $regex: searchTerm, $options: 'i'}
        });

        if(expenses.length === 0){
            return res.status(404).json({message: "No such expenses found"});
        }

        return res.status(200).json({
            message: "Expense retrieved successfully",
            expenses: expenses
        })
    } catch(error) {
        return res.status(500).json({message: "Internal Server Error", error: error});
    }
};

const searchCategoryById = async (req, res) => {
    const categoryId = req.params;
    try{
        console.log("1");
        const category = await Category.findById(categoryId);
        console.log(category);
        if(!category){
            return res.status(404).json({message: "category not found"});
        }else{
            // const categoryName = category.categoryName;
            res.status(200).json({message: "Category Found", category: category});
        }
    } catch(error){
        return res.status(500).json({message: "Internal Server Error", error: error});
    }
};

const getMonthlyExpenseSum = async (req, res) => {
    const userId = req.body.userId; // Get userId from request body

    if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    try {
        // Get the current date and calculate the start date for six months ago
        const now = new Date();
        const startDate = new Date(now.setMonth(now.getMonth() - 6));

        // Convert userId to ObjectId
        const objectId = new mongoose.Types.ObjectId(userId);

        // Query the expenses for the past six months for the specified user
        const expenses = await expense.aggregate([
            {
                $match: {
                    userId: objectId, // Use the converted ObjectId
                    date: { $gte: startDate }
                }
            },
            {
                $project: {
                    month: { $month: "$date" },
                    year: { $year: "$date" },
                    amount: 1
                }
            },
            {
                $group: {
                    _id: { year: "$year", month: "$month" },
                    totalAmount: { $sum: "$amount" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        // Format the results
        const monthlySums = expenses.map(expense => ({
            month: `${expense._id.year}-${String(expense._id.month).padStart(2, '0')}`,
            totalAmount: expense.totalAmount
        }));

        // Send response
        res.status(200).json(monthlySums);
    } catch (error) {
        console.error('Error calculating monthly expense sums:', error);
        res.status(500).json({ error: 'Could not calculate monthly expense sums' });
    }
};




module.exports = {createUser, loginUser, createExpense, createCategory, getUserDetails, listExpensesByCategory, searchExpensesByLabel, searchCategoryById, getMonthlyExpenseSum};
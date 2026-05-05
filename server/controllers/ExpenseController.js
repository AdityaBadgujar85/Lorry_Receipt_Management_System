const expense = require("../models/ExpenseModel")

exports.getAllExpenses = async(req,res)=>{
    try{
        const allExpense = await expense.find()
        res.status(200).json({
            success: true,
            data: allExpense,
        })
    }catch(error){
        res.status(400).json({
            success:false,
            msg: "No Expense Found",
        })
    }
}

exports.getExpense = async(req,res) => {
   try{
    const {id} = req.params
    const oneExpense = await expense.findById(id);
    res.status(200).json({
        success: true,
        data: oneExpense
    })
   }catch(error){
    res.status(400).json({
        success:false,
        msg: "No Expense Found"
    })
   }

}   

exports.createExpense = async (req, res) => {
  try {
    const { date, description, amount } = req.body;

    const newExpense = await expense.create({
      date,
      description,
      amount,
      uploadReceipt: req.file ? req.file.filename : "",
    });

    res.status(200).json({
      success: true,
      data: newExpense,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      msg: "error while adding new expense",
    });
  }
};

const fs = require("fs");
const path = require("path");

exports.editExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const existingExpense = await expense.findById(id);

    if (!existingExpense) {
      return res.status(404).json({
        success: false,
        msg: "Expense not found",
      });
    }

    // If new file uploaded → delete old file
    if (req.file && existingExpense.uploadReceipt) {
      const oldPath = path.join(
        __dirname,
        "../uploads/expenses",
        existingExpense.uploadReceipt
      );

      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const updatedData = {
      ...req.body,
      ...(req.file && { uploadReceipt: req.file.filename }),
    };

    const updatedExpense = await expense.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedExpense,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      msg: "Error occurred while editing",
    });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const existingExpense = await expense.findById(id);

    if (existingExpense?.uploadReceipt) {
      const filePath = path.join(
        __dirname,
        "../uploads/expenses",
        existingExpense.uploadReceipt
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await expense.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      msg: "deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      msg: "error occurred",
    });
  }
};
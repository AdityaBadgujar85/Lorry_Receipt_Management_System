const express = require("express");
const router = express.Router();

const {
  getAllExpenses,
  getExpense,
  createExpense,
  editExpense,
  deleteExpense
} = require("../controllers/ExpenseController");

const expenseUpload = require("../middleware/expenseUpload");

// GET
router.get("/", getAllExpenses);
router.get("/:id", getExpense);

// POST (ADD FILE SUPPORT)
router.post("/", expenseUpload.single("receipt"), createExpense);

// PUT (EDIT WITH FILE SUPPORT)
router.put("/:id", expenseUpload.single("receipt"), editExpense);

// DELETE
router.delete("/:id", deleteExpense);

module.exports = router;
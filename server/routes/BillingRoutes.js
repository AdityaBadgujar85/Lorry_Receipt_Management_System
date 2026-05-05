const express = require("express");
const { 
    getAllbillData, 
    getEachBillData, 
    createNewBill, 
    deletebill, 
    updateBills 
} = require("../controllers/BillingController");

const router = express.Router();

/**
 * @route   GET /billing
 * @desc    Fetch all bills (Sorted by latest)
 */
router.get("/", getAllbillData);

/**
 * @route   GET /billing/:id
 * @desc    Fetch a specific bill by its MongoDB ID
 */
router.get("/:id", getEachBillData);

/**
 * @route   POST /billing
 * @desc    Create a new bill. 
 * @body    { tripIds: [], billingID: string, date: date, partyName: string }
 */
router.post("/", createNewBill);

/**
 * @route   PUT /billing/:id
 * @desc    Update an existing bill (Updates tripList snapshots and grandTotal)
 */
router.put("/:id", updateBills);

/**
 * @route   DELETE /billing/:id
 * @desc    Delete a bill and reset associated trips to "NOT_BILLED"
 */
router.delete("/:id", deletebill);

module.exports = router;
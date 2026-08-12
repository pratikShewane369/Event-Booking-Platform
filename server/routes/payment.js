const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/auth");

const {
  createCheckoutSession,
  confirmPayment,
  failPayment,
} = require("../controllers/paymentController");

// @route   POST /api/payments/create-checkout-session
// @desc    Start a Stripe Checkout session for a booking
// @access  Private
router.post("/create-checkout-session", protect, createCheckoutSession);

// @route   GET /api/payments/confirm
// @desc    Verify a Stripe session and mark booking as paid/confirmed
// @access  Private
router.get("/confirm", protect, confirmPayment);

// @route   GET /api/payments/fail
// @desc    Mark a booking's payment as failed
// @access  Private
router.get("/fail", protect, failPayment);

module.exports = router;
const dotenv = require("dotenv");
dotenv.config(); // Config loaded first before Stripe instantiates

const Stripe = require("stripe");
const Booking = require("../models/Booking");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Create a Stripe Checkout session for a booking
// @route   POST /api/payments/create-checkout-session
// @access  Private
exports.createCheckoutSession = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: "bookingId is required" });
    }

    const booking = await Booking.findById(bookingId).populate("eventId");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (!booking.eventId) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Fallback URL if CLIENT_URL is undefined
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    // NOTE: assumes booking.amount is stored in rupees (matches the ₹ shown
    // on the dashboard). Stripe requires the amount in the smallest currency
    // unit (paise for INR), so we multiply by 100 here.
    // If booking.amount is ALREADY in paise in your DB, remove the "* 100".
    const unitAmountPaise = Math.round(booking.amount * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: booking.eventId.title,
              description: booking.eventId.description || "Event Ticket",
            },
            unit_amount: unitAmountPaise,
          },
          quantity: 1,
        },
      ],
      // {CHECKOUT_SESSION_ID} is filled in by Stripe itself on redirect.
      // We use this to verify the payment server-side instead of trusting
      // the redirect blindly.
      success_url: `${clientUrl}/payments-success?session_id={CHECKOUT_SESSION_ID}&bookingId=${bookingId}`,
      cancel_url: `${clientUrl}/payments-failed?bookingId=${bookingId}`,
    });

    res.json({
      url: session.url,
    });
  } catch (err) {
    console.error("Stripe Checkout Error:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

// @desc    Verify a completed Stripe Checkout session and mark booking paid
// @route   GET /api/payments/confirm?session_id=...&bookingId=...
// @access  Private
exports.confirmPayment = async (req, res) => {
  try {
    const { session_id, bookingId } = req.query;

    if (!session_id || !bookingId) {
      return res
        .status(400)
        .json({ message: "session_id and bookingId are required" });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Ask Stripe directly whether this session actually completed payment.
    // Never trust a redirect alone — this is what stops someone from
    // hand-crafting a "success" URL to mark a booking paid for free.
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      booking.paymentStatus = "failed";
      await booking.save();
      return res
        .status(400)
        .json({ message: "Payment not completed", booking });
    }

    booking.paymentStatus = "paid";
    booking.status = "confirmed";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Payment verified and booking confirmed",
      booking,
    });
  } catch (err) {
    console.error("Error confirming payment:", err);
    res.status(500).json({ message: "Server error confirming payment" });
  }
};

// @desc    Mark a booking's payment as failed/cancelled
// @route   GET /api/payments/fail?bookingId=...
// @access  Private
exports.failPayment = async (req, res) => {
  try {
    const { bookingId } = req.query;

    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (booking) {
        booking.paymentStatus = "failed";
        await booking.save();
      }
    }

    res.status(200).json({ success: true, message: "Payment marked as failed" });
  } catch (err) {
    console.error("Error handling payment failure:", err);
    res.status(500).json({ message: "Server error processing payment failure" });
  }
};
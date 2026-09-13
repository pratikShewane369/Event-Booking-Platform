const dotenv = require("dotenv");
dotenv.config(); // Config loaded first before Stripe instantiates

const Stripe = require("stripe");
const Booking = require("../models/Booking");
const Event = require("../models/Event");
const { sendBookingConfirmationEmail  } = require("../utils/email"); // adjust to your actual export name
const { redisClient } = require("../config/redisClient");

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

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

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

    const booking = await Booking.findById(bookingId)
      .populate("eventId")
      .populate("userId");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      booking.paymentStatus = "failed";
      await booking.save();
      return res
        .status(400)
        .json({ message: "Payment not completed", booking });
    }

    // Avoid double-processing if this endpoint is hit twice for the same session
    // (e.g. user refreshes the success page)
    if (booking.status === "confirmed" && booking.paymentStatus === "paid") {
      return res.status(200).json({
        success: true,
        message: "Payment already confirmed",
        booking,
      });
    }

    const event = await Event.findById(booking.eventId._id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.availableSeats <= 0) {
      booking.paymentStatus = "failed";
      await booking.save();
      return res.status(400).json({
        message: "No seats available, payment cannot be confirmed",
        booking,
      });
    }

    booking.paymentStatus = "paid";
    booking.status = "confirmed";
    await booking.save();

    event.availableSeats -= 1;
    await event.save();

    try {
      await sendBookingConfirmationEmail(
        booking.userId.email,
        booking.eventId.title,
        booking._id
      );
    } catch (emailErr) {
      // Don't fail the whole request just because the email failed —
      // the booking is already correctly confirmed and paid at this point
      console.error("Failed to send booking confirmation email:", emailErr);
    }

    try {
      await redisClient.del(`booking:${bookingId}`);
    } catch (cacheErr) {
      console.error("Cache invalidation failed:", cacheErr);
    }

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

        try {
          await redisClient.del(`booking:${bookingId}`);
        } catch (cacheErr) {
          console.error("Cache invalidation failed:", cacheErr);
        }
      }
    }

    res.status(200).json({ success: true, message: "Payment marked as failed" });
  } catch (err) {
    console.error("Error handling payment failure:", err);
    res.status(500).json({ message: "Server error processing payment failure" });
  }
};
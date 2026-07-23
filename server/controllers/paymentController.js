const Stripe = require("stripe");
const Booking = require("../models/Booking");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate("eventId");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (!booking.eventId) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "inr",

            product_data: {
              name: booking.eventId.title,

              description: booking.eventId.description,
            },

            unit_amount: booking.amount * 100,
          },

          quantity: 1,
        },
      ],

      success_url: "http://localhost:3000/payment-success",

      cancel_url: "http://localhost:3000/payment-failed",
    });

    res.json({

    url: session.url

     });
     
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};


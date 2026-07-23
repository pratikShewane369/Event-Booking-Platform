const Booking = require("../models/Booking.js");
const OTP = require("../models/OTP");
const Event = require("../models/Event");
const {sendOTPEmail, sendBookingEmail, sendPaymentEmail} = require("../utils/email");

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.sendBookingOtp = async(req, res) => {
    const otp = generateOtp();
    await OTP.findOneAndDelete({email : req.user.email, action : 'event_booking'});
    await OTP.create({email : req.user.email, otp : otp, action : 'event_booking'});
    await sendOTPEmail(req.user.email, otp, 'event_booking');
    res.json({message : 'OTP send to email'});
}

exports.bookEvent = async(req, res) => {
    try {

    const {eventId, otp} = req.body;
        
    const otpRecord = await OTP.findOne({email : req.user.email, otp, action : 'event_booking'});
    if(!otpRecord) {
        return res.status(400).json({error : 'Invalid or expired OTP'});
    }
    const event = await Event.findById(eventId);
    if(!event) {
        return res.status(404).json({message : 'Event not found'});
    }
    if(event.availableSeats <= 0) {
        return res.status(400).json({ error : 'Seats not available'});
    }
    const existingBooking = await Booking.findOne({userId : req.user._id, eventId});
    if(existingBooking) {
        return res.status(400).json({ message : 'Already booked Event'});
    }

    const booking = await Booking.create({
        userId : req.user._id,
        status : 'pending',
        paymentStatus : 'not_paid',
        eventId,
        amount : event.ticketPrice
    });

    await OTP.deleteMany({email : req.user.email, action : 'event_booking'});
    res.status(201).json({ message: 'Booking request submitted', booking });
    } catch (err) {
        res.status(500).json({
            error : err.message
        })
    }

    
}

// exports.confirmBooking = async (req, res) => {
//     const paymentStatus = req.body.paymentStatus;
//     if(!['paid', 'not_paid'].includes(paymentStatus)) {
//         return res.status(400).json({error : 'Invalid Payment Status'});
//     }

//     const booking = await Booking.findById(req.params.id).populate('eventId');
//     if(!booking) {
//         return res.status(404).json({message : 'Booking not found'});
//     }
//     if(booking.status === 'confirmed') {
//         return res.status(400).json({error : 'Booking is Already Confirmed'});
//     }

//     const event = await Event.findById(booking.eventId._id);
//     if(event.availableSeats <= 0) {
//         return res.status(400).json({error : 'No seats available'});
//     }

//     booking.status = 'confirmed';
//     if(paymentStatus) {
//         booking.paymentStatus = paymentStatus;
//     }
//     await booking.save();
//     event.availableSeats -= 1;
//     await event.save();

//     // admin confirmed booking, send email to user
//     await sendBookingEmail(req.user.email, event.title, booking._id);

//     res.json({message : 'Booking Confirmed'});
// }

exports.confirmBooking = async (req, res) => {
    try {

        const paymentStatus = req.body.paymentStatus;

        if (!["paid", "not_paid"].includes(paymentStatus)) {
            return res.status(400).json({
                error: "Invalid Payment Status"
            });
        }

        const booking = await Booking.findById(req.params.id)
            .populate("eventId")
            .populate("userId");

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        if (
            booking.status === "confirmed" ||
            booking.status === "payment_pending"
        ) {
            return res.status(400).json({
                error: "Booking already processed"
            });
        }

        const event = await Event.findById(booking.eventId._id);

        // console.log("Booking User:", booking.userId);
        // console.log("User Email:", booking.userId?.email);
        if (!event) {
            return res.status(404).json({
                error: "Event not found"
            });
        }

        if (event.availableSeats <= 0) {
            return res.status(400).json({
                error: "No seats available"
            });
        }

        // FREE EVENT
        if (Number(event.ticketPrice) === 0) {

            booking.status = "confirmed";
            booking.paymentStatus = "paid";

            await booking.save();

            event.availableSeats -= 1;
            await event.save();

            await sendBookingEmail(
                booking.userId.email,
                event.title,
                booking._id
            );

            return res.json({
                message: "Free booking confirmed."
            });

        }

        // PAID EVENT

        booking.status = "payment_pending";

        booking.paymentStatus = "not_paid";

        await booking.save();

        await sendPaymentEmail(
          booking.userId.email,
          event.title,
          booking._id
         );

        console.log("Payment email would be sent here.");
        res.json({
           message: "Payment email sent successfully."
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
        error: err.message,
        stack: err.stack
       });

    }
};

exports.getMyBookings = async(req, res) => {
    const bookings = await Booking.find({userId : req.user._id}).populate('eventId');
    res.json(bookings);
}

exports.getAllBookings = async (req, res) => {
    try {

        const bookings = await Booking.find()
            .populate("userId", "name email")
            .populate("eventId");

        res.json(bookings);

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (booking.status === 'cancelled') return res.status(400).json({ message: 'Already cancelled' });

        const wasConfirmed = booking.status === 'confirmed';

        booking.status = 'cancelled';
        await booking.save();

        // Only restore the seat if it was actually confirmed and deducted
        if (wasConfirmed) {
            const event = await Event.findById(booking.eventId);
            if (event) {
                event.availableSeats += 1;
                await event.save();
            }
        }

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

// Verify transporter once when the server starts
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Mail transporter error:", error);
    } else {
        console.log("✅ Mail server is ready");
    }
});

exports.sendOTPEmail = async (email, otp, type) => {
    const title =
        type === "account_verification"
            ? "Verify Your Event Spark Account"
            : "Verify for Event Registration";

    const msg =
        type === "account_verification"
            ? "Please use the following OTP to verify your new Event Spark Account."
            : "Please use the following OTP to verify and confirm your event booking.";

    const mailOptions = {
        from: process.env.MAIL_USER,
        to: email,
        subject: "Your OTP Code",
        html: `
        <div style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
            <div style="max-width:500px; margin:auto; background:#fff; padding:20px; border-radius:8px; text-align:center;">
                <h2>${title}</h2>

                <p>${msg}</p>

                <h1 style="letter-spacing:4px; color:#2563eb;">
                    ${otp}
                </h1>

                <p>This OTP is valid for a limited time.</p>

                <hr>

                <small>If you didn't request this email, please ignore it.</small>
            </div>
        </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);

        console.log("✅ OTP Email Sent");
        console.log("Message ID:", info.messageId);

        return info;
    } catch (error) {
        console.error("❌ Failed to send OTP Email");
        console.error(error);
        throw error;
    }
};

exports.sendBookingEmail = async (userEmail, otp, eventType) => {
    const mailOptions = {
        from: process.env.MAIL_USER,
        to: userEmail,
        subject: `Booking Confirmed: ${eventType}`,
        html: `
        <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
            <div style="max-width:500px; margin:auto; background:#fff; padding:25px; border-radius:10px; text-align:center;">

                <h2>Booking Confirmation</h2>

                <p>Your booking for <strong>${eventType}</strong> has been initiated.</p>

                <p>Please use this OTP to confirm your booking:</p>

                <h1 style="letter-spacing:4px; color:green;">
                    ${otp}
                </h1>

                <hr>

                <small>This OTP is valid for a limited time.</small>

            </div>
        </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);

        console.log("✅ Booking Email Sent");
        console.log("Message ID:", info.messageId);

        return info;
    } catch (error) {
        console.error("❌ Failed to send Booking Email");
        console.error(error);
        throw error;
    }
};

exports.sendPaymentEmail = async (
    email,
    eventTitle,
    bookingId
) => {

    const paymentLink = `https://eventora-frontend-murex.vercel.app/payment/${bookingId}`;

    const mailOptions = {
        from: process.env.MAIL_USER,
        to: email,
        subject: "Payment Required for Event Booking",
        html: `
            <h2>Your booking has been approved 🎉</h2>

            <p>
                Your request for <strong>${eventTitle}</strong> has been approved.
            </p>

            <p>
                Complete your payment by clicking the button below.
            </p>

            <a
                href="${paymentLink}"
                style="
                    display:inline-block;
                    padding:12px 24px;
                    background:#16a34a;
                    color:white;
                    text-decoration:none;
                    border-radius:8px;
                    font-weight:bold;
                "
            >
                Pay Now
            </a>

            <p>If you do not complete the payment, your booking will remain pending.</p>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);

        console.log("✅ Payment Email Sent");
        console.log("Message ID:", info.messageId);

        return info;
    } catch (error) {
        console.error("❌ Failed to send Payment Email");
        console.error(error);
        throw error;
    }
};
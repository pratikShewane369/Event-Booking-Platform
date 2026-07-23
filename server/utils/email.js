const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
    service : 'gmail',
    auth : {
        user : process.env.MAIL_USER,
        pass : process.env.MAIL_PASS
    },
});

exports.sendOTPEmail = async (email, otp, type) => {
  try {
    const title = type === 'account_verification' ? 'Verify Your Event Spark Account' : 'Verify for Event Registration';
    const msg = type === 'account_verification' ? 'Please use the following otp to verify your new Event Spark Account' : 'Please use the following otp to verify and confirm your event booking';

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 20px; border-radius: 8px; text-align: center;">
            
            <h2 style="color: #333;">${title}</h2>
            
            <p style="font-size: 16px; color: #555;">
              ${msg}
            </p>
            
            <div style="font-size: 28px; font-weight: bold; color: #2c3e50; margin: 20px 0;">
              ${otp}
            </div>
            
            <p style="font-size: 14px; color: #888;">
              This OTP is valid for a limited time. Do not share it with anyone.
            </p>

            <hr style="margin: 20px 0;" />

            <p style="font-size: 12px; color: #aaa;">
              If you didn’t request this, you can safely ignore this email.
            </p>

          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email} of type ${type}`);
  } catch (error) {
    console.log(`Error sending email to ${email} of type ${type}`, error);
  }
};

exports.sendBookingEmail = async (userEmail, otp, eventType) => {
  try {
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: userEmail,
      subject: `Booking Confirmed: ${eventType}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
          <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 25px; border-radius: 10px; text-align: center;">
            
            <h2 style="color: #2c3e50;">Booking Confirmation</h2>
            
            <p style="font-size: 16px; color: #555;">
              Your booking for <strong>${eventType}</strong> has been successfully initiated.
            </p>

            <p style="font-size: 16px; color: #555;">
              Please use the OTP below to confirm your booking:
            </p>

            <div style="font-size: 30px; font-weight: bold; color: #27ae60; margin: 20px 0; letter-spacing: 2px;">
              ${otp}
            </div>

            <p style="font-size: 14px; color: #888;">
              This OTP is valid for a limited time. Do not share it with anyone.
            </p>

            <hr style="margin: 20px 0;" />

            <p style="font-size: 12px; color: #aaa;">
              If you did not request this booking, please ignore this email.
            </p>

          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${userEmail} for event ${eventType}`);
  } catch (error) {
    console.log(`Error sending email to ${userEmail} for event ${eventType}`, error);
  }
};

exports.sendPaymentEmail = async (
    email,
    eventTitle,
    bookingId
) => {

    const paymentLink =
        `http://localhost:3000/payment/${bookingId}`;

    await transporter.sendMail({

        from: process.env.EMAIL_USER,

        to: email,

        subject: "Payment Required for Event Booking",

        html: `
            <h2>Your booking has been approved 🎉</h2>

            <p>
                Your request for
                <strong>${eventTitle}</strong>
                has been approved by the administrator.
            </p>

            <p>
                Please complete your payment by clicking the
                button below.
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

            <p>
                If you do not complete payment,
                your booking will remain pending.
            </p>
        `
    });

};
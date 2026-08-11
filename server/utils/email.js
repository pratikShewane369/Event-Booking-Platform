const dotenv = require("dotenv");
dotenv.config();

const SibApiV3Sdk = require("sib-api-v3-sdk");


// ======================================================
// BREVO CONFIGURATION
// ======================================================

const defaultClient = SibApiV3Sdk.ApiClient.instance;

const apiKey = defaultClient.authentications["api-key"];

apiKey.apiKey = process.env.BREVO_API_KEY;


// ======================================================
// BREVO TRANSACTIONAL EMAIL API
// ======================================================

const transactionalEmailApi =
    new SibApiV3Sdk.TransactionalEmailsApi();


// ======================================================
// ENVIRONMENT CHECK
// ======================================================

if (!process.env.BREVO_API_KEY) {

    console.error(
        "❌ BREVO_API_KEY is missing"
    );

} else {

    console.log(
        "✅ BREVO_API_KEY loaded"
    );
}


if (!process.env.MAIL_FROM) {

    console.error(
        "❌ MAIL_FROM is missing"
    );

} else {

    console.log(
        "✅ MAIL_FROM:",
        process.env.MAIL_FROM
    );
}


const FROM_EMAIL =
    process.env.MAIL_FROM;

const FROM_NAME =
    process.env.MAIL_FROM_NAME ||
    "Event Spark";


// ======================================================
// COMMON SEND EMAIL FUNCTION
// ======================================================

async function sendBrevoEmail({
    to,
    subject,
    html
}) {

    try {

        if (!process.env.BREVO_API_KEY) {

            throw new Error(
                "BREVO_API_KEY is not configured"
            );

        }


        if (!FROM_EMAIL) {

            throw new Error(
                "MAIL_FROM is not configured"
            );

        }


        if (!to) {

            throw new Error(
                "Recipient email is required"
            );

        }


        // console.log("\n======================================");
        // console.log("📧 Sending Email");
        // console.log("======================================");

        // console.log("To:", to);
        // console.log("From:", FROM_EMAIL);
        // console.log("Subject:", subject);


        // ==========================================
        // CREATE TRANSACTIONAL EMAIL
        // ==========================================

        const sendSmtpEmail =
            new SibApiV3Sdk.SendSmtpEmail();


        // ==========================================
        // SENDER
        // ==========================================

        sendSmtpEmail.sender = {

            name: FROM_NAME,

            email: FROM_EMAIL

        };


        // ==========================================
        // RECIPIENT
        // ==========================================

        sendSmtpEmail.to = [

            {
                email: to
            }

        ];


        // ==========================================
        // SUBJECT
        // ==========================================

        sendSmtpEmail.subject =
            subject;


        // ==========================================
        // HTML CONTENT
        // ==========================================

        sendSmtpEmail.htmlContent =
            html;


        // ==========================================
        // SEND EMAIL
        // ==========================================

        const response =
            await transactionalEmailApi.sendTransacEmail(
                sendSmtpEmail
            );


        // ==========================================
        // SUCCESS
        // ==========================================

        console.log(
            "✅ Email accepted by Brevo"
        );

        console.log(
            "📨 Message ID:",
            response.messageId
        );

        console.log(
            "======================================\n"
        );


        return response;


    } catch (error) {

        console.error(
            "\n❌ BREVO EMAIL ERROR"
        );


        // SDK error response
        if (error.response) {

            console.error(
                "Status:",
                error.response.status
            );

            console.error(
                "Body:",
                error.response.body
            );

        }


        console.error(
            "Message:",
            error.message
        );


        console.error(
            "======================================\n"
        );


        throw error;

    }

}



// ======================================================
// SEND OTP EMAIL
// ======================================================

exports.sendOTPEmail = async (
    email,
    otp,
    type
) => {


    const isAccountVerification =
        type === "account_verification";


    const title =
        isAccountVerification

            ? "Verify Your Event Spark Account"

            : "Verify Your Event Registration";


    const message =
        isAccountVerification

            ? "Please use the following OTP to verify your Event Spark account."

            : "Please use the following OTP to verify and confirm your event booking.";


    const html = `

<!DOCTYPE html>

<html>

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>
        Event Spark OTP
    </title>

</head>


<body
    style="
        margin:0;
        padding:0;
        background:#f4f4f4;
        font-family:Arial,sans-serif;
    "
>


<div
    style="
        padding:30px 15px;
    "
>


<div
    style="
        max-width:500px;
        margin:auto;
        background:#ffffff;
        padding:30px;
        border-radius:10px;
        text-align:center;
    "
>


<h2 style="color:#222;">

    ${title}

</h2>


<p
    style="
        color:#555;
        font-size:16px;
        line-height:1.6;
    "
>

    ${message}

</p>


<div
    style="
        margin:25px 0;
        padding:20px;
        background:#f3f4f6;
        border-radius:8px;
    "
>


<h1
    style="
        letter-spacing:8px;
        color:#2563eb;
        margin:0;
        font-size:32px;
    "
>

    ${otp}

</h1>


</div>


<p style="color:#666;">

    This OTP is valid for a limited time.

</p>


<hr
    style="
        border:none;
        border-top:1px solid #eee;
        margin:25px 0;
    "
>


<small style="color:#888;">

    If you didn't request this email,
    please ignore it.

</small>


<p>

    <strong>
        Event Spark Team
    </strong>

</p>


</div>


</div>


</body>

</html>

`;


    return await sendBrevoEmail({

        to: email,

        subject:
            "Your Event Spark OTP Code",

        html: html

    });

};



// ======================================================
// SEND BOOKING OTP EMAIL
// ======================================================

exports.sendBookingEmail = async (
    userEmail,
    otp,
    eventType
) => {


    const html = `

<!DOCTYPE html>

<html>

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>
        Booking Confirmation
    </title>

</head>


<body
    style="
        margin:0;
        padding:0;
        background:#f4f4f4;
        font-family:Arial,sans-serif;
    "
>


<div
    style="
        padding:30px 15px;
    "
>


<div
    style="
        max-width:500px;
        margin:auto;
        background:#ffffff;
        padding:30px;
        border-radius:10px;
        text-align:center;
    "
>


<h2>

    Booking Confirmation

</h2>


<p
    style="
        color:#555;
        font-size:16px;
        line-height:1.6;
    "
>

    Your booking for

    <strong>
        ${eventType}
    </strong>

    has been initiated.

</p>


<p style="color:#555;">

    Please use the following OTP
    to confirm your booking.

</p>


<div
    style="
        margin:25px 0;
        padding:20px;
        background:#f3f4f6;
        border-radius:8px;
    "
>


<h1
    style="
        letter-spacing:8px;
        color:#16a34a;
        margin:0;
        font-size:32px;
    "
>

    ${otp}

</h1>


</div>


<p style="color:#666;">

    This OTP is valid for a limited time.

</p>


<hr
    style="
        border:none;
        border-top:1px solid #eee;
        margin:25px 0;
    "
>


<small style="color:#888;">

    If you did not initiate this booking,
    please ignore this email.

</small>


<p>

    <strong>
        Event Spark Team
    </strong>

</p>


</div>


</div>


</body>

</html>

`;


    return await sendBrevoEmail({

        to: userEmail,

        subject:
            `Booking Confirmation: ${eventType}`,

        html: html

    });

};



// ======================================================
// SEND PAYMENT EMAIL
// ======================================================

exports.sendPaymentEmail = async (
    email,
    eventTitle,
    bookingId
) => {


    const paymentLink =
        `https://eventora-frontend-murex.vercel.app/payment/${bookingId}`;


    const html = `

<!DOCTYPE html>

<html>

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>
        Payment Required
    </title>

</head>


<body
    style="
        margin:0;
        padding:0;
        background:#f4f4f4;
        font-family:Arial,sans-serif;
    "
>


<div
    style="
        padding:30px 15px;
    "
>


<div
    style="
        max-width:550px;
        margin:auto;
        background:#ffffff;
        padding:30px;
        border-radius:10px;
        text-align:center;
    "
>


<h2>

    Your Booking Has Been Approved 🎉

</h2>


<p
    style="
        color:#555;
        font-size:16px;
        line-height:1.6;
    "
>

    Your request for

    <strong>
        ${eventTitle}
    </strong>

    has been approved.

</p>


<p style="color:#555;">

    Please complete your payment
    using the button below.

</p>


<div style="margin:30px 0;">


<a
    href="${paymentLink}"
    style="
        display:inline-block;
        padding:14px 28px;
        background:#16a34a;
        color:#ffffff;
        text-decoration:none;
        border-radius:8px;
        font-weight:bold;
    "
>

    Pay Now

</a>


</div>


<p style="color:#666;">

    If you do not complete the payment,
    your booking will remain pending.

</p>


<hr
    style="
        border:none;
        border-top:1px solid #eee;
        margin:25px 0;
    "
>


<small style="color:#888;">

    If you did not request this booking,
    please contact Event Spark support.

</small>


<p>

    <strong>
        Event Spark Team
    </strong>

</p>


</div>


</div>


</body>

</html>

`;


    return await sendBrevoEmail({

        to: email,

        subject:
            "Payment Required for Event Booking",

        html: html

    });

};
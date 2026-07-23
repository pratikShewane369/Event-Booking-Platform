const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const bookingRoutes = require("./routes/bookings");
const paymentRoutes = require("./routes/payment");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes 
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);

// Connecting Mongoose 
mongoose.connect(process.env.MONGODB_URI)
.then( () => {
    console.log("Connected to MongoDB");
}).catch( (err) => {
    console.log("Error connecting to MongoDB", err);
})


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`App is listening to port ${PORT}`);
})
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import api from "../utils/axios";

const PaymentPage = () => {
  const { bookingId } = useParams();

  useEffect(() => {
    const startPayment = async () => {
      try {
        // Save to localStorage as a safety net before leaving the site
        if (bookingId) {
          localStorage.setItem('pendingBookingId', bookingId);
        }

        const { data } = await api.post("/payments/create-checkout-session", {
          bookingId,
        });

        // data.url already has session_id appended by Stripe (via the
        // {CHECKOUT_SESSION_ID} placeholder set server-side) plus
        // bookingId — PaymentSuccess.jsx reads both from there.
        if (data?.url) {
          window.location.href = data.url;
        } else {
          alert("Invalid response from payment server.");
        }
      } catch (err) {
        console.error("Payment Initiation Error:", err);
        alert(err.response?.data?.message || "Unable to start payment session.");
      }
    };

    if (bookingId) {
      startPayment();
    }
  }, [bookingId]);

  return (
    <div className="flex flex-col justify-center items-center min-h-[70vh]">
      <FaSpinner className="animate-spin text-indigo-600 text-5xl mb-4" />
      <h2 className="text-2xl font-bold text-gray-800">Redirecting to Stripe Checkout...</h2>
      <p className="text-gray-500 mt-2">Please do not refresh or close this page.</p>
    </div>
  );
};

export default PaymentPage;
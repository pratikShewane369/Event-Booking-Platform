import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/axios";

const PaymentPage = () => {
  const { bookingId } = useParams();

  useEffect(() => {
    const startPayment = async () => {
      try {
        const { data } = await api.post("/payments/create-checkout-session", {
          bookingId,
        });

        window.location.href = data.url;
      } catch (err) {
        alert(err.response?.data?.message || "Unable to start payment.");
      }
    };

    startPayment();
  }, [bookingId]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <h2 className="text-2xl font-bold">Redirecting to Stripe...</h2>
    </div>
  );
};

export default PaymentPage;

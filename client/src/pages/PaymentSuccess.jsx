import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import api from '../utils/axios';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();

    // Stripe appends session_id automatically (from {CHECKOUT_SESSION_ID}
    // in the success_url). bookingId is the one we added ourselves.
    const sessionId = searchParams.get('session_id');
    const bookingId =
        searchParams.get('bookingId') ||
        searchParams.get('booking_id') ||
        searchParams.get('id');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const confirmPayment = async () => {
            console.log('Full Search Query:', searchParams.toString());
            console.log('Session ID:', sessionId, 'Booking ID:', bookingId);

            if (!bookingId || !sessionId) {
                setError('Missing payment confirmation details in the URL.');
                setLoading(false);
                return;
            }

            try {
                // Ask the backend to verify with Stripe and mark the
                // booking as paid/confirmed. This is the call that used
                // to be commented out.
                await api.get('/payments/confirm', {
                    params: { session_id: sessionId, bookingId },
                });
            } catch (err) {
                console.error('Failed to confirm payment on server:', err);
                setError(
                    err.response?.data?.message ||
                        'Could not verify payment status. Please check your dashboard.'
                );
            } finally {
                setLoading(false);
            }
        };

        confirmPayment();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bookingId, sessionId]);

    // 1. Loading State
    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
                <FaSpinner className="animate-spin text-green-500 text-5xl mb-4" />
                <p className="text-gray-600 text-lg font-medium">Confirming your booking...</p>
            </div>
        );
    }

    // 2. Error State
    if (error) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
                <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full text-center border-t-8 border-red-500">
                    <FaExclamationTriangle className="text-red-500 text-7xl mx-auto mb-6" />
                    <h1 className="text-3xl font-black text-gray-900 mb-4">Verification Alert</h1>
                    <p className="text-gray-600 mb-8">{error}</p>
                    <Link
                        to="/dashboard"
                        className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition shadow-lg"
                    >
                        Go to My Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    // 3. Success State
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
            <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full text-center border-t-8 border-green-500 transform transition-all hover:-translate-y-1">
                <FaCheckCircle className="text-green-500 text-7xl mx-auto mb-6 drop-shadow-sm" />
                <h1 className="text-4xl font-black text-gray-900 mb-4">Booking Confirmed!</h1>
                <p className="text-gray-500 mb-8 text-lg">
                    Your ticket has been booked successfully. A confirmation email has been sent to your registered email address.
                </p>
                <div className="space-y-4">
                    <Link
                        to="/dashboard"
                        className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition shadow-lg hover:shadow-xl"
                    >
                        View My Tickets
                    </Link>
                    <Link
                        to="/"
                        className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-xl transition"
                    >
                        Discover More Events
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
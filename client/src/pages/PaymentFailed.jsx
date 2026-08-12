import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaTimesCircle, FaSpinner } from 'react-icons/fa';
import api from '../utils/axios';

const PaymentFailed = () => {
    const [searchParams] = useSearchParams();
    const bookingId =
        searchParams.get('bookingId') ||
        searchParams.get('booking_id') ||
        searchParams.get('id');

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const markFailed = async () => {
            if (!bookingId) {
                setLoading(false);
                return;
            }
            try {
                await api.get('/payments/fail', { params: { bookingId } });
            } catch (err) {
                // Non-critical: the booking simply stays as whatever
                // status it already had if this call fails.
                console.error('Failed to mark payment as failed:', err);
            } finally {
                setLoading(false);
            }
        };

        markFailed();
    }, [bookingId]);

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
                <FaSpinner className="animate-spin text-gray-400 text-5xl mb-4" />
                <p className="text-gray-600 text-lg font-medium">Updating booking status...</p>
            </div>
        );
    }

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
            <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full text-center border-t-8 border-red-500">
                <FaTimesCircle className="text-red-500 text-7xl mx-auto mb-6" />
                <h1 className="text-3xl font-black text-gray-900 mb-4">Payment Cancelled</h1>
                <p className="text-gray-600 mb-8">
                    Your payment wasn't completed, so your booking is still pending payment. No charge was made.
                </p>
                <div className="space-y-4">
                    {bookingId && (
                        <Link
                            to={`/payments/${bookingId}`}
                            className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl transition shadow-lg"
                        >
                            Try Payment Again
                        </Link>
                    )}
                    <Link
                        to="/dashboard"
                        className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-xl transition"
                    >
                        Go to My Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailed;
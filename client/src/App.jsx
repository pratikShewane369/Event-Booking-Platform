// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import Home from './pages/Home';
// import EventDetail from './pages/EventDetail';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import UserDashboard from './pages/UserDashboard';
// import AdminDashboard from './pages/AdminDashboard';
// import PaymentSuccess from './pages/PaymentSuccess';
// import PaymentFailed from './pages/PaymentFailed';
// import PaymentPage from "./pages/PaymentPage";
// import NotFound from "./components/NotFound";

// function App() {
//   return (
//      <Router>
//             <div className="min-h-screen bg-gray-50 flex flex-col">
//                 <Navbar />
//                  <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
//                    <Routes>
//                      <Route path="/" element={<Home />} />
//                      <Route path="/events/:id" element={<EventDetail />} />
//                         <Route path="/login" element={<Login />} />
//                         <Route path="/register" element={<Register />} />
//                         <Route path="/dashboard" element={<UserDashboard />} />
//                         <Route path="/admin" element={<AdminDashboard />} />
//                         <Route path="/payments-success/:bookingId" element={<PaymentSuccess />} />
//                         <Route path="/payments-failed" element={<PaymentFailed />} />
//                         <Route path="/payments/:bookingId" element={<PaymentPage />} />
//                         <Route path="*" element={<NotFound />} />
//                    </Routes>
//                  </main>
//             </div>
//       </Router>
//   )
// }

// export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import EventDetail from './pages/EventDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import PaymentPage from "./pages/PaymentPage";
import NotFound from "./components/NotFound";

function App() {
  return (
     <Router>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                 <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                   <Routes>
                     <Route path="/" element={<Home />} />
                     <Route path="/events/:id" element={<EventDetail />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/dashboard" element={<UserDashboard />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        {/* FIXED: was "/payments-success/:bookingId" — but the
                            backend redirects with ?session_id=...&bookingId=...
                            as a query string, not a path param, so this never
                            matched and fell through to NotFound. */}
                        <Route path="/payments-success" element={<PaymentSuccess />} />
                        <Route path="/payments-failed" element={<PaymentFailed />} />
                        <Route path="/payments/:bookingId" element={<PaymentPage />} />
                        <Route path="*" element={<NotFound />} />
                   </Routes>
                 </main>
            </div>
      </Router>
  )
}

export default App;
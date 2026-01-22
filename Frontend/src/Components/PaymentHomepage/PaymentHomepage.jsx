
// // export default PaymentHomepage;

// //updated code for dynamically taka amount calculation
// import React, { useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import "./PaymentHomepage.css";

// const PaymentHomepage = () => {
//   const [loading, setLoading] = useState(false);
//   const [email, setEmail] = useState("");
//   const navigate = useNavigate();

//   const location = useLocation();
//   const { orderId, orderDetails = {} } = location.state || {};
//   const items = Array.isArray(orderDetails.items) ? orderDetails.items : [];
//   const customerInfo = orderDetails.customerInfo || {};

//   // Calculate the total amount dynamically
//   const totalAmount = items.reduce((total, item) => {
//     return total + item.price * item.quantity;
//   }, 0);

//   const handlePayClick = async () => {
//     if (!email.trim()) {
//       alert("Please enter a valid email.");
//       return;
//     }
//     if (totalAmount < 50) {
//       // Stripe minimum is 50 cents (in "cents" for USD)
//       alert("Minimum payment amount is ৳50. Please add more items.");
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await fetch(
//         "http://127.0.0.1:8000/api/payments/create-payment-intent/",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             amount: totalAmount, // Use the dynamically calculated amount
//             user_email: email.trim(),
//           }),
//         }
//       );

//       const data = await response.json();
//       console.log("Backend Response:", data);

//       if (response.ok && data.clientSecret) {
//         navigate("/paymentforstripe", {
//           state: { clientSecret: data.clientSecret },
//         });
//       } else {
//         alert(
//           "Error creating payment intent: " + (data.error || "Unknown error")
//         );
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       alert("Error creating payment intent.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="payment-homepage">
//       <div className="container">
//         <h1>React Stripe Payment</h1>
//         <p>
//           <strong>Order ID:</strong> {orderId || "N/A"}
//         </p>
//         <p>
//           <strong>Amount:</strong> ৳{totalAmount.toLocaleString()} BDT
//         </p>

//         {/* Render Order Details Properly */}
//         <div>
//           <h3>Order Details:</h3>
//           {items.length > 0 ? (
//             <ul>
//               {items.map((item, index) => (
//                 <li key={index}>
//                   <strong>{item.name || "Unnamed Item"}</strong> - ৳
//                   {(item.price * item.quantity).toLocaleString()} (
//                   {item.quantity} x ৳{item.price})
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p>No items in the order.</p>
//           )}
//         </div>

//         {/* Render Customer Info if available */}
//         {customerInfo.full_name && (
//           <div>
//             <h3>Customer Information:</h3>
//             <p>
//               <strong>Name:</strong> {customerInfo.full_name}
//             </p>
//             <p>
//               <strong>Email:</strong> {customerInfo.email}
//             </p>
//             <p>
//               <strong>Phone:</strong> {customerInfo.phone_number}
//             </p>
//             <p>
//               <strong>Address:</strong> {customerInfo.address}
//             </p>
//           </div>
//         )}

//         <form
//           onSubmit={(e) => {
//             e.preventDefault();
//             handlePayClick();
//           }}
//         >
//           <label htmlFor="email">Enter your email:</label>
//           <input
//             type="email"
//             id="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//           <button type="submit" disabled={loading}>
//             {loading ? "Processing..." : "Pay Now"}
//           </button>
//           {/* Back Button */}
//           <button
//             type="button"
//             className="back-btn"
//             onClick={() => navigate("/")}
//           >
//             Back to Homepage
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default PaymentHomepage;




//version 2 (auto fill up)

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./PaymentHomepage.css";

const PaymentHomepage = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [userDataLoading, setUserDataLoading] = useState(true);
  const navigate = useNavigate();

  const location = useLocation();
  const { orderId, orderDetails = {} } = location.state || {};
  const items = Array.isArray(orderDetails.items) ? orderDetails.items : [];
  const customerInfo = orderDetails.customerInfo || {};

  // Calculate the total amount dynamically
  const totalAmount = items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("Please login to continue");
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/accounts/user-info/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        // Auto-fill email from user profile
        setEmail(response.data.email || "");
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (error.response?.status === 401) {
          alert("Session expired. Please login again.");
          navigate("/login");
        }
      } finally {
        setUserDataLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handlePayClick = async () => {
    if (!email.trim()) {
      alert("Please enter a valid email.");
      return;
    }
    if (totalAmount < 50) {
      alert("Minimum payment amount is ৳50. Please add more items.");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Please login to continue");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/payments/create-payment-intent/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: totalAmount,
            order_id: orderId,   // ✅ ADD THIS

          }),
        }
      );

      const data = await response.json();
      console.log("Backend Response:", data);

      if (response.ok && data.clientSecret) {
        navigate("/paymentforstripe", {
          state: { clientSecret: data.clientSecret },
        });
      } else {
        alert(
          "Error creating payment intent: " + (data.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error creating payment intent.");
    } finally {
      setLoading(false);
    }
  };

  if (userDataLoading) {
    return <div className="payment-homepage"><div className="container"><p>Loading...</p></div></div>;
  }

  return (
    <div className="payment-homepage">
      <div className="container">
        <h1>React Stripe Payment</h1>
        <p>
          <strong>Order ID:</strong> {orderId || "N/A"}
        </p>
        <p>
          <strong>Amount:</strong> ৳{totalAmount.toLocaleString()} BDT
        </p>

        {/* Render Order Details Properly */}
        <div>
          <h3>Order Details:</h3>
          {items.length > 0 ? (
            <ul>
              {items.map((item, index) => (
                <li key={index}>
                  <strong>{item.name || "Unnamed Item"}</strong> - ৳
                  {(item.price * item.quantity).toLocaleString()} (
                  {item.quantity} x ৳{item.price})
                </li>
              ))}
            </ul>
          ) : (
            <p>No items in the order.</p>
          )}
        </div>

        {/* Render Customer Info if available */}
        {customerInfo.full_name && (
          <div>
            <h3>Customer Information:</h3>
            <p>
              <strong>Name:</strong> {customerInfo.full_name}
            </p>
            <p>
              <strong>Email:</strong> {customerInfo.email}
            </p>
            <p>
              <strong>Phone:</strong> {customerInfo.phone_number}
            </p>
            <p>
              <strong>Address:</strong> {customerInfo.address}
            </p>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handlePayClick();
          }}
        >
          <label htmlFor="email">Your Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            readOnly
            style={{ backgroundColor: "#f0f0f0" }}
          />
          <small style={{ display: "block", marginBottom: "10px", color: "#666" }}>
            Email is auto-filled from your profile
          </small>
          <button type="submit" disabled={loading}>
            {loading ? "Processing..." : "Pay Now"}
          </button>
          {/* Back Button */}
          <button
            type="button"
            className="back-btn"
            onClick={() => navigate("/")}
          >
            Back to Homepage
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentHomepage;

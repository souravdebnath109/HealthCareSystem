



// import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import "./Checkout.css";

// const Checkout = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const { cartItems = [], totalPrice = 0 } = location.state || {};

//   const [loading, setLoading] = useState(false);
//   const [userDataLoading, setUserDataLoading] = useState(true);

//   const [formData, setFormData] = useState({
//     full_name: "",
//     address: "",
//     phone_number: "",
//     email: "",
//   });

//   const [autoFilledFields, setAutoFilledFields] = useState({
//     full_name: false,
//     email: false,
//     phone_number: false,
//     address: false,
//   });

//   // ✅ Fetch user info and auto-fill
//   useEffect(() => {
//     const token = localStorage.getItem("accessToken");
//     if (!token) {
//       toast.error("Please login to continue");
//       navigate("/login");
//       return;
//     }

//     const fetchUserData = async () => {
//       try {
//         const res = await axios.get("http://127.0.0.1:8000/api/accounts/user-info/", {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         const user = res.data;

//         // fallback: full_name -> username
//         const resolvedFullName =
//           user.full_name && user.full_name.trim()
//             ? user.full_name
//             : user.username || "";

//         setFormData({
//           full_name: resolvedFullName || "",
//           email: user.email || "",
//           phone_number: user.phone_number || "",
//           address: user.address || "",
//         });

//         setAutoFilledFields({
//           full_name: !!resolvedFullName,
//           email: !!user.email,
//           phone_number: !!user.phone_number,
//           address: !!user.address,
//         });

//         console.log("USER-INFO:", user);
//       } catch (err) {
//         console.error("Error fetching user data:", err);
//         if (err.response?.status === 401) {
//           toast.error("Session expired. Please login again.");
//           navigate("/login");
//         } else {
//           toast.error("Failed to load profile info.");
//         }
//       } finally {
//         setUserDataLoading(false);
//       }
//     };

//     fetchUserData();
//   }, [navigate]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (
//       !formData.full_name.trim() ||
//       !formData.email.trim() ||
//       !formData.phone_number.trim() ||
//       !formData.address.trim()
//     ) {
//       toast.error("Please fill in all required fields");
//       return;
//     }

//     const token = localStorage.getItem("accessToken");
//     if (!token) {
//       toast.error("Please login to continue");
//       navigate("/login");
//       return;
//     }

//     setLoading(true);

//     try {
//       // Optional: keep your order API call
//       const orderResponse = await axios.post(
//         "http://127.0.0.1:8000/api/order/place/",
//         {
//           ...formData,
//           total_price: totalPrice,
//         },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       toast.success("Order information saved! Redirecting to payment...");

//       const orderId = orderResponse.data?.id || `ORD-${Date.now()}`;

//       setTimeout(() => {
//         navigate("/payment", {
//           state: {
//             orderId,
//             amount: totalPrice,
//             orderDetails: {
//               items: cartItems.map((item) => ({
//                 name: item.productName,
//                 price: item.productPrice,
//                 quantity: item.quantity,
//               })),
//               customerInfo: formData,
//             },
//           },
//         });
//       }, 1200);
//     } catch (error) {
//       console.error("Error placing order:", error);
//       toast.error(
//         error.response?.data?.error || "Failed to place order. Please try again."
//       );
//       if (error.response?.status === 401) navigate("/login");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (userDataLoading) {
//     return (
//       <div className="checkout-page">
//         <div className="checkout-container">
//           <p>Loading checkout...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="checkout-page">
//       <div className="checkout-container">
//         <ToastContainer />
//         <h2>Checkout</h2>

//         <div className="order-summary">
//           <h3>Order Summary</h3>

//           {cartItems.length > 0 ? (
//             cartItems.map((item) => (
//               <div key={item.id} className="cart-item">
//                 <span>{item.productName}</span>
//                 <span>
//                   {item.quantity} x ৳{item.productPrice}
//                 </span>
//                 <span>৳{(item.quantity * item.productPrice).toFixed(2)}</span>
//               </div>
//             ))
//           ) : (
//             <p>No items found.</p>
//           )}

//           <div className="total">
//             <strong>Total: ৳{totalPrice}</strong>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit} className="checkout-form">
//           <div className="form-group">
//             <label>Full Name:</label>
//             <input
//               type="text"
//               name="full_name"
//               value={formData.full_name}
//               onChange={handleInputChange}
//               required
//               readOnly={autoFilledFields.full_name}
//               style={autoFilledFields.full_name ? { backgroundColor: "#f0f0f0" } : {}}
//             />
//             {autoFilledFields.full_name && (
//               <small style={{ color: "#666" }}>Auto-filled from profile</small>
//             )}
//           </div>

//           <div className="form-group">
//             <label>Address:</label>
//             <textarea
//               name="address"
//               value={formData.address}
//               onChange={handleInputChange}
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label>Phone Number:</label>
//             <input
//               type="tel"
//               name="phone_number"
//               value={formData.phone_number}
//               onChange={handleInputChange}
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label>Email:</label>
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleInputChange}
//               required
//               readOnly={true}
//               style={{ backgroundColor: "#f0f0f0" }}
//             />
//             <small style={{ color: "#666" }}>Auto-filled from profile</small>
//           </div>

//           <button type="submit" className="place-order-btn" disabled={loading}>
//             {loading ? "Placing Order..." : "Place Order"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Checkout;






//2nd form (for checkout)

// Components/Checkout/Checkout.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Checkout.css";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // cartItems should come from cart page
  const { cartItems = [], totalPrice = 0 } = location.state || {};

  const token = localStorage.getItem("accessToken");

  const [loading, setLoading] = useState(false);
  const [userDataLoading, setUserDataLoading] = useState(true);

  const [formData, setFormData] = useState({
    full_name: "",
    address: "",
    phone_number: "",
    email: "",
  });

  const [autoFilledFields, setAutoFilledFields] = useState({
    full_name: false,
    email: false,
    phone_number: false,
    address: false,
  });

  // ✅ Always compute total from cartItems (safer than trusting totalPrice)
  const computedTotalPrice = useMemo(() => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((sum, item) => {
      const price = Number(item.productPrice || 0);
      const qty = Number(item.quantity || 0);
      return sum + price * qty;
    }, 0);
  }, [cartItems]);

  const finalTotalPrice = computedTotalPrice > 0 ? computedTotalPrice : Number(totalPrice || 0);

  // ✅ Build items payload exactly as backend will store
  const orderItemsPayload = useMemo(() => {
    if (!Array.isArray(cartItems)) return [];
    return cartItems.map((item) => ({
      productId: item.productId ?? item.product ?? null, // optional
      name: item.productName || "Unknown",
      price: Number(item.productPrice || 0),
      quantity: Number(item.quantity || 1),
    }));
  }, [cartItems]);

  // ✅ Fetch user info and auto-fill
  useEffect(() => {
    if (!token) {
      toast.error("Please login to continue");
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/accounts/user-info/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = res.data || {};

        // fallback: full_name -> username
        const resolvedFullName =
          user.full_name && user.full_name.trim()
            ? user.full_name
            : user.username || "";

        setFormData((prev) => ({
          ...prev,
          full_name: resolvedFullName || "",
          email: user.email || "",
          phone_number: user.phone_number || "",
          address: user.address || "",
        }));

        setAutoFilledFields({
          full_name: !!resolvedFullName,
          email: !!user.email,
          phone_number: !!user.phone_number,
          address: !!user.address,
        });

        console.log("USER-INFO:", user);
      } catch (err) {
        console.error("Error fetching user data:", err);
        if (err.response?.status === 401) {
          toast.error("Session expired. Please login again.");
          navigate("/login");
        } else {
          toast.error("Failed to load profile info.");
        }
      } finally {
        setUserDataLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Check cart
    if (!cartItems || cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    // ✅ Validate form
    if (
      !formData.full_name.trim() ||
      !formData.email.trim() ||
      !formData.phone_number.trim() ||
      !formData.address.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!token) {
      toast.error("Please login to continue");
      navigate("/login");
      return;
    }

    // ✅ Backend requires items now
    const payload = {
      full_name: formData.full_name.trim(),
      address: formData.address.trim(),
      phone_number: formData.phone_number.trim(),
      email: formData.email.trim(),
      total_price: finalTotalPrice,
      items: orderItemsPayload, // ✅ REQUIRED
    };

    setLoading(true);

    try {
      const orderResponse = await axios.post(
        "http://127.0.0.1:8000/api/order/place/",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Order information saved! Redirecting to payment...");

      const orderId = orderResponse.data?.id || `ORD-${Date.now()}`;

      setTimeout(() => {
        navigate("/payment", {
          state: {
            orderId,
            amount: finalTotalPrice,
            orderDetails: {
              items: orderItemsPayload.map((x) => ({
                name: x.name,
                price: x.price,
                quantity: x.quantity,
              })),
              customerInfo: formData,
            },
          },
        });
      }, 1200);
    } catch (error) {
      console.error("Error placing order:", error);

      const msg =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to place order. Please try again.";

      toast.error(msg);

      if (error.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  if (userDataLoading) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <p>Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <ToastContainer />
        <h2>Checkout</h2>

        <div className="order-summary">
          <h3>Order Summary</h3>

          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div key={item.id || item.productId || item.productName} className="cart-item">
                <span>{item.productName}</span>
                <span>
                  {item.quantity} x ৳{item.productPrice}
                </span>
                <span>৳{(Number(item.quantity) * Number(item.productPrice)).toFixed(2)}</span>
              </div>
            ))
          ) : (
            <p>No items found.</p>
          )}

          <div className="total">
            <strong>Total: ৳{finalTotalPrice.toFixed(2)}</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="form-group">
            <label>Full Name:</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              required
              readOnly={autoFilledFields.full_name}
              style={autoFilledFields.full_name ? { backgroundColor: "#f0f0f0" } : {}}
            />
            {autoFilledFields.full_name && (
              <small style={{ color: "#666" }}>Auto-filled from profile</small>
            )}
          </div>

          <div className="form-group">
            <label>Address:</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number:</label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              readOnly
              style={{ backgroundColor: "#f0f0f0" }}
            />
            <small style={{ color: "#666" }}>Auto-filled from profile</small>
          </div>

          <button type="submit" className="place-order-btn" disabled={loading}>
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;

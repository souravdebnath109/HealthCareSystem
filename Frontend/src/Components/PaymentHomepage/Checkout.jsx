import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Checkout.css";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items = [] } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [userDataLoading, setUserDataLoading] = useState(true);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    address: "",
  });

  const [autoFilledFields, setAutoFilledFields] = useState({
    full_name: false,
    email: false,
    phone_number: false,
    address: false,
  });

  const totalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

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

        // ✅ DEBUG (keep this for now to verify response)
        console.log("USER-INFO:", res.data);

        const user = res.data;

        // ✅ fallback: if full_name missing, use username
        const resolvedFullName = (user.full_name && user.full_name.trim()) ? user.full_name : (user.username || "");

        setFormData({
          full_name: resolvedFullName || "",
          email: user.email || "",
          phone_number: user.phone_number || "",
          address: user.address || "",
        });

        setAutoFilledFields({
          full_name: !!resolvedFullName,
          email: !!user.email,
          phone_number: !!user.phone_number,
          address: !!user.address,
        });
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
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.full_name.trim() ||
      !formData.email.trim() ||
      !formData.phone_number.trim() ||
      !formData.address.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const orderId = `ORD-${Date.now()}`;

      navigate("/payment", {
        state: {
          orderId,
          amount: totalAmount,
          orderDetails: {
            items,
            customerInfo: formData,
          },
        },
      });
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (userDataLoading) {
    return (
      <div className="checkout-container">
        <p>Loading checkout...</p>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <ToastContainer />
      <h2>Checkout</h2>

      <div className="order-summary">
        <h3>Order Summary</h3>
        {items.length > 0 ? (
          <ul>
            {items.map((item, index) => (
              <li key={index}>
                {item.name} - ৳{item.price} x {item.quantity} = ৳{item.price * item.quantity}
              </li>
            ))}
          </ul>
        ) : (
          <p>No items in cart</p>
        )}
        <p>
          <strong>Total: ৳{totalAmount}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="checkout-form">
        <div className="form-group">
          <label htmlFor="full_name">Full Name *</label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
            readOnly={autoFilledFields.full_name}
            style={autoFilledFields.full_name ? { backgroundColor: "#f0f0f0" } : {}}
          />
          {autoFilledFields.full_name && (
            <small style={{ color: "#666" }}>Auto-filled from profile</small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            readOnly={true} // ✅ always lock email (safer)
            style={{ backgroundColor: "#f0f0f0" }}
          />
          <small style={{ color: "#666" }}>Auto-filled from profile</small>
        </div>

        <div className="form-group">
          <label htmlFor="phone_number">Phone Number *</label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">Address *</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            rows="3"
          />
        </div>

        <button type="submit" disabled={loading} className="checkout-btn">
          {loading ? "Processing..." : "Proceed to Payment"}
        </button>

        <button type="button" onClick={() => navigate("/")} className="back-btn">
          Back to Homepage
        </button>
      </form>
    </div>
  );
};

export default Checkout;

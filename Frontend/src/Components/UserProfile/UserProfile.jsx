import React, { useEffect, useState, useCallback } from "react";
import "./UserProfile.css";

const UserProfile = () => {
  const token = localStorage.getItem("accessToken");

  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [toast, setToast] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    profile_image: null,
    old_email: "",
    old_password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);

  /* ================= FETCH PROFILE ================= */
  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/accounts/profile/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch profile");

      const data = await res.json();
      setProfile(data);
      setFormData((prev) => ({
        ...prev,
        username: data.username || "",
        email: data.email || "",
      }));
    } catch {
      setError("Error fetching profile");
    } finally {
      setLoading(false);
    }
  }, [token]);

  /* ================= FETCH ORDERS ================= */
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/order/my/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      setOrders(await res.json());
    } catch {
      setError("Error fetching orders");
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
    fetchOrders();
  }, [fetchProfile, fetchOrders]);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const handleInputFocus = (field) => {
    if (field === "email") showToastMsg("You can keep or update your email.");
    if (field === "password")
      showToastMsg("Leave blank to keep password unchanged.");
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess("");

    if (!formData.old_email || !formData.old_password) {
      alert("Old email & password required");
      return;
    }

    const updateData = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (v) updateData.append(k, v);
    });

    try {
      setSubmitLoading(true);
      const res = await fetch(
        "http://127.0.0.1:8000/api/accounts/profile/update/",
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: updateData,
        }
      );
      if (!res.ok) throw new Error("Update failed");

      setProfile(await res.json());
      setSuccess("Profile updated successfully");
      setTimeout(() => setSuccess(""), 3000);

      // optional: clear sensitive fields after success
      setFormData((prev) => ({
        ...prev,
        password: "",
        profile_image: null,
        old_email: "",
        old_password: "",
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  /* ================= JSX ================= */
  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h2 className="profile-title">User Profile</h2>

      <div className="profile-image-box">
        <img
          src={profile?.profile_image || "/default_profile.png"}
          alt="Profile"
          className="profile-img-rect"
        />
      </div>

      {toast && <div className="custom-toast">{toast}</div>}
      {success && <div className="text-success text-center mb-2">{success}</div>}
      {error && <div className="text-error text-center mb-2">{error}</div>}

      {/* ================= PROFILE FORM ================= */}
      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="profile-form bg-white p-6 rounded shadow-md"
      >
        <div className="profile-form-grid">
          <label htmlFor="username">New Username:</label>
          <div>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter new username"
            />
            <div className="input-note">
              * you can keep it or can update it with proper validation
            </div>
          </div>

          <label htmlFor="email">New Email:</label>
          <div>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter new email"
              onFocus={() => handleInputFocus("email")}
            />
            <div className="input-note">
              * you can keep it or can update it with proper validation
            </div>
          </div>

          <label htmlFor="password">New Password:</label>
          <div className="input-with-btn">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              placeholder="Leave blank to keep unchanged"
              onFocus={() => handleInputFocus("password")}
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowPassword((s) => !s)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <label htmlFor="profile_image">Profile Image:</label>
          <input
            id="profile_image"
            type="file"
            name="profile_image"
            accept="image/*"
            onChange={handleChange}
            className="file-input"
          />

          <label className="validation-label">Validation :</label>
          <div></div>

          <label htmlFor="old_email">Old Email:</label>
          <input
            id="old_email"
            type="email"
            name="old_email"
            value={formData.old_email}
            onChange={handleChange}
            required
            className="input-field"
          />

          <label htmlFor="old_password">Old Password:</label>
          <div className="input-with-btn">
            <input
              id="old_password"
              type={showOldPassword ? "text" : "password"}
              name="old_password"
              value={formData.old_password}
              onChange={handleChange}
              required
              className="input-field"
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowOldPassword((s) => !s)}
            >
              {showOldPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitLoading}
          className="btn-primary mt-4 w-full"
          style={{ marginTop: "24px" }}
        >
          {submitLoading ? "Updating..." : "Update Profile"}
        </button>
      </form>

      <hr className="my-6" />

      {/* ================= ONE TABLE ONLY: PURCHASED PRODUCTS ================= */}
      <h3 className="payments-title">Your Purchased Products</h3>

      {orders.length === 0 ? (
        <p className="text-gray-600">No orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Products</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>
                    {(o.items || []).length === 0 ? (
                      <span>No items</span>
                    ) : (
                      (o.items || []).map((it, i) => (
                        <div key={i}>
                          {it?.name} ({it?.quantity} × ৳{it?.price})
                        </div>
                      ))
                    )}
                  </td>
                  <td>৳{o.total_price}</td>
                  <td>{new Date(o.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserProfile;

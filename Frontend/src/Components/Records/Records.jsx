import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api";

const fields = [
  { key: "temperature", label: "Temperature", tick: "tick_temperature", type: "number" },
  { key: "sugar_level", label: "Sugar Level", tick: "tick_sugar_level", type: "number" },
  { key: "bp", label: "BP (Sys/Dia)", tick: "tick_bp", type: "bp" },
  { key: "weight", label: "Weight", tick: "tick_weight", type: "number" },
  { key: "sleep_hours", label: "Sleep (Hours)", tick: "tick_sleep", type: "number" },
  { key: "mood", label: "Mood", tick: "tick_mood", type: "text" },
  { key: "steps", label: "Steps", tick: "tick_steps", type: "number" },
  { key: "water_liters", label: "Water (Liters)", tick: "tick_water", type: "number" },
  { key: "calorie", label: "Calorie", tick: "tick_calorie", type: "number" },
];

function toISODate(d) {
  return d.toISOString().slice(0, 10);
}

export default function Records() {
  const [selectedDate, setSelectedDate] = useState(toISODate(new Date()));
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  const accessToken = localStorage.getItem("accessToken");

  const authHeaders = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

  const fetchRecord = async (dateStr) => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/records/by-date/?date=${dateStr}`, {
        headers: authHeaders,
      });
      setRecord(res.data);
    } catch (e) {
      console.error(e);
      alert("Failed to load record. Your token may be expired. Please login again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecord(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const saveRecord = async (updated) => {
    if (!updated?.id) return;

    try {
      const res = await axios.patch(`${API_BASE}/records/${updated.id}/`, updated, {
        headers: authHeaders,
      });
      setRecord(res.data);
    } catch (e) {
      console.error(e);
      alert("Failed to save record. Your token may be expired. Please login again.");
    }
  };

  const handleTickChange = (tickKey, checked) => {
    if (!record) return;
    const updated = { ...record, [tickKey]: checked };
    setRecord(updated);
    saveRecord(updated);
  };

  const handleValueChange = (key, value) => {
    if (!record) return;
    setRecord((prev) => ({ ...prev, [key]: value }));
  };

  const handleBlurSave = () => {
    if (record) saveRecord(record);
  };

  // ✅ Your exact function (as requested)
  const downloadMonthlyPdf = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("Please login again.");
        return;
      }

      // selectedDate is "YYYY-MM-DD" → convert to "YYYY-MM"
      const monthStr = selectedDate.slice(0, 7);

      const res = await axios.get(`${API_BASE}/records/monthly-pdf/?month=${monthStr}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `monthly_records_${monthStr}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to download PDF (maybe token expired). Please login again.");
    }
  };

  if (!accessToken) {
    return <div style={{ padding: 20 }}>Please login to use Records.</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Daily Records</h2>

      <div style={{ marginBottom: 12, display: "flex", gap: 10, alignItems: "center" }}>
        <label>
          Date:{" "}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </label>

        <button type="button" onClick={downloadMonthlyPdf}>
          Download 30-Day PDF
        </button>
      </div>

      {loading || !record ? (
        <div>Loading...</div>
      ) : (
        <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Item</th>
              <th>Value</th>
              <th>Tick</th>
            </tr>
          </thead>

          <tbody>
            {fields.map((f) => (
              <tr key={f.key}>
                <td>{f.label}</td>

                <td>
                  {f.type === "bp" ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="number"
                        placeholder="Systolic"
                        value={record.bp_systolic ?? ""}
                        onChange={(e) =>
                          handleValueChange(
                            "bp_systolic",
                            e.target.value === "" ? null : Number(e.target.value)
                          )
                        }
                        onBlur={handleBlurSave}
                      />
                      <input
                        type="number"
                        placeholder="Diastolic"
                        value={record.bp_diastolic ?? ""}
                        onChange={(e) =>
                          handleValueChange(
                            "bp_diastolic",
                            e.target.value === "" ? null : Number(e.target.value)
                          )
                        }
                        onBlur={handleBlurSave}
                      />
                    </div>
                  ) : (
                    <input
                      type={f.type}
                      value={record[f.key] ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (f.type === "number") {
                          handleValueChange(f.key, v === "" ? null : Number(v));
                        } else {
                          handleValueChange(f.key, v);
                        }
                      }}
                      onBlur={handleBlurSave}
                      style={{ width: "100%" }}
                    />
                  )}
                </td>

                <td style={{ textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={!!record[f.tick]}
                    onChange={(e) => handleTickChange(f.tick, e.target.checked)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {record?.is_complete !== undefined && (
        <p style={{ marginTop: 12 }}>
          Status: <b>{record.is_complete ? "Complete ✅" : "Incomplete ❌"}</b>
        </p>
      )}
    </div>
  );
}

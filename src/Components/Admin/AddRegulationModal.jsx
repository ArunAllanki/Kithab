import { useState, useEffect } from "react";
import API from "../../services/api";

const AddRegulationModal = ({ token, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [numberOfSemesters, setNumberOfSemesters] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [existingRegs, setExistingRegs] = useState([]);

  useEffect(() => {
    const fetchRegs = async () => {
      try {
        const res = await API.get("/admin/regulations", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExistingRegs(res.data || []);
      } catch (err) {
        console.error("Failed to fetch regs for modal:", err);
      }
    };
    fetchRegs();
  }, [token]);

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Name is required";
    if (!numberOfSemesters && numberOfSemesters !== 0)
      e.numberOfSemesters = "Number of semesters is required";
    else if (isNaN(Number(numberOfSemesters)) || Number(numberOfSemesters) <= 0)
      e.numberOfSemesters = "Must be a positive number";

    // duplication (case-insensitive)
    const duplicate = existingRegs.some(
      (r) => String(r.name).trim().toLowerCase() === name.trim().toLowerCase()
    );
    if (!e.name && duplicate)
      e.name = "A regulation with this name already exists";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await API.post(
        "/admin/regulations",
        { name: name.trim(), numberOfSemesters: Number(numberOfSemesters) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess?.();
      onClose?.();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add regulation";
      setErrors({ server: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal-content" role="dialog" aria-modal="true">
        <h3>Add Regulation</h3>

        {errors.server && <p className="error">{errors.server}</p>}

        <form onSubmit={handleSubmit}>
          <div>
            <label>Name</label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((p) => ({ ...p, name: null }));
              }}
              placeholder="e.g. Regulation 2024"
            />
            {errors.name && <div className="error">{errors.name}</div>}
          </div>

          <div>
            <label>Number of Semesters</label>
            <input
              value={numberOfSemesters}
              onChange={(e) => {
                setNumberOfSemesters(e.target.value);
                if (errors.numberOfSemesters)
                  setErrors((p) => ({ ...p, numberOfSemesters: null }));
              }}
              placeholder="e.g. 8"
            />
            {errors.numberOfSemesters && (
              <div className="error">{errors.numberOfSemesters}</div>
            )}
          </div>

          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={() => onClose?.()}
              style={{ marginLeft: "0.5rem" }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRegulationModal;

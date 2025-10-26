import { useState, useEffect } from "react";
import API from "../../services/api";

const AddBranchModal = ({
  token,
  regulations = [],
  branches = [],
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [regulationId, setRegulationId] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!regulationId) e.regulationId = "Please select a regulation";
    if (!name.trim()) e.name = "Branch name is required";
    if (!code.trim()) e.code = "Branch code is required";


    const sameRegBranches = branches.filter(
      (b) => String(b.regulation?._id || b.regulation) === regulationId
    );
    if (
      sameRegBranches.some(
        (b) => b.name.trim().toLowerCase() === name.trim().toLowerCase()
      )
    ) {
      e.name = "A branch with this name already exists in this regulation";
    }
    if (
      sameRegBranches.some(
        (b) => b.code.trim().toLowerCase() === code.trim().toLowerCase()
      )
    ) {
      e.code = "A branch with this code already exists in this regulation";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await API.post(
        "/admin/branches",
        { name: name.trim(), code: code.trim(), regulation: regulationId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setErrors({
        server: err.response?.data?.message || "Failed to add branch",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal-content" role="dialog" aria-modal="true">
        <h3>Add Branch</h3>
        {errors.server && <p className="error">{errors.server}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Regulation</label>
            <select
              value={regulationId}
              onChange={(e) => {
                setRegulationId(e.target.value);
                setErrors((prev) => ({ ...prev, regulationId: null }));
              }}
            >
              <option value="">-- Select Regulation --</option>
              {regulations.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name}
                </option>
              ))}
            </select>
            {errors.regulationId && (
              <div className="error">{errors.regulationId}</div>
            )}
          </div>

          <div>
            <label>Branch Name</label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: null }));
              }}
            />
            {errors.name && <div className="error">{errors.name}</div>}
          </div>

          <div>
            <label>Code</label>
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setErrors((prev) => ({ ...prev, code: null }));
              }}
            />
            {errors.code && <div className="error">{errors.code}</div>}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "1rem",
            }}
          >
            <button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={onClose}
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

export default AddBranchModal;

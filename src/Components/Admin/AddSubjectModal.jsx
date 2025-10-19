import { useState, useEffect } from "react";
import API from "../../services/api";

const AddSubjectModal = ({
  token,
  regulations = [],
  branches = [],
  subjects = [],
  onClose,
  onSuccess,
}) => {
  const [regulationId, setRegulationId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [semester, setSemester] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const branchesForReg = branches.filter(
    (b) => String(b.regulation?._id || b.regulation) === regulationId
  );

  const semOptions = (() => {
    const reg = regulations.find((r) => r._id === regulationId);
    return Array.from({ length: reg?.numberOfSemesters || 0 }, (_, i) => i + 1);
  })();

  const validate = () => {
    const e = {};
    if (!regulationId) e.regulationId = "Please select regulation";
    if (!branchId) e.branchId = "Please select branch";
    if (!semester) e.semester = "Please select semester";
    if (!name.trim()) e.name = "Subject name is required";
    if (!code.trim()) e.code = "Subject code is required";

    // duplication check: same name/code in branch+semester
    const sameBranchSem = subjects.filter(
      (s) =>
        String(s.branch) === branchId && Number(s.semester) === Number(semester)
    );
    if (
      sameBranchSem.some(
        (s) => s.name.trim().toLowerCase() === name.trim().toLowerCase()
      )
    ) {
      e.name =
        "Subject with this name already exists in selected branch & semester";
    }
    if (
      sameBranchSem.some(
        (s) => s.code.trim().toLowerCase() === code.trim().toLowerCase()
      )
    ) {
      e.code =
        "Subject with this code already exists in selected branch & semester";
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
        "/admin/subjects",
        {
          name: name.trim(),
          code: code.trim(),
          branch: branchId,
          semester: Number(semester),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setErrors({
        server: err.response?.data?.message || "Failed to add subject",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal-content">
        <h3>Add Subject</h3>
        {errors.server && <p className="error">{errors.server}</p>}

        <form onSubmit={handleSubmit}>
          <div>
            <label>Regulation</label>
            <select
              value={regulationId}
              onChange={(e) => {
                setRegulationId(e.target.value);
                setBranchId("");
                setSemester("");
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
            <label>Branch</label>
            <select
              value={branchId}
              onChange={(e) => {
                setBranchId(e.target.value);
                setSemester("");
                setErrors((prev) => ({ ...prev, branchId: null }));
              }}
            >
              <option value="">-- Select Branch --</option>
              {branchesForReg.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
            {errors.branchId && <div className="error">{errors.branchId}</div>}
          </div>

          <div>
            <label>Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            >
              <option value="">-- Select Semester --</option>
              {semOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.semester && <div className="error">{errors.semester}</div>}
          </div>

          <div>
            <label>Subject Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Data Structures"
            />
            {errors.name && <div className="error">{errors.name}</div>}
          </div>

          <div>
            <label>Code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. CSE201"
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

export default AddSubjectModal;

import { useState, useEffect } from "react";
import API from "../../services/api";
import "./MetaManager.css";

import AddRegulationModal from "./AddRegulationModal";
import AddBranchModal from "./AddBranchModal";
import AddSubjectModal from "./AddSubjectModal";

const MetaManager = ({ token, subsection }) => {
  const [regulations, setRegulations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedReg, setSelectedReg] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");

  const [editItem, setEditItem] = useState(null);
  const [editError, setEditError] = useState("");

  const [showSubjects, setShowSubjects] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null); // type, name, id

  const fetchData = async () => {
    try {
      setLoading(true);
      const [regRes, branchRes, subjectRes] = await Promise.all([
        API.get("/admin/regulations", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        API.get("/admin/branches", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        API.get("/admin/subjects", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setRegulations(
        regRes.data.map((r) => ({
          ...r,
          numberOfSemesters: Number(r.numberOfSemesters),
        }))
      );

      setBranches(branchRes.data);

      setSubjects(
        subjectRes.data.map((s) => ({
          ...s,
          branch: s.branch?._id || s.branch || null,
          semester: Number(s.semester?.$numberInt || s.semester || 0),
        }))
      );
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteClick = (type, item) => {
    setDeleteItem({ type, name: item.name, id: item._id });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;
    try {
      await API.delete(`/admin/${deleteItem.type}/${deleteItem.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    } finally {
      setShowDeleteModal(false);
      setDeleteItem(null);
    }
  };

  const isDuplicateRegulation = (item) =>
    regulations.some(
      (r) =>
        r.name.trim().toLowerCase() === item.name.trim().toLowerCase() &&
        r._id !== item._id
    );

  const isDuplicateBranch = (item) => {
    const name = item.name.trim().toLowerCase();
    const regId = item.regulation?._id
      ? String(item.regulation._id)
      : String(item.regulation);

    return branches.some((b) => {
      const bName = b.name.trim().toLowerCase();
      const bRegId = b.regulation?._id
        ? String(b.regulation._id)
        : String(b.regulation);
      return bName === name && bRegId === regId && b._id !== item._id;
    });
  };

  const isDuplicateSubject = (item) =>
    subjects.some(
      (s) =>
        s.name.trim().toLowerCase() === item.name.trim().toLowerCase() &&
        String(s.branch) === String(item.branch) &&
        s.semester === Number(item.semester) &&
        s._id !== item._id
    );

  const handleEditSave = async () => {
    if (!editItem) return;

    for (const key of Object.keys(editItem)) {
      if (
        ["name", "code", "numberOfSemesters", "regulation"].includes(key) &&
        !String(editItem[key]).trim()
      ) {
        setEditError(`Field "${key}" cannot be empty.`);
        return;
      }
      if (key === "numberOfSemesters" && Number(editItem[key]) <= 0) {
        setEditError("Number of semesters must be greater than 0.");
        return;
      }
    }

    if (subsection === "regulations" && isDuplicateRegulation(editItem)) {
      setEditError("Regulation name already exists.");
      return;
    }
    if (subsection === "branches" && isDuplicateBranch(editItem)) {
      setEditError("Branch name already exists in this regulation.");
      return;
    }
    if (subsection === "subjects" && isDuplicateSubject(editItem)) {
      setEditError("Subject already exists in this branch and semester.");
      return;
    }

    try {
      await API.put(`/admin/${subsection}/${editItem._id}`, editItem, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditItem(null);
      setEditError("");
      fetchData();
    } catch (err) {
      setEditError(err.response?.data?.message || "Update failed");
    }
  };

  const handleClearFilters = () => {
    setSelectedReg("");
    setSelectedBranch("");
    setSelectedSemester("");
    setShowSubjects(false);
  };

  const filteredBranches = selectedReg
    ? branches.filter(
        (b) => String(b.regulation?._id || b.regulation) === selectedReg
      )
    : [];

  const filteredSubjects = subjects.filter(
    (s) =>
      String(s.branch) === selectedBranch &&
      s.semester === Number(selectedSemester)
  );

  if (loading) return <p>Loading {subsection}...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="meta-manager">
      <h2>{subsection.charAt(0).toUpperCase() + subsection.slice(1)}</h2>

      {/* regs */}
      {subsection === "regulations" && (
        <div>
          <button className="add-btn" onClick={() => setShowRegModal(true)}>
            Add New Regulation
          </button>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Semesters</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {regulations.map((r) => (
                <tr key={r._id}>
                  <td>{r.name}</td>
                  <td>{r.numberOfSemesters}</td>
                  <td>{new Date(r.createdAt).toLocaleString()}</td>
                  <td>{new Date(r.updatedAt).toLocaleString()}</td>
                  <td>
                    <button
                      className="action-btn"
                      onClick={() => setEditItem(r)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-danger action-btn"
                      onClick={() => handleDeleteClick("regulations", r)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* branches*/}
      {subsection === "branches" && (
        <div>
          <button className="add-btn" onClick={() => setShowBranchModal(true)}>
            Add New Branch
          </button>
          <select
            value={selectedReg}
            onChange={(e) => setSelectedReg(e.target.value)}
          >
            <option value="">-- Select Regulation --</option>
            {regulations.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name}
              </option>
            ))}
          </select>

          {!selectedReg && <p>Please select a regulation to see branches.</p>}

          {selectedReg && filteredBranches.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Regulation</th>
                  <th>Created At</th>
                  <th>Updated At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBranches.map((b) => (
                  <tr key={b._id}>
                    <td>{b.name}</td>
                    <td>{b.code}</td>
                    <td>
                      {regulations.find(
                        (r) =>
                          r._id === String(b.regulation?._id || b.regulation)
                      )?.name || "-"}
                    </td>
                    <td>{new Date(b.createdAt).toLocaleString()}</td>
                    <td>{new Date(b.updatedAt).toLocaleString()}</td>
                    <td>
                      <button
                        className="action-btn"
                        onClick={() => setEditItem(b)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-danger action-btn"
                        onClick={() => handleDeleteClick("branches", b)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReg && filteredBranches.length === 0 && (
            <p>No branches for selected regulation.</p>
          )}
        </div>
      )}

      {/* subs */}
      {subsection === "subjects" && (
        <div>
          <button className="add-btn" onClick={() => setShowSubjectModal(true)}>
            Add New Subject
          </button>
          <div className="filter-row">
            <div className="filter-controls">
              <label>Regulation:</label>
              <select
                value={selectedReg}
                onChange={(e) => {
                  setSelectedReg(e.target.value);
                  setSelectedBranch("");
                  setSelectedSemester("");
                  setShowSubjects(false);
                }}
              >
                <option value="">-- Select Regulation --</option>
                {regulations.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name}
                  </option>
                ))}
              </select>

              <label>Branch:</label>
              <select
                value={selectedBranch}
                onChange={(e) => {
                  setSelectedBranch(e.target.value);
                  setSelectedSemester("");
                  setShowSubjects(false);
                }}
              >
                <option value="">-- Select Branch --</option>
                {filteredBranches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>

              <label>Semester:</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
              >
                <option value="">-- Select Semester --</option>
                {Array.from(
                  {
                    length:
                      regulations.find((r) => r._id === selectedReg)
                        ?.numberOfSemesters || 0,
                  },
                  (_, i) => i + 1
                ).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <div className="btn-wrapper">
                <button
                  style={{ width: "40%", marginRight: "15px" }}
                  onClick={() => setShowSubjects(true)}
                  disabled={
                    !selectedReg || !selectedBranch || !selectedSemester
                  }
                >
                  Show Subjects
                </button>
                <button
                  style={{ width: "40%" }}
                  onClick={handleClearFilters}
                  disabled={
                    !selectedReg && !selectedBranch && !selectedSemester
                  }
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {showSubjects && filteredSubjects.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Branch</th>
                  <th>Semester</th>
                  <th>Created At</th>
                  <th>Updated At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.map((s) => (
                  <tr key={s._id}>
                    <td>{s.name}</td>
                    <td>{s.code}</td>
                    <td>
                      {branches.find((b) => b._id === s.branch)?.name || "-"}
                    </td>
                    <td>{s.semester}</td>
                    <td>{new Date(s.createdAt).toLocaleString()}</td>
                    <td>{new Date(s.updatedAt).toLocaleString()}</td>
                    <td>
                      <button
                        className="action-btn"
                        onClick={() => setEditItem(s)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-danger action-btn"
                        onClick={() => handleDeleteClick("subjects", s)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {showSubjects && filteredSubjects.length === 0 && (
            <p>No subjects found for selected filters.</p>
          )}
        </div>
      )}

      {/* add modal*/}
      {showRegModal && (
        <AddRegulationModal
          token={token}
          onClose={() => setShowRegModal(false)}
          onSuccess={fetchData}
          regulations={regulations}
        />
      )}
      {showBranchModal && (
        <AddBranchModal
          token={token}
          onClose={() => setShowBranchModal(false)}
          onSuccess={fetchData}
          regulations={regulations}
          branches={branches}
        />
      )}
      {showSubjectModal && (
        <AddSubjectModal
          token={token}
          onClose={() => setShowSubjectModal(false)}
          onSuccess={fetchData}
          regulations={regulations}
          branches={branches}
          subjects={subjects}
        />
      )}

      {/* edit modal */}
      {editItem && (
        <div className="edit-modal-overlay">
          <div className="edit-modal-content">
            <h3>Edit {subsection.slice(0, -1)}</h3>
            {editError && <p className="error">{editError}</p>}
            <div>
              {subsection === "regulations" && (
                <>
                  <label>Name:</label>
                  <input
                    value={editItem.name}
                    onChange={(e) =>
                      setEditItem({ ...editItem, name: e.target.value })
                    }
                  />
                  <label>Number of Semesters:</label>
                  <input
                    type="number"
                    min="1"
                    value={editItem.numberOfSemesters}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        numberOfSemesters: Number(e.target.value),
                      })
                    }
                  />
                </>
              )}
              {subsection === "branches" && (
                <>
                  <label>Name:</label>
                  <input
                    value={editItem.name}
                    onChange={(e) =>
                      setEditItem({ ...editItem, name: e.target.value })
                    }
                  />
                  <label>Code:</label>
                  <input
                    value={editItem.code}
                    onChange={(e) =>
                      setEditItem({ ...editItem, code: e.target.value })
                    }
                  />
                  <label>Regulation:</label>
                  <select
                    value={editItem.regulation?._id || editItem.regulation}
                    onChange={(e) =>
                      setEditItem({ ...editItem, regulation: e.target.value })
                    }
                  >
                    {regulations.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </>
              )}
              {subsection === "subjects" && (
                <>
                  <label>Name:</label>
                  <input
                    value={editItem.name}
                    onChange={(e) =>
                      setEditItem({ ...editItem, name: e.target.value })
                    }
                  />
                  <label>Code:</label>
                  <input
                    value={editItem.code}
                    onChange={(e) =>
                      setEditItem({ ...editItem, code: e.target.value })
                    }
                  />
                </>
              )}
            </div>
            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button onClick={handleEditSave}>Save</button>
              <button
                className="btn-danger"
                style={{ marginLeft: "0.5rem" }}
                onClick={() => setEditItem(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/*del modal */}
      {showDeleteModal && deleteItem && (
        <div className="edit-modal-overlay">
          <div className="edit-modal-content">
            <h3>Confirm Delete</h3>
            <p>
              {deleteItem.type === "regulations" &&
                `All branches, subjects and notes of "${deleteItem.name}" regulation will also be deleted.`}
              {deleteItem.type === "branches" &&
                `All subjects and notes of "${deleteItem.name}" branch will also be deleted.`}
              {deleteItem.type === "subjects" &&
                `All notes of "${deleteItem.name}" subject will also be deleted.`}
            </p>
            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={handleConfirmDelete}
                style={{ marginRight: "0.5rem" }}
              >
                Delete
              </button>
              <button
                className="btn-danger"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteItem(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetaManager;

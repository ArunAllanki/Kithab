// src/Components/Admin/NotesManager.jsx
import { useState, useEffect, useContext } from "react";
import API from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import "./NotesManager.css";

const NotesManager = () => {
  const { token, logout } = useContext(AuthContext);

  // Meta data
  const [regulations, setRegulations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Filters / selection
  const [selectedRegulation, setSelectedRegulation] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // Notes data
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [error, setError] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false); // track if search done

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Faculty modal state
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  // ===== Fetch all meta data once on mount =====
  useEffect(() => {
    if (!token) return;

    const fetchAllMeta = async () => {
      try {
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

        setRegulations(Array.isArray(regRes.data) ? regRes.data : []);

        const normBranches = (branchRes.data || []).map((b) => ({
          ...b,
          regulation:
            b.regulation && typeof b.regulation === "object"
              ? b.regulation._id || b.regulation
              : b.regulation || null,
        }));
        setBranches(normBranches);

        const normSubjects = (subjectRes.data || []).map((s) => ({
          ...s,
          branch:
            s.branch && typeof s.branch === "object"
              ? s.branch._id || s.branch
              : s.branch || null,
          semester: Number(s.semester?.$numberInt ?? s.semester ?? 0),
        }));
        setSubjects(normSubjects);
      } catch (err) {
        console.error("Error fetching admin meta:", err);
        if (err.response?.status === 401) logout();
        else setError("Failed to load meta data");
      }
    };

    fetchAllMeta();
  }, [token, logout]);

  // Derived lists
  const filteredBranches = branches.filter(
    (b) => String(b.regulation) === String(selectedRegulation)
  );

  const selectedRegObj = regulations.find(
    (r) => String(r._id) === String(selectedRegulation)
  );
  const semesterOptions = selectedRegObj
    ? Array.from(
        { length: Number(selectedRegObj.numberOfSemesters || 0) },
        (_, i) => i + 1
      )
    : [];

  const filteredSubjects = subjects.filter(
    (s) =>
      String(s.branch) === String(selectedBranch) &&
      Number(s.semester) === Number(selectedSemester)
  );

  // ===== Fetch notes =====
  const fetchNotes = async () => {
    setError("");
    setLoadingNotes(true);
    setSearchPerformed(true);

    try {
      const { data } = await API.get("/admin/notes", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const normalized = (data || []).map((n) => ({
        ...n,
        regulation:
          n.regulation && typeof n.regulation === "object"
            ? n.regulation._id || n.regulation
            : n.regulation,
        branch:
          n.branch && typeof n.branch === "object"
            ? n.branch._id || n.branch
            : n.branch,
        subject:
          n.subject && typeof n.subject === "object"
            ? n.subject._id || n.subject
            : n.subject,
        semester: Number(n.semester),
      }));

      const filtered = normalized.filter(
        (n) =>
          String(n.regulation) === String(selectedRegulation) &&
          String(n.branch) === String(selectedBranch) &&
          Number(n.semester) === Number(selectedSemester) &&
          String(n.subject) === String(selectedSubject)
      );

      setNotes(filtered);
    } catch (err) {
      console.error("Error fetching notes:", err);
      if (err.response?.status === 401) logout();
      else setError("Failed to fetch notes");
      setNotes([]);
    } finally {
      setLoadingNotes(false);
    }
  };

  const downloadNote = async (noteId, filename, contentType) => {
    try {
      const response = await API.get(`/admin/notes/${noteId}/file`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });

      const blob = new Blob([response.data], {
        type: contentType || response.data.type || "application/octet-stream",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "note";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download note file", err);
      if (err.response?.status === 401) logout();
      else alert("Failed to download note file");
    }
  };

  const handleDeleteClick = (note) => {
    setNoteToDelete(note);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!noteToDelete) return;
    setDeleting(true);
    try {
      await API.delete(`/admin/notes/${noteToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes((prev) => prev.filter((n) => n._id !== noteToDelete._id));
    } catch (err) {
      console.error("Error deleting note:", err);
      if (err.response?.status === 401) logout();
      else setError("Failed to delete note");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setNoteToDelete(null);
    }
  };

  useEffect(() => {
    setNotes([]);
    setSearchPerformed(false);
  }, [selectedRegulation, selectedBranch, selectedSemester, selectedSubject]);

  const handleFacultyClick = (faculty) => {
    setSelectedFaculty(faculty || null);
    setShowFacultyModal(true);
  };

  const clearFilters = () => {
    setSelectedRegulation("");
    setSelectedBranch("");
    setSelectedSemester("");
    setSelectedSubject("");
    setNotes([]);
    setSearchPerformed(false);
    setError("");
  };

  const allFiltersSelected =
    selectedRegulation && selectedBranch && selectedSemester && selectedSubject;

  return (
    <div className="notes-manager-container">
      <h2>Notes Manager (Admin)</h2>
      <div className="filters">
        <select
          value={selectedRegulation}
          onChange={(e) => {
            setSelectedRegulation(e.target.value);
            setSelectedBranch("");
            setSelectedSemester("");
            setSelectedSubject("");
          }}
        >
          <option value="">Select Regulation</option>
          {regulations.map((r) => (
            <option key={r._id} value={r._id}>
              {r.name}
            </option>
          ))}
        </select>

        <select
          value={selectedBranch}
          onChange={(e) => {
            setSelectedBranch(e.target.value);
            setSelectedSemester("");
            setSelectedSubject("");
          }}
          disabled={!filteredBranches.length}
        >
          <option value="">Select Branch</option>
          {filteredBranches.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name}
            </option>
          ))}
        </select>

        <select
          value={selectedSemester}
          onChange={(e) => {
            setSelectedSemester(e.target.value);
            setSelectedSubject("");
          }}
          disabled={!semesterOptions.length}
        >
          <option value="">Select Semester</option>
          {semesterOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          disabled={!filteredSubjects.length}
        >
          <option value="">Select Subject</option>
          {filteredSubjects.map((sub) => (
            <option key={sub._id} value={sub._id}>
              {sub.name}
            </option>
          ))}
        </select>

        <button
          className="add-btn"
          onClick={fetchNotes}
          disabled={!allFiltersSelected}
        >
          Get Notes
        </button>

        <button className="add-btn" onClick={clearFilters}>
          Clear Filters
        </button>
      </div>

      {error && <p className="error-msg">{error}</p>}

      <div className="table-container">
        {loadingNotes ? (
          <p>Loading notes...</p>
        ) : searchPerformed && notes.length === 0 ? (
          <p>No notes found</p>
        ) : notes.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Uploaded By</th>
                <th>Uploaded Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((note) => (
                <tr key={note._id}>
                  <td>{note.title}</td>
                  <td
                    className="clickable"
                    onClick={() => handleFacultyClick(note.uploadedBy)}
                  >
                    {`${note.uploadedBy?.name || "—"} (${
                      note.uploadedBy?.designation || "—"
                    })`}
                  </td>
                  <td>{new Date(note.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="action-btn"
                      onClick={() => downloadNote(note._id, note.title)}
                    >
                      Download
                    </button>
                    <button
                      className="btn-danger action-btn"
                      onClick={() => handleDeleteClick(note)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete Note</h3>
            <p>
              Are you sure you want to delete <b>{noteToDelete?.title}</b>?
            </p>
            <div className="modal-actions">
              <button
                className="action-btn"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn-danger action-btn"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* faculty modal */}
      {showFacultyModal && selectedFaculty && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Faculty Details</h2>
            <div className="faculty-dets-modal">
              <p>
                <b>Name:</b> {selectedFaculty.name || "—"}
              </p>
              <p>
                <b>Email:</b> {selectedFaculty.email || "—"}
              </p>
              <p>
                <b>Employee ID:</b> {selectedFaculty.employeeId || "—"}
              </p>
              <p>
                <b>Designation:</b> {selectedFaculty.designation || "—"}
              </p>
              <p>
                <b>Uploaded Notes:</b>{" "}
                {selectedFaculty.uploadedNotes?.length ?? "—"}
              </p>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowFacultyModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesManager;

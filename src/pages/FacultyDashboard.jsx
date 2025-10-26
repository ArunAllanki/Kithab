import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API, { setAuthToken } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../Components/Navbar";
import "./FacultyDashboard.css";

const FacultyDashboard = () => {
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [regulations, setRegulations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedRegulation, setSelectedRegulation] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [files, setFiles] = useState([]);

  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || user.role !== "faculty") {
      navigate("/login");
      return;
    }

    setAuthToken(token);

    const fetchMeta = async () => {
      try {
        const regRes = await API.get("/meta/regulations");
        const branchRes = await API.get("/meta/branches");
        const subjectRes = await API.get("/meta/subjects?populateBranch=true");

        setRegulations(regRes.data.regulations);
        setBranches(branchRes.data.branches);
        setSubjects(subjectRes.data.subjects);
      } catch (err) {
        console.error("Error fetching meta data:", err);
      }
    };

    const fetchUploads = async () => {
      try {
        const res = await API.get("/notes/my-uploads");
        setUploads(res.data);
      } catch (err) {
        console.error("Error fetching uploads:", err);
      }
    };

    fetchMeta();
    fetchUploads();
  }, [token, user, navigate]);

  const filteredBranches = branches.filter(
    (b) => b.regulation?._id === selectedRegulation
  );

  const filteredSubjects = subjects.filter(
    (s) =>
      s.branch?._id === selectedBranch &&
      s.semester.toString() === selectedSemester
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !selectedRegulation ||
      !selectedBranch ||
      !selectedSemester ||
      !selectedSubject
    ) {
      alert("Please select all fields");
      return;
    }

    if (!files || files.length === 0) {
      alert("Please select file(s)");
      return;
    }

    const formData = new FormData();
    formData.append("regulation", selectedRegulation);
    formData.append("branch", selectedBranch);
    formData.append("semester", selectedSemester);
    formData.append("subject", selectedSubject);
    formData.append("uploadedBy", user._id);

    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      setLoading(true);
      await API.post("/notes/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Notes uploaded successfully ✅");

      // Reset form
      setSelectedRegulation("");
      setSelectedBranch("");
      setSelectedSemester("");
      setSelectedSubject("");
      setFiles([]);

      const res = await API.get("/notes/my-uploads");
      setUploads(res.data);
    } catch (err) {
      console.error("Upload notes error:", err);
      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        logout();
        navigate("/login");
      } else {
        alert("Upload failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewFile = async (note) => {
    try {
      const res = await API.get(`/notes/${note._id}`, {
        responseType: "blob",
      });

      const contentType =
        res.headers["content-type"] || "application/octet-stream";

      const file = new Blob([res.data], { type: contentType });
      const fileURL = URL.createObjectURL(file);

      window.open(fileURL, "_blank");
      setTimeout(() => URL.revokeObjectURL(fileURL), 10000);
    } catch (err) {
      console.error("Error fetching file:", err);
      alert("Failed to fetch file.");
    }
  };

  if (!token || user.role !== "faculty") return <p>Redirecting...</p>;

  return (
    <div className="FD-container">
      <Navbar />

      <div className="hero-container">
        {/* Upload Section */}
        <div className="part upload">
          <h2>Welcome, {user?.name}</h2>
          <h3>Upload Notes</h3>
          <form className="upload-form" onSubmit={handleSubmit}>
            <select
              value={selectedRegulation}
              onChange={(e) => {
                setSelectedRegulation(e.target.value);
                setSelectedBranch("");
                setSelectedSubject("");
              }}
              required
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
                setSelectedSubject("");
              }}
              required
              disabled={!selectedRegulation}
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
              required
              disabled={!selectedBranch}
            >
              <option value="">Select Semester</option>
              {[...Array(8)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              required
              disabled={!selectedSemester}
            >
              <option value="">Select Subject</option>
              {filteredSubjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>

            <input
              type="file"
              multiple
              onChange={(e) => setFiles([...e.target.files])}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? <span className="btn-spinner"></span> : "Upload"}
            </button>
          </form>
        </div>

        {/* My Uploads Section */}
        <div className="part uploads">
          <h3>📂 My Uploads</h3>
          {uploads.length === 0 ? (
            <p>No uploads yet.</p>
          ) : (
            <ul className="uploads-list">
              {uploads.map((note) => (
                <li key={note._id} className="upload-card">
                  <h4>{note.title}</h4>
                  <p>
                    <b>{note.regulation?.name}</b> | <b>Branch:</b>{" "}
                    {note.branch?.name} | <b>Subject:</b> {note.subject?.name} |{" "}
                    <b>Sem:</b> {note.semester}
                  </p>
                  <button
                    onClick={() => handleViewFile(note)}
                    className="view-file-btn"
                  >
                    View File
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;

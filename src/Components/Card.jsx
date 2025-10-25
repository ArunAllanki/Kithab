import React, { useState, useEffect } from "react";
import "./Card.css";
import { FaStar, FaRegStar } from "react-icons/fa";

const Card = ({ note, backend, user, token, onFavUpdate }) => {
  const [downloading, setDownloading] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [isFav, setIsFav] = useState(false);

  // Set initial favorite state safely
  useEffect(() => {
    setIsFav(user?.favoriteNotes?.includes(note._id) ?? false);
  }, [user, note._id]);

  // Download file
  const handleDownload = async () => {
    try {
      setDownloading(true);
      const res = await fetch(`${backend}/notes/${note._id}`
      );

      if (!res.ok) throw new Error("Failed to fetch file");
      const blob = await res.blob();

      const extension = note.filename?.split(".").pop() || "pdf";
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${note.title || "file"}.${extension}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {                       
      console.error(err);
      alert("Failed to download file");
    } finally {
      setDownloading(false);
    }
  };

  // View file in new tab
  const handleView = async () => {
    try {
      setViewing(true);
      const res = await fetch(`${backend}/notes/${note._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch file for viewing");
      const blob = await res.blob();

      // Determine MIME type fallback
      const extension = note.filename?.split(".").pop().toLowerCase();
      let mime = blob.type;
      if (!mime || mime === "application/octet-stream") {
        if (extension === "pdf") mime = "application/pdf";
        else if (extension === "doc") mime = "application/msword";
        else if (extension === "docx")
          mime =
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      }

      const blobUrl = window.URL.createObjectURL(
        new Blob([blob], { type: mime })
      );
      window.open(blobUrl, "_blank");
    } catch (err) {
      console.error(err);
      alert("Failed to view file");
    } finally {
      setViewing(false);
    }
  };

  const toggleFavourite = async () => {
    try {
      const method = isFav ? "DELETE" : "POST";
      const res = await fetch(`${backend}/notes/${note._id}/favorite`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to update favourite");
      const data = await res.json();
      setIsFav(!isFav);
      if (onFavUpdate) onFavUpdate(data.favoriteNotes);
    } catch (err) {
      console.error(err);
      alert("Could not update favourite status");
    }
  };

  return (
    <li className="note-card">
      <div className="note-info">
        <div className="title-row">
          <strong className="title">{note.title}</strong>
          {/* <span className="fav-icon" onClick={toggleFavourite}>
            {isFav ? <FaStar color="#FFD700" /> : <FaRegStar />}
          </span> */}
        </div>
        <p>Regulation: {note.regulation?.name}</p>
        <p>Branch: {note.branch?.name}</p>
        <p>
          Subject: {note.subject?.name} ({note.subject?.code})
        </p>
        <p>Semester: {note.semester}</p>
        <p className="metaData">
          Uploaded by <strong>{note.uploadedBy?.name || "Unknown"}</strong> on{" "}
          <strong>{new Date(note.createdAt).toLocaleDateString()}</strong>
        </p>
      </div>

      <div className="actions">
        <button
          className="view-btn action-btn"
          onClick={handleView}
          disabled={viewing}
        >
          {viewing ? "Opening..." : "View"}
        </button>

        <button
          className="download-btn action-btn"
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? (
            <span className="spinner">Downloading..</span>
          ) : (
            "Download"
          )}
        </button>
      </div>
    </li>
  );
};

export default Card;

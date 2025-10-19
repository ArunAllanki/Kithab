import { useState, useEffect } from "react";
import API from "../../services/api";

const UserManager = ({ token, userType }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editUser, setEditUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/admin/users?role=${userType}`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
    } catch (err) { setError(err.response?.data?.message || "Fetch failed"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [userType]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try { await API.delete(`/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } }); fetchUsers(); }
    catch(err){ alert(err.response?.data?.message || "Delete failed"); }
  };

  const handleEditSave = async () => {
    try {
      await API.put(`/admin/users/${editUser._id}`, editUser, { headers: { Authorization: `Bearer ${token}` } });
      setEditUser(null);
      fetchUsers();
    } catch(err){ alert(err.response?.data?.message || "Update failed"); }
  };

  if(loading) return <p>Loading {userType}...</p>;
  if(error) return <p style={{color:"red"}}>{error}</p>;

  return (
    <div>
      <h2>{userType.charAt(0).toUpperCase()+userType.slice(1)}</h2>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            {users[0] && Object.keys(users[0]).filter(k=>!["_id","__v","password"].includes(k)).map(k=><th key={k}>{k}</th>)}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u=>(
            <tr key={u._id}>
              {Object.keys(u).filter(k=>!["_id","__v","password"].includes(k)).map(k=><td key={k}>{u[k]}</td>)}
              <td>
                <button onClick={()=>setEditUser(u)}>Edit</button>
                <button onClick={()=>handleDelete(u._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editUser && (
        <div style={{
          position:"fixed", top:0,left:0,width:"100%",height:"100%",
          backgroundColor:"rgba(0,0,0,0.5)", display:"flex",
          justifyContent:"center", alignItems:"center", zIndex:999
        }}>
          <div style={{background:"#fff", padding:"2rem", borderRadius:"8px", minWidth:"300px"}}>
            {Object.keys(editUser).filter(k=>!["_id","__v","password"].includes(k)).map(k=>(
              <div key={k}>
                <label>{k}: </label>
                <input value={editUser[k]} onChange={e=>setEditUser({...editUser, [k]: e.target.value})}/>
              </div>
            ))}
            <button onClick={handleEditSave}>Save</button>
            <button onClick={()=>setEditUser(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;

// src/pages/Login.jsx
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "../Assets/kithabImg.png";
import "./Login.css";

const Login = () => {
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [branch, setBranch] = useState("");
  const [invalidLogin, setInvalidLogin] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user) return;
    if (user.role === "admin") navigate("/admin");
    else if (user.role === "faculty") navigate("/faculty");
    else if (user.role === "student") navigate("/student");
  }, [user, navigate]);

  const clearFields = () => {
    setId("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setEmail("");
    setBranch("");
  };

  const validateRegister = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Full name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Invalid email format";
    if (!id.trim()) newErrors.id = "Roll number is required";
    if (!branch) newErrors.branch = "Branch is required";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInvalidLogin(false);

    try {
      if (isLogin) {
        const result = await login(id, password);
        if (!result.success) {
          setInvalidLogin(true);
          clearFields();
          return;
        }
        // navigation handled by useEffect after user is set
      } else {
        if (!validateRegister()) return;

        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL.replace(
            /\/$/,
            ""
          )}/auth/student/register`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name,
              email,
              rollNumber: id,
              password,
              branch,
            }),
          }
        );

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Registration failed");
        }

        alert("Registration successful! Please login.");
        setIsLogin(true);
        clearFields();
      }
    } catch (err) {
      console.error("[Login] submit error:", err);
      setInvalidLogin(true);
      clearFields();
    }
  };

  return (
    <div className="login-wrapper">
      <div className="background">
        {[...Array(8)].map((_, i) => (
          <span key={i} className="ball" />
        ))}
      </div>
      <div className="form-container">
        <form className="form" onSubmit={handleSubmit}>
          <img className="logo" src={logo} alt="logo" />
          <div className="form-tabs">
            <h2
              className={isLogin ? "tab selected" : "tab"}
              onClick={() => {
                setIsLogin(true);
                setInvalidLogin(false);
                setErrors({});
              }}
            >
              Login
            </h2>
            <h2
              className={!isLogin ? "tab selected" : "tab"}
              onClick={() => {
                setIsLogin(false);
                setInvalidLogin(false);
                setErrors({});
              }}
            >
              Register
            </h2>
          </div>

          {!isLogin ? (
            <>
              <p className="para">Only for students!!</p>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && <p className="error">{errors.name}</p>}

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <p className="error">{errors.email}</p>}

              <input
                type="text"
                placeholder="Roll Number"
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
              {errors.id && <p className="error">{errors.id}</p>}

              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              >
                <option value="">Select Branch</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
              </select>
              {errors.branch && <p className="error">{errors.branch}</p>}

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && <p className="error">{errors.password}</p>}

              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {errors.confirmPassword && (
                <p className="error">{errors.confirmPassword}</p>
              )}
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="RollNo / EmployeeID / Admin ID"
                value={id}
                onChange={(e) => setId(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </>
          )}

          {invalidLogin && isLogin && (
            <p className="para error">Invalid login credentials !!</p>
          )}
          <button type="submit">{isLogin ? "Login" : "Register"}</button>
        </form>
      </div>
      <div className="illustration" />
    </div>
  );
};

export default Login;

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
  const [loading, setLoading] = useState(false);

  const [registerMessage, setRegisterMessage] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotRole, setForgotRole] = useState("");
  const [forgotId, setForgotId] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

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
    setRegisterMessage("");
    setRegisterSuccess(false);
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
    setLoading(true);
    setRegisterMessage("");

    try {
      if (isLogin) {
        const result = await login(id, password);
        if (!result.success) {
          setInvalidLogin(true);
          clearFields();
          setLoading(false);
          return;
        }
      } else {
        if (!validateRegister()) {
          setLoading(false);
          return;
        }
        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/auth/student/register`,
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
          setRegisterMessage(data.message || "Registration failed");
          setRegisterSuccess(false);
          setLoading(false);
          return;
        }
        setRegisterMessage("Registration successful! Please login.");
        setRegisterSuccess(true);
        setIsLogin(true);
        clearFields();
      }
    } catch (err) {
      console.error(err);
      setRegisterMessage("Something went wrong. Try again.");
      setRegisterSuccess(false);
      clearFields();
    } finally {
      setLoading(false);
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
                setRegisterMessage("");
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
                setRegisterMessage("");
              }}
            >
              Register
            </h2>
          </div>

          <div className="form-fields-wrapper">
            {!isLogin ? (
              <>
                <p className="para">Only for students!!</p>

                {errors.name && <p className="reg-error">{errors.name}</p>}
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                {errors.email && <p className="reg-error">{errors.email}</p>}
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                {errors.id && <p className="reg-error">{errors.id}</p>}
                <input
                  type="text"
                  placeholder="Roll Number"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                />

                {errors.branch && <p className="reg-error">{errors.branch}</p>}
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

                {errors.password && (
                  <p className="reg-error">{errors.password}</p>
                )}
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                {errors.confirmPassword && (
                  <p className="reg-error">{errors.confirmPassword}</p>
                )}
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                {registerMessage && (
                  <p
                    className="para"
                    style={{ color: registerSuccess ? "green" : "red" }}
                  >
                    {registerMessage}
                  </p>
                )}
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Login Id"
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
                <div
                  className="forgot-link"
                  onClick={() => setShowForgotModal(true)}
                >
                  Forgot Password ?
                </div>
              </>
            )}
          </div>

          {invalidLogin && isLogin && (
            <p className="para error">Invalid login credentials !!</p>
          )}

          <div className="login-btn-wrapper">
            <button type="submit" disabled={loading}>
              {loading ? (
                <span className="spinner" />
              ) : isLogin ? (
                "Login"
              ) : (
                "Register"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Forgot Password</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!forgotRole || !forgotId) {
                  setForgotMessage("Please select role and enter ID");
                  setForgotSuccess(false);
                  return;
                }
                setForgotLoading(true);
                setForgotMessage("");
                try {
                  const res = await fetch(
                    `${process.env.REACT_APP_BACKEND_URL}/auth/forgot-password`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ role: forgotRole, id: forgotId }),
                    }
                  );
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.message || "Error");

                  setForgotMessage(data.message);
                  setForgotSuccess(true);

                  // ✅ Reset modal fields on success
                  setForgotRole("");
                  setForgotId("");
                } catch (err) {
                  setForgotMessage(err.message);
                  setForgotSuccess(false);
                } finally {
                  setForgotLoading(false);
                }
              }}
            >
              <select
                value={forgotRole}
                onChange={(e) => setForgotRole(e.target.value)}
                required
              >
                <option value="">Select Role</option>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
              </select>

              <input
                type="text"
                placeholder={
                  forgotRole === "faculty" ? "Employee ID" : "Roll Number"
                }
                value={forgotId}
                onChange={(e) => setForgotId(e.target.value)}
                required
              />

              <div className="modal-btn-group">
                <button type="submit" disabled={forgotLoading || forgotSuccess}>
                  {forgotLoading ? <span className="spinner" /> : "Reset"}
                </button>
                <button
                  type="button"
                  className="close-btn"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotRole("");
                    setForgotId("");
                    setForgotMessage("");
                    setForgotSuccess(false);
                  }}
                >
                  Close
                </button>
              </div>
            </form>

            {forgotMessage && (
              <p
                style={{
                  marginTop: "10px",
                  color: forgotSuccess ? "green" : "red",
                  fontWeight: "500",
                }}
              >
                {forgotMessage}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="illustration" />
    </div>
  );
};

export default Login;

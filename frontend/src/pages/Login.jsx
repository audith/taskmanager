import { useState } from "react";
import { login } from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setError("");
      const data = await login(email, password);

      if (!data.access_token) {
        setError("Invalid credentials");
        return;
      }

      localStorage.setItem("token", data.access_token);
      const payload = JSON.parse(atob(data.access_token.split(".")[1]));

      if (payload.is_admin) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Login</h2>
        
        {error && <div className="error">{error}</div>}

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleLogin()}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleLogin()}
        />

        <button onClick={handleLogin}>Login</button>

        <div className="nav-links">
          <Link to="/register">Don't have an account? Register</Link>
        </div>
      </div>
    </div>
  );
}
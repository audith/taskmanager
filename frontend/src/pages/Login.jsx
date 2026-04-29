import { useState } from "react";
import { login } from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    const data = await login(email, password);

    if (data.access_token) {
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("is_admin", data.is_admin || false);

      if (data.is_admin) navigate("/admin");
      else navigate("/dashboard");
    } else {
      alert("Invalid login");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Login</h2>

        <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" onChange={(e) => setPassword(e.target.value)} />

        <button onClick={handleLogin}>Login</button>

        <p>
          Don't have account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
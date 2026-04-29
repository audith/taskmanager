import { useState } from "react";
import { register } from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    const data = await register(email, password);

    if (data.id) {
      navigate("/");
    } else {
      alert("Register failed");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Register</h2>

        <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" onChange={(e) => setPassword(e.target.value)} />

        <button onClick={handleRegister}>Register</button>

        <p>
          Already have account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}
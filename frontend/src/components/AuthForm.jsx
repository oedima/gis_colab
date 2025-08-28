import { useState } from "react";

export default function AuthForm({ onAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="auth-container">
        <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
                <h2>Login / Signup</h2>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" /><br/>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" /><br/>
                <button onClick={() => onAuth("signin", email, password)}>Login</button>
                <button onClick={() => onAuth("signup", email, password)}>Signup</button>
            </div>
        </div>
    </div>
  );
}

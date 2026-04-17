import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import api from "../services/api";
import { isAuthenticated } from "../services/auth";
import "./Login.css";

export default function Login() {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" />;
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      // Mocking the API response for now to ensure it works smoothly
      // const response = await api.post("/login", { email, password });
      
      const mockedResponse = {
        data: {
          token: "mock-token-12345",
          user: { email, cargo: "contador" },
        }
      };
      
      localStorage.setItem("token", mockedResponse.data.token);
      localStorage.setItem("user", JSON.stringify(mockedResponse.data.user));

      navigate("/dashboard");
    } catch (err) {
      setError("Email ou senha inválidos");
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Sistema Contábil</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit">Entrar</button>
        </form>

        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

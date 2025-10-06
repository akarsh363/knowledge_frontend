import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import Navbar from "../Components/Navbar";
import { saveAuth } from "../utils/auth";
import "../styles/global.css";
import dp from "../assets/default_dp.png";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [profileFile, setProfileFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!profileFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(profileFile);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [profileFile]);

  // Password validation helper
  function validatePasswordRules(pw) {
    const lengthOk = pw.length >= 8;
    const hasUpper = /[A-Z]/.test(pw);
    const hasLower = /[a-z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>[\]\\\/`~_+=;'-]/.test(pw);
    return {
      ok: lengthOk && hasUpper && hasLower && hasNumber && hasSpecial,
      lengthOk,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
    };
  }

  // Email validation helper
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Full name validation helper (letters + numbers + spaces, min 3 chars)
  function validateFullName(name) {
    return /^[A-Za-z0-9 ]{3,}$/.test(name.trim());
  }

  // DepartmentId validation helper (1 to 8 only)
  function validateDepartmentId(val) {
    const num = Number(val);
    return Number.isInteger(num) && num >= 1 && num <= 8;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Full Name check
    if (!validateFullName(fullName)) {
      setError("Full Name must be at least 3 characters (letters, numbers, spaces allowed).");
      return;
    }

    // Email check
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Password check
    const pwCheck = validatePasswordRules(password);
    if (!pwCheck.ok) {
      const missing = [];
      if (!pwCheck.lengthOk) missing.push("at least 8 characters");
      if (!pwCheck.hasUpper) missing.push("one uppercase letter");
      if (!pwCheck.hasLower) missing.push("one lowercase letter");
      if (!pwCheck.hasNumber) missing.push("one number");
      if (!pwCheck.hasSpecial) missing.push("one special character");
      setError("Password must contain: " + missing.join(", "));
      return;
    }

    // Confirm password check
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Department check
    if (departmentId !== "" && !validateDepartmentId(departmentId)) {
      setError("Department ID must be a number between 1 and 8.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("FullName", fullName.trim());
      formData.append("Email", email.trim());
      formData.append("Password", password);

      if (departmentId !== "") {
        formData.append("DepartmentId", Number(departmentId));
      }
      if (profileFile) formData.append("ProfilePicture", profileFile);

      const res = await api.post("/Auth/register", formData);

      saveAuth(res.data);
      navigate("/feed");
    } catch (err) {
      console.error("Signup error:", err);
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message;
      setError(serverMsg || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Navbar />
      <main className="container" style={{ marginTop: "4rem" }}>
        <form className="card" onSubmit={handleSubmit} encType="multipart/form-data">
          <h2 className="mb-3">Create Account</h2>

          <label>Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
          />

          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />

          <label>Department</label>
          <input
            type="number"
            value={departmentId}
            onChange={e => setDepartmentId(e.target.value)}
            min="1"
            max="8"
          />

          <label>Profile Picture (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setProfileFile(e.target.files?.[0] ?? null)}
          />

          <div style={{ marginTop: 8 }}>
            <img
              src={previewUrl || dp}
              alt="preview"
              style={{ width: 80, height: 80, borderRadius: "50%" }}
            />
          </div>

          {error && (
            <div style={{ color: "crimson", marginTop: 10 }}>
              {error}
            </div>
          )}

          <button className="btn mt-3" type="submit" disabled={loading}>
            {loading ? "Signing up..." : "Sign up"}
          </button>

          <div style={{ marginTop: 10, fontSize: 12, color: "#555" }}>
            Password must be at least 8 characters and include uppercase, lowercase, a number and a special character.
          </div>
        </form>
      </main>
    </div>
  );
}
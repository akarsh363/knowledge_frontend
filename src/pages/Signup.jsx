// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../utils/api";
// import Navbar from "../Components/Navbar";
// import { saveAuth } from "../utils/auth";
// import "../styles/global.css";
// import dp from "../assets/default_dp.png";

// export default function Signup() {
//   const [fullName, setFullName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [departmentId, setDepartmentId] = useState("");
//   const [profileFile, setProfileFile] = useState(null);
//   const [previewUrl, setPreviewUrl] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!profileFile) {
//       setPreviewUrl(null);
//       return;
//     }
//     const url = URL.createObjectURL(profileFile);
//     setPreviewUrl(url);
//     return () => {
//       // revoke the created object URL to avoid memory leaks
//       URL.revokeObjectURL(url);
//     };
//   }, [profileFile]);

//   async function handleSubmit(e) {
//     e.preventDefault();
//     if (password !== confirmPassword) {
//       alert("Passwords do not match");
//       return;
//     }

//     setLoading(true);
//     try {
//       const formData = new FormData();
//       formData.append("FullName", fullName.trim());
//       formData.append("Email", email.trim());
//       formData.append("Password", password);

//       if (departmentId !== "") {
//         // ensure we send a number
//         formData.append("DepartmentId", Number(departmentId));
//       }
//       if (profileFile) formData.append("ProfilePicture", profileFile);

//       // Use the full API path the backend exposes
//       // If your axios baseURL already includes /api, use "/Auth/register" instead.
//       const res = await api.post("/api/auth/register", formData);
//       // If saveAuth expects the whole response object, keep as is; otherwise pass token: saveAuth(res.data.token)
//       saveAuth(res.data);

//       navigate("/feed");
//     } catch (err) {
//       console.error("Signup error:", err);
//       // Prefer server message when present
//       const serverMsg = err?.response?.data?.message || err?.response?.data || err?.message;
//       alert(serverMsg || "Signup failed");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div>
//       <Navbar />
//       <main className="container" style={{ marginTop: "4rem" }}>
//         <form className="card" onSubmit={handleSubmit} encType="multipart/form-data">
//           <h2 className="mb-3">Create Account</h2>

//           <label>Full Name</label>
//           <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required />

//           <label>Email</label>
//           <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />

//           <label>Password</label>
//           <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />

//           <label>Confirm Password</label>
//           <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />

//           <label>Department </label>
//           <input type="number" value={departmentId} onChange={e => setDepartmentId(e.target.value)} />

//           <label>Profile Picture (optional)</label>
//           <input type="file" accept="image/*" onChange={e => setProfileFile(e.target.files?.[0] ?? null)} />

//           <div style={{ marginTop: 8 }}>
//             <img
//               src={previewUrl || dp}
//               alt="preview"
//               style={{ width: 80, height: 80, borderRadius: "50%" }}
//             />
//           </div>

//           <button className="btn mt-3" type="submit" disabled={loading}>
//             {loading ? "Signing up..." : "Sign up"}
//           </button>
//         </form>
//       </main>
//     </div>
//   );
// }

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

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
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

      // api.baseURL already includes /api, so we just use "/Auth/register"
      const res = await api.post("/Auth/register", formData);

      saveAuth(res.data);
      navigate("/feed");
    } catch (err) {
      console.error("Signup error:", err);
      const serverMsg = err?.response?.data?.message || err?.response?.data || err?.message;
      alert(serverMsg || "Signup failed");
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
          <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required />

          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />

          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />

          <label>Confirm Password</label>
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />

          <label>Department </label>
          <input type="number" value={departmentId} onChange={e => setDepartmentId(e.target.value)} />

          <label>Profile Picture (optional)</label>
          <input type="file" accept="image/*" onChange={e => setProfileFile(e.target.files?.[0] ?? null)} />

          <div style={{ marginTop: 8 }}>
            <img
              src={previewUrl || dp}
              alt="preview"
              style={{ width: 80, height: 80, borderRadius: "50%" }}
            />
          </div>

          <button className="btn mt-3" type="submit" disabled={loading}>
            {loading ? "Signing up..." : "Sign up"}
          </button>
        </form>
      </main>
    </div>
  );
}

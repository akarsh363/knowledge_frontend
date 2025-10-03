// export function saveAuth({
//   token,
//   userId,
//   role,
//   departmentId,
//   profilePicture,
//   fullName,
// }) {
//   localStorage.setItem("fnf_token", token);
//   localStorage.setItem("fnf_userId", userId);
//   localStorage.setItem("fnf_role", role);
//   if (departmentId) localStorage.setItem("fnf_departmentId", departmentId); // 🔹 added
//   if (profilePicture) localStorage.setItem("fnf_profile", profilePicture);
//   if (fullName) localStorage.setItem("fnf_fullName", fullName);
// }

// export function logout() {
//   localStorage.removeItem("fnf_token");
//   localStorage.removeItem("fnf_userId");
//   localStorage.removeItem("fnf_role");
//   localStorage.clear();
// }

// export function getAuth() {
//   return {
//     token: localStorage.getItem("fnf_token"),
//     userId: localStorage.getItem("fnf_userId"),
//     role: localStorage.getItem("fnf_role"),
//     departmentId: localStorage.getItem("fnf_departmentId"), // 🔹 added
//     profile: localStorage.getItem("fnf_profile"),
//     fullName: localStorage.getItem("fnf_fullName"),
//   };
// }

// export function isAuthenticated() {
//   return !!localStorage.getItem("fnf_token");
// }

/**
 * Auth helper utilities.
 * Keeps the same keys and behavior as in your provided snippet:
 * - fnf_token
 * - fnf_userId
 * - fnf_role
 * - fnf_departmentId (optional)
 * - fnf_profile
 * - fnf_fullName
 */

export function saveAuth({
  token,
  userId,
  role,
  departmentId,
  profilePicture,
  fullName,
}) {
  try {
    if (token !== undefined && token !== null) {
      localStorage.setItem("fnf_token", token);
    }
    if (userId !== undefined && userId !== null) {
      localStorage.setItem("fnf_userId", userId);
    }
    if (role !== undefined && role !== null) {
      localStorage.setItem("fnf_role", role);
    }
    if (departmentId !== undefined && departmentId !== null) {
      localStorage.setItem("fnf_departmentId", departmentId);
    }
    if (profilePicture !== undefined && profilePicture !== null) {
      localStorage.setItem("fnf_profile", profilePicture);
    }
    if (fullName !== undefined && fullName !== null) {
      localStorage.setItem("fnf_fullName", fullName);
    }
  } catch (e) {
    console.warn("saveAuth failed:", e);
  }
}

export function logout() {
  try {
    localStorage.removeItem("fnf_token");
    localStorage.removeItem("fnf_userId");
    localStorage.removeItem("fnf_role");
    // original behavior also cleared everything — keep it for compatibility
    localStorage.clear();
  } catch (e) {
    // ignore
  }
}

export function getAuth() {
  try {
    return {
      token: localStorage.getItem("fnf_token"),
      userId: localStorage.getItem("fnf_userId"),
      role: localStorage.getItem("fnf_role"),
      departmentId: localStorage.getItem("fnf_departmentId"),
      profile: localStorage.getItem("fnf_profile"),
      fullName: localStorage.getItem("fnf_fullName"),
    };
  } catch (e) {
    return {
      token: null,
      userId: null,
      role: null,
      departmentId: null,
      profile: null,
      fullName: null,
    };
  }
}

export function isAuthenticated() {
  try {
    return !!localStorage.getItem("fnf_token");
  } catch (e) {
    return false;
  }
}

// export function saveAuth({
//   token,
//   userId,
//   role,
//   departmentId,
//   profilePicture,
//   fullName,
// }) {
//   try {
//     if (token !== undefined && token !== null) {
//       localStorage.setItem("fnf_token", token);
//     }
//     if (userId !== undefined && userId !== null) {
//       localStorage.setItem("fnf_userId", userId);
//     }
//     if (role !== undefined && role !== null) {
//       localStorage.setItem("fnf_role", role);
//     }
//     if (departmentId !== undefined && departmentId !== null) {
//       localStorage.setItem("fnf_departmentId", departmentId);
//     }
//     if (profilePicture !== undefined && profilePicture !== null) {
//       localStorage.setItem("fnf_profile", profilePicture);
//     }
//     if (fullName !== undefined && fullName !== null) {
//       localStorage.setItem("fnf_fullName", fullName);
//     }
//   } catch (e) {
//     console.warn("saveAuth failed:", e);
//   }
// }

// export function logout() {
//   try {
//     localStorage.removeItem("fnf_token");
//     localStorage.removeItem("fnf_userId");
//     localStorage.removeItem("fnf_role");
//     // original behavior also cleared everything — keep it for compatibility
//     // localStorage.clear();
//   } catch (e) {
//     // ignore
//   }
// }

// export function getAuth() {
//   try {
//     return {
//       token: localStorage.getItem("fnf_token"),
//       userId: localStorage.getItem("fnf_userId"),
//       role: localStorage.getItem("fnf_role"),
//       departmentId: localStorage.getItem("fnf_departmentId"),
//       profile: localStorage.getItem("fnf_profile"),
//       fullName: localStorage.getItem("fnf_fullName"),
//     };
//   } catch (e) {
//     return {
//       token: null,
//       userId: null,
//       role: null,
//       departmentId: null,
//       profile: null,
//       fullName: null,
//     };
//   }
// }

// export function isAuthenticated() {
//   try {
//     return !!localStorage.getItem("fnf_token");
//   } catch (e) {
//     return false;
//   }
// }

// src/utils/auth.js
// central auth helpers used across the app

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
      // store as string for consistency
      localStorage.setItem("fnf_userId", String(userId));
    }
    if (role !== undefined && role !== null) {
      localStorage.setItem("fnf_role", String(role));
    }
    if (departmentId !== undefined && departmentId !== null) {
      localStorage.setItem("fnf_departmentId", String(departmentId));
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
    localStorage.removeItem("fnf_departmentId");
    localStorage.removeItem("fnf_profile");
    localStorage.removeItem("fnf_fullName");
    // keep behavior minimal to avoid side-effects elsewhere
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

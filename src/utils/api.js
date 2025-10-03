// // // // // import axios from "axios";

// // // // // const api = axios.create({
// // // // //   baseURL: import.meta.env.VITE_API_BASE || "http://localhost:5058/api",
// // // // //   timeout: 10000,
// // // // // });

// // // // // // // const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5157'
// // // // // // const imgUrl = profile?.profilePicture
// // // // // //   ? `${api.defaults.baseURL}/${profile.profilePicture}`
// // // // // //   : null
// // // // // // Request interceptor to add auth token
// // // // // api.interceptors.request.use(
// // // // //   (config) => {
// // // // //     const token = localStorage.getItem("fnf_token");
// // // // //     if (token) {
// // // // //       config.headers.Authorization = `Bearer ${token}`;
// // // // //     }
// // // // //     return config;
// // // // //   },
// // // // //   (error) => {
// // // // //     return Promise.reject(error);
// // // // //   }
// // // // // );

// // // // // // Response interceptor to handle errors
// // // // // api.interceptors.response.use(
// // // // //   (response) => response,
// // // // //   (error) => {
// // // // //     if (error.response?.status === 401) {
// // // // //       // Clear auth and redirect to login
// // // // //       localStorage.clear();
// // // // //       window.location.href = "/login";
// // // // //     }
// // // // //     return Promise.reject(error);
// // // // //   }
// // // // // );

// // // // // export default api;

// // // // import axios from "axios";

// // // // /**
// // // //  * axios instance for API calls
// // // //  * NOTE: default baseURL intentionally kept as your original value:
// // // //  * "http://localhost:5058/api" — change via VITE_API_BASE env var if needed.
// // // //  */
// // // // const api = axios.create({
// // // //   baseURL: import.meta.env.VITE_API_BASE || "http://localhost:5058/api",
// // // //   timeout: 10000,
// // // // });

// // // // // Request interceptor to add auth token
// // // // api.interceptors.request.use(
// // // //   (config) => {
// // // //     try {
// // // //       const token = localStorage.getItem("fnf_token");
// // // //       if (token) {
// // // //         // ensure headers object exists
// // // //         config.headers = config.headers || {};
// // // //         config.headers.Authorization = `Bearer ${token}`;
// // // //       }
// // // //     } catch (e) {
// // // //       // ignore localStorage access issues in some environments
// // // //     }
// // // //     return config;
// // // //   },
// // // //   (error) => {
// // // //     return Promise.reject(error);
// // // //   }
// // // // );

// // // // // Response interceptor to handle errors (unchanged behavior)
// // // // api.interceptors.response.use(
// // // //   (response) => response,
// // // //   (error) => {
// // // //     if (error.response?.status === 401) {
// // // //       // Clear auth and redirect to login (keeps original behavior)
// // // //       try {
// // // //         localStorage.clear();
// // // //       } catch (e) {
// // // //         /* ignore */
// // // //       }
// // // //       if (typeof window !== "undefined") {
// // // //         window.location.href = "/login";
// // // //       }
// // // //     }
// // // //     return Promise.reject(error);
// // // //   }
// // // // );

// // // // export default api;

// // // // src/utils/api.js
// // // import axios from "axios";

// // // /**
// // //  * axios instance for API calls
// // //  * -> IMPORTANT: baseURL points to backend host WITHOUT a trailing "/api"
// // //  *    so calling api.post("/api/auth/register") results in:
// // //  *    http://localhost:5058/api/auth/register  (correct)
// // //  */
// // // const api = axios.create({
// // //   baseURL: import.meta.env.VITE_API_BASE || "http://localhost:5058", // <-- no trailing /api
// // //   timeout: 10000,
// // // });

// // // // Request interceptor to add auth token
// // // api.interceptors.request.use(
// // //   (config) => {
// // //     try {
// // //       const token = localStorage.getItem("fnf_token");
// // //       if (token) {
// // //         config.headers = config.headers || {};
// // //         config.headers.Authorization = `Bearer ${token}`;
// // //       }
// // //     } catch (e) {
// // //       // ignore localStorage errors
// // //     }
// // //     return config;
// // //   },
// // //   (error) => Promise.reject(error)
// // // );

// // // // Response interceptor to handle errors
// // // api.interceptors.response.use(
// // //   (response) => response,
// // //   (error) => {
// // //     if (error?.response?.status === 401) {
// // //       try {
// // //         localStorage.clear();
// // //       } catch {}
// // //       if (typeof window !== "undefined") window.location.href = "/login";
// // //     }
// // //     return Promise.reject(error);
// // //   }
// // // );

// // // export default api;

// // // src/utils/api.js
// // import axios from "axios";

// // const DEFAULT_BASE = "http://localhost:5058"; // <-- no trailing /api

// // const api = axios.create({
// //   baseURL: import.meta.env.VITE_API_BASE || DEFAULT_BASE,
// //   timeout: 10000,
// // });

// // // Request interceptor to add auth token
// // api.interceptors.request.use(
// //   (config) => {
// //     const token = localStorage.getItem("fnf_token");
// //     if (token) {
// //       // ensure headers object exists
// //       config.headers = config.headers || {};
// //       config.headers.Authorization = `Bearer ${token}`;
// //     }
// //     return config;
// //   },
// //   (error) => {
// //     return Promise.reject(error);
// //   }
// // );

// // // Response interceptor to handle errors
// // api.interceptors.response.use(
// //   (response) => response,
// //   (error) => {
// //     // if backend returned 401, clear and redirect to login
// //     if (error.response?.status === 401) {
// //       localStorage.clear();
// //       // keep it simple: navigate by location change
// //       window.location.href = "/login";
// //     }
// //     return Promise.reject(error);
// //   }
// // );

// // export default api;

// // src/utils/api.js
// import axios from "axios";

// const DEFAULT_BASE = "http://localhost:5058/api"; // <-- includes /api so calls like '/Posts' resolve to http://localhost:5058/api/Posts

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE || DEFAULT_BASE,
//   timeout: 10000,
// });

// // Request interceptor to add auth token
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("fnf_token");
//     if (token) {
//       // ensure headers object exists
//       config.headers = config.headers || {};
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor to handle errors
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // if backend returned 401, clear and redirect to login
//     if (error.response?.status === 401) {
//       localStorage.clear();
//       // keep it simple: navigate by location change
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;

// src/utils/api.js
import axios from "axios";

const DEFAULT_BASE = "http://localhost:5058/api"; // <-- includes /api so calls like '/Posts' resolve to http://localhost:5058/api/Posts

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || DEFAULT_BASE,
  // increased timeout to 60s for uploads / slow dev servers
  timeout: 60000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("fnf_token");
    if (token) {
      // ensure headers object exists
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // if backend returned 401, clear and redirect to login
    if (error.response?.status === 401) {
      localStorage.clear();
      // keep it simple: navigate by location change
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

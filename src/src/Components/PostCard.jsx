// // // src/components/PostCard.jsx
// // import React, { useMemo } from 'react';
// // import { Link, useNavigate } from 'react-router-dom';
// // import dayjs from 'dayjs';
// // import relativeTime from 'dayjs/plugin/relativeTime';
// // import { getAuth } from '../utils/auth';
// // import api from '../utils/api';
// // import '../styles/global.css';

// // dayjs.extend(relativeTime);

// // function safeGet(obj, ...keys) {
// //   for (const k of keys) {
// //     if (obj == null) return undefined;
// //     if (Object.prototype.hasOwnProperty.call(obj, k)) return obj[k];
// //   }
// //   return undefined;
// // }

// // /**
// //  * PostCard
// //  * - expects `post` object
// //  * - optional prop: onDeleted (function) called after successful delete
// //  */
// // export default function PostCard({ post, onDeleted }) {
// //   post = post ?? {};
// //   const navigate = useNavigate();
// //   const auth = getAuth?.() ?? {};

// //   // normalize commonly used fields
// //   const postId = post?.postId ?? post?.id;
// //   const ownerId = post?.userId ?? post?.UserId ?? post?.authorId ?? post?.author?.userId ?? null;
// //   const postDeptId = post?.deptId ?? post?.DeptId ?? post?.departmentId ?? post?.dept ?? null;

// //   // permission checks
// //   const isOwner = ownerId != null && String(ownerId) === String(auth?.userId ?? auth?.userId ?? '');
// //   const isManager = String((auth?.role ?? auth?.Role ?? '').toLowerCase()) === 'manager';
// //   const managerDeptId = auth?.departmentId ?? auth?.deptId ?? auth?.DepartmentId ?? null;
// //   const managerCanEdit = isManager && (managerDeptId != null && String(managerDeptId) === String(postDeptId));
// //   const canEdit = isOwner || managerCanEdit;
// //   const canDelete = isManager && managerDeptId != null && String(managerDeptId) === String(postDeptId);


// //   // body and attachments handling (same as before)
// //   const rawBody = useMemo(() => post?.body ?? post?.content ?? post?.bodyPreview ?? null, [post?.body, post?.content, post?.bodyPreview]);
// //   const attachments = useMemo(() => post?.attachments ?? post?.Attachments ?? post?.files ?? [], [post?.attachments, post?.Attachments, post?.files]);

// //   const thumbnailUrl = useMemo(() => {
// //     if (!Array.isArray(attachments) || attachments.length === 0) return null;
// //     const img = attachments.find(a =>
// //       /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(a.fileName ?? a.FileName ?? '')
// //       || /image\//i.test(a.fileType ?? a.FileType ?? '')
// //     );
// //     if (!img) return null;
// //     const fp = img.filePath ?? img.FilePath ?? img.path ?? img.fileUrl ?? null;
// //     return fp ?? null;
// //   }, [attachments]);

// //   // preview extraction
// //   const preview = useMemo(() => {
// //     if (!rawBody) return 'No content available';
// //     let blocks = null;
// //     if (typeof rawBody === 'string') {
// //       try { const parsed = JSON.parse(rawBody); blocks = Array.isArray(parsed) ? parsed : null; }
// //       catch {
// //         const cleanText = String(rawBody).replace(/\\n/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
// //         return truncatePreview(cleanText);
// //       }
// //     } else if (Array.isArray(rawBody)) {
// //       blocks = rawBody;
// //     }
// //     if (Array.isArray(blocks)) {
// //       const textBlocks = blocks
// //         .filter(b => b && (b.type === 'text' || !b.type) && b.content)
// //         .map(b => String(b.content).replace(/\\n/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim())
// //         .filter(Boolean);
// //       if (textBlocks.length > 0) {
// //         return truncatePreview(textBlocks.join(' '));
// //       }
// //     }
// //     return typeof rawBody === 'string' ? truncatePreview(rawBody.replace(/\\n/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()) : 'No content available';
// //   }, [rawBody]);

// //   function truncatePreview(text) {
// //     text = text.replace(/\.{3}$/g, '').trim();
// //     return text.length > 250 ? text.substring(0, 250).trim() + '...' : text;
// //   }

// //   // UI actions
// //   function handleEdit() {
// //     // navigate to your edit route (assumes /edit-post or /post/:id/edit — adjust if needed)
// //     // Your codebase uses /post/:id and an EditPost page at /post/:id/edit? earlier code used /posts/:id/edit, but you implemented EditPost under /edit/:id route maybe.
// //     // Here we navigate to /post/:id/edit — adjust if your routing is different.
// //     navigate(`/post/${postId}/edit`);
// //   }

// //   async function handleDelete() {
// //     if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;

// //     try {
// //       // managers may want to add a commit message — optional prompt
// //       let commitMessage = null;
// //       if (isManager) {
// //         const msg = prompt('Optional commit message (leave blank if none):');
// //         if (msg !== null && msg.trim().length > 0) commitMessage = msg.trim();
// //       }

// //       const url = commitMessage ? `/Posts/${postId}?commitMessage=${encodeURIComponent(commitMessage)}` : `/Posts/${postId}`;
// //       await api.delete(url);

// //       // call callback if parent passed one so it can refresh locally
// //       if (typeof onDeleted === 'function') onDeleted(postId);
// //       else {
// //         // default: navigate to feed (or reload)
// //         navigate('/feed');
// //       }
// //     } catch (err) {
// //       console.error('Failed to delete post:', err);
// //       const msg = err?.response?.data?.message ?? err?.message ?? 'Delete failed';
// //       alert(`Delete failed: ${msg}`);
// //     }
// //   }

// //   const title = post?.title ?? post?.Title ?? 'Untitled Post';
// //   const authorName = post?.authorName ?? post?.AuthorName ?? post?.userName ?? post?.UserName ?? 'Unknown Author';
// //   const department = post?.department ?? post?.dept ?? post?.Department ?? null;
// //   const createdAt = post?.createdAt ?? post?.CreatedAt ?? post?.datetime ?? post?.date ?? null;

// //   return (
// //     <div className="post-card" style={{ display: 'flex', gap: 12 }}>
// //       {thumbnailUrl && (
// //         <div style={{ minWidth: 96, maxWidth: 120, alignSelf: 'flex-start' }}>
// //           <img src={thumbnailUrl} alt="attachment" style={{ width: '100%', height: 'auto', borderRadius: 6, objectFit: 'cover' }} loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
// //         </div>
// //       )}

// //       <div style={{ flex: 1 }}>
// //         {/* Top row: optional repost banner + action buttons */}
// //         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
// //           <div style={{ minWidth: 0 }}>
// //             {post.isRepost && (
// //               <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
// //                 <span>🔄</span>
// //                 {post.repostedById ? (
// //                   <Link to={`/user/${post.repostedById}`} style={{ color: 'inherit', textDecoration: 'none' }}>
// //                     Reposted by <strong style={{ marginLeft: 6 }}>{post.repostedBy ?? post.repostedByName}</strong>
// //                   </Link>
// //                 ) : (
// //                   <span>Reposted by <strong style={{ marginLeft: 6 }}>{post.repostedBy ?? post.repostedByName}</strong></span>
// //                 )}
// //               </div>
// //             )}
// //           </div>

// //           {/* action buttons — Edit (owner or manager of dept) and Delete (manager only as described) */}
// //           <div style={{ display: 'flex', gap: 8 }}>
// //             {canEdit && (
// //               <button type="button" className="btn btn-sm" onClick={handleEdit}>
// //                 ✏ Edit
// //               </button>
// //             )}

// //             {canDelete && (
// //               <button type="button" className="btn btn-sm btn-danger" onClick={handleDelete}>
// //                 🗑 Delete
// //               </button>
// //             )}
// //           </div>
// //         </div>

// //         <Link to={`/post/${postId}`} className="post-title">
// //           {title}
// //         </Link>

// //         <div className="post-preview" style={{ marginTop: 8 }}>
// //           {preview}
// //         </div>

// //         {post.tags && post.tags.length > 0 && (
// //           <div style={{ marginTop: 8 }}>
// //             {post.tags.map((tag, index) => <span key={index} className="tag" style={{ marginRight: 6 }}>{tag}</span>)}
// //           </div>
// //         )}

// //         <div className="post-meta" style={{ marginTop: 10 }}>
// //           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
// //             <div>
// //               <strong>{authorName}</strong>
// //               {department && <span> • {department}</span>}
// //               <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>{createdAt ? dayjs(createdAt).fromNow() : ''}</div>
// //             </div>

// //             <div className="post-stats" style={{ minWidth: 120, textAlign: 'right' }}>
// //               <span title="Upvotes" style={{ marginRight: 8 }}>▲ {post.upvoteCount ?? post.upvotes ?? 0}</span>
// //               <span title="Downvotes" style={{ marginRight: 8 }}>▼ {post.downvoteCount ?? post.downvotes ?? 0}</span>
// //               <span title="Comments">💬 {post.commentsCount ?? post.comments?.length ?? 0}</span>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// import React, { useMemo } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import dayjs from 'dayjs';
// import relativeTime from 'dayjs/plugin/relativeTime';
// import { getAuth } from '../utils/auth';
// import api from '../utils/api';
// import '../styles/global.css';

// dayjs.extend(relativeTime);

// function safeGet(obj, ...keys) {
//   for (const k of keys) {
//     if (obj == null) return undefined;
//     if (Object.prototype.hasOwnProperty.call(obj, k)) return obj[k];
//   }
//   return undefined;
// }

// /**
//  * PostCard
//  * - expects `post` object
//  * - optional prop: onDeleted (function) called after successful delete
//  */
// export default function PostCard({ post, onDeleted }) {
//   post = post ?? {};
//   const navigate = useNavigate();
//   const auth = getAuth?.() ?? {};

//   // normalize commonly used fields
//   const postId = post?.postId ?? post?.id;
//   const ownerId = post?.userId ?? post?.UserId ?? post?.authorId ?? post?.author?.userId ?? null;
//   const postDeptId = post?.deptId ?? post?.DeptId ?? post?.departmentId ?? post?.dept ?? null;

//   // permission checks (prefer backend flags if present)
//   const backendCanEdit = (typeof post?.canEdit === 'boolean' ? post.canEdit : (typeof post?.CanEdit === 'boolean' ? post.CanEdit : undefined));
//   const backendCanDelete = (typeof post?.canDelete === 'boolean' ? post.canDelete : (typeof post?.CanDelete === 'boolean' ? post.CanDelete : undefined));

//   const isOwner = ownerId != null && String(ownerId) === String(auth?.userId ?? auth?.userId ?? '');
//   const isManager = String((auth?.role ?? auth?.Role ?? '').toLowerCase()) === 'manager';
//   const managerDeptId = auth?.departmentId ?? auth?.deptId ?? auth?.DepartmentId ?? null;
//   const managerCanEdit = isManager && (managerDeptId != null && String(managerDeptId) === String(postDeptId));
//   const localCanEdit = isOwner || managerCanEdit;
//   const localCanDelete = isManager && managerDeptId != null && String(managerDeptId) === String(postDeptId);

//   // final permission (backend preferred when present)
//   const canEdit = typeof backendCanEdit === 'boolean' ? backendCanEdit : localCanEdit;
//   const canDelete = typeof backendCanDelete === 'boolean' ? backendCanDelete : localCanDelete;

//   // body and attachments handling (same as before)
//   const rawBody = useMemo(() => post?.body ?? post?.content ?? post?.bodyPreview ?? null, [post?.body, post?.content, post?.bodyPreview]);
//   const attachments = useMemo(() => post?.attachments ?? post?.Attachments ?? post?.files ?? [], [post?.attachments, post?.Attachments, post?.files]);

//   const thumbnailUrl = useMemo(() => {
//     if (!Array.isArray(attachments) || attachments.length === 0) return null;
//     const img = attachments.find(a =>
//       /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(a.fileName ?? a.FileName ?? '')
//       || /image\//i.test(a.fileType ?? a.FileType ?? '')
//     );
//     if (!img) return null;
//     const fp = img.filePath ?? img.FilePath ?? img.path ?? img.fileUrl ?? null;
//     return fp ?? null;
//   }, [attachments]);

//   // preview extraction
//   const preview = useMemo(() => {
//     if (!rawBody) return 'No content available';
//     let blocks = null;
//     if (typeof rawBody === 'string') {
//       try { const parsed = JSON.parse(rawBody); blocks = Array.isArray(parsed) ? parsed : null; }
//       catch {
//         const cleanText = String(rawBody).replace(/\\n/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
//         return truncatePreview(cleanText);
//       }
//     } else if (Array.isArray(rawBody)) {
//       blocks = rawBody;
//     }
//     if (Array.isArray(blocks)) {
//       const textBlocks = blocks
//         .filter(b => b && (b.type === 'text' || !b.type) && b.content)
//         .map(b => String(b.content).replace(/\\n/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim())
//         .filter(Boolean);
//       if (textBlocks.length > 0) {
//         return truncatePreview(textBlocks.join(' '));
//       }
//     }
//     return typeof rawBody === 'string' ? truncatePreview(rawBody.replace(/\\n/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()) : 'No content available';
//   }, [rawBody]);

//   function truncatePreview(text) {
//     text = text.replace(/\.{3}$/g, '').trim();
//     return text.length > 250 ? text.substring(0, 250).trim() + '...' : text;
//   }

//   // UI actions
//   function handleEdit() {
//     // navigate to the edit route used in your app (keep consistent with other places)
//     navigate(`/edit/${postId}`);
//   }

//   async function handleDelete() {
//     if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;

//     try {
//       // managers may want to add a commit message — optional prompt
//       let commitMessage = null;
//       if (isManager) {
//         const msg = prompt('Optional commit message (leave blank if none):');
//         if (msg !== null && msg.trim().length > 0) commitMessage = msg.trim();
//       }

//       const url = commitMessage ? `/Posts/${postId}?commitMessage=${encodeURIComponent(commitMessage)}` : `/Posts/${postId}`;
//       await api.delete(url);

//       // call callback if parent passed one so it can refresh locally
//       if (typeof onDeleted === 'function') onDeleted(postId);
//       else {
//         // default: navigate to feed (or reload)
//         navigate('/feed');
//       }
//     } catch (err) {
//       console.error('Failed to delete post:', err);
//       const msg = err?.response?.data?.message ?? err?.message ?? 'Delete failed';
//       alert(`Delete failed: ${msg}`);
//     }
//   }

//   const title = post?.title ?? post?.Title ?? 'Untitled Post';
//   const authorName = post?.authorName ?? post?.AuthorName ?? post?.userName ?? post?.UserName ?? 'Unknown Author';
//   const department = post?.department ?? post?.dept ?? post?.Department ?? null;
//   const createdAt = post?.createdAt ?? post?.CreatedAt ?? post?.datetime ?? post?.date ?? null;

//   return (
//     <div className="post-card" style={{ display: 'flex', gap: 12 }}>
//       {thumbnailUrl && (
//         <div style={{ minWidth: 96, maxWidth: 120, alignSelf: 'flex-start' }}>
//           <img src={thumbnailUrl} alt="attachment" style={{ width: '100%', height: 'auto', borderRadius: 6, objectFit: 'cover' }} loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
//         </div>
//       )}

//       <div style={{ flex: 1 }}>
//         {/* Top row: optional repost banner + action buttons */}
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
//           <div style={{ minWidth: 0 }}>
//             {post.isRepost && (
//               <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
//                 <span>🔄</span>
//                 {post.repostedById ? (
//                   <Link to={`/user/${post.repostedById}`} style={{ color: 'inherit', textDecoration: 'none' }}>
//                     Reposted by <strong style={{ marginLeft: 6 }}>{post.repostedBy ?? post.repostedByName}</strong>
//                   </Link>
//                 ) : (
//                   <span>Reposted by <strong style={{ marginLeft: 6 }}>{post.repostedBy ?? post.repostedByName}</strong></span>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* action buttons — Edit (owner or manager of dept) and Delete (manager only as described) */}
//           <div style={{ display: 'flex', gap: 8 }}>
//             {canEdit && (
//               <button type="button" className="btn btn-sm" onClick={handleEdit}>
//                 ✏ Edit
//               </button>
//             )}

//             {canDelete && (
//               <button type="button" className="btn btn-sm btn-danger" onClick={handleDelete}>
//                 🗑 Delete
//               </button>
//             )}
//           </div>
//         </div>

//         <Link to={`/post/${postId}`} className="post-title">
//           {title}
//         </Link>

//         <div className="post-preview" style={{ marginTop: 8 }}>
//           {preview}
//         </div>

//         {post.tags && post.tags.length > 0 && (
//           <div style={{ marginTop: 8 }}>
//             {post.tags.map((tag, index) => <span key={index} className="tag" style={{ marginRight: 6 }}>{tag}</span>)}
//           </div>
//         )}

//         <div className="post-meta" style={{ marginTop: 10 }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
//             <div>
//               <strong>{authorName}</strong>
//               {department && <span> • {department}</span>}
//               <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>{createdAt ? dayjs(createdAt).fromNow() : ''}</div>
//             </div>

//             <div className="post-stats" style={{ minWidth: 120, textAlign: 'right' }}>
//               <span title="Upvotes" style={{ marginRight: 8 }}>▲ {post.upvoteCount ?? post.upvotes ?? 0}</span>
//               <span title="Downvotes" style={{ marginRight: 8 }}>▼ {post.downvoteCount ?? post.downvotes ?? 0}</span>
//               <span title="Comments">💬 {post.commentsCount ?? post.comments?.length ?? 0}</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/components/PostCard.jsx
import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { getAuth } from '../utils/auth';
import api from '../utils/api';
import '../styles/global.css';

dayjs.extend(relativeTime);

function safeGet(obj, ...keys) {
  for (const k of keys) {
    if (obj == null) return undefined;
    if (Object.prototype.hasOwnProperty.call(obj, k)) return obj[k];
  }
  return undefined;
}

/**
 * PostCard
 * - expects `post` object
 * - optional prop: onDeleted (function) called after successful delete
 */
export default function PostCard({ post, onDeleted }) {
  post = post ?? {};
  const navigate = useNavigate();
  const auth = getAuth?.() ?? {};

  // normalize commonly used fields
  const postId = post?.postId ?? post?.id;
  const ownerId = post?.userId ?? post?.UserId ?? post?.authorId ?? post?.author?.userId ?? null;
  const postDeptId = post?.deptId ?? post?.DeptId ?? post?.departmentId ?? post?.dept ?? null;

  // permission checks (prefer backend flags if present)
  const backendCanEdit = (typeof post?.canEdit === 'boolean' ? post.canEdit : (typeof post?.CanEdit === 'boolean' ? post.CanEdit : undefined));
  const backendCanDelete = (typeof post?.canDelete === 'boolean' ? post.canDelete : (typeof post?.CanDelete === 'boolean' ? post.CanDelete : undefined));

  const isOwner = ownerId != null && String(ownerId) === String(auth?.userId ?? '');
  const isManager = String((auth?.role ?? '').toLowerCase()) === 'manager';
  const managerDeptId = String(auth?.departmentId ?? auth?.deptId ?? auth?.DepartmentId ?? '');
  const managerCanEdit = isManager && managerDeptId && String(managerDeptId) === String(postDeptId);
  const localCanEdit = isOwner || managerCanEdit;
  const localCanDelete = isManager && managerDeptId && String(managerDeptId) === String(postDeptId);

  // final permission (backend preferred when present)
  const canEdit = typeof backendCanEdit === 'boolean' ? backendCanEdit : localCanEdit;
  const canDelete = typeof backendCanDelete === 'boolean' ? backendCanDelete : localCanDelete;

  // body and attachments handling (same as before)
  const rawBody = useMemo(() => post?.body ?? post?.content ?? post?.bodyPreview ?? null, [post?.body, post?.content, post?.bodyPreview]);
  const attachments = useMemo(() => post?.attachments ?? post?.Attachments ?? post?.files ?? [], [post?.attachments, post?.Attachments, post?.files]);

  const thumbnailUrl = useMemo(() => {
    if (!Array.isArray(attachments) || attachments.length === 0) return null;
    const img = attachments.find(a =>
      /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(a.fileName ?? a.FileName ?? '')
      || /image\//i.test(a.fileType ?? a.FileType ?? '')
    );
    if (!img) return null;
    const fp = img.filePath ?? img.FilePath ?? img.path ?? img.fileUrl ?? null;
    return fp ?? null;
  }, [attachments]);

  // preview extraction
  const preview = useMemo(() => {
    if (!rawBody) return 'No content available';
    let blocks = null;
    if (typeof rawBody === 'string') {
      try { const parsed = JSON.parse(rawBody); blocks = Array.isArray(parsed) ? parsed : null; }
      catch {
        const cleanText = String(rawBody).replace(/\\n/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        return truncatePreview(cleanText);
      }
    } else if (Array.isArray(rawBody)) {
      blocks = rawBody;
    }
    if (Array.isArray(blocks)) {
      const textBlocks = blocks
        .filter(b => b && (b.type === 'text' || !b.type) && b.content)
        .map(b => String(b.content).replace(/\\n/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim())
        .filter(Boolean);
      if (textBlocks.length > 0) {
        return truncatePreview(textBlocks.join(' '));
      }
    }
    return typeof rawBody === 'string' ? truncatePreview(rawBody.replace(/\\n/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()) : 'No content available';
  }, [rawBody]);

  function truncatePreview(text) {
    text = text.replace(/\.{3}$/g, '').trim();
    return text.length > 250 ? text.substring(0, 250).trim() + '...' : text;
  }

  // UI actions
  function handleEdit() {
    // navigate to the edit route used in your app (keeps /edit/:id route)
    navigate(`/edit/${postId}`);
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;

    try {
      // managers may want to add a commit message — optional prompt
      let commitMessage = null;
      if (isManager) {
        const msg = prompt('Optional commit message (leave blank if none):');
        if (msg !== null && msg.trim().length > 0) commitMessage = msg.trim();
      }

      const url = commitMessage ? `/Posts/${postId}?commitMessage=${encodeURIComponent(commitMessage)}` : `/Posts/${postId}`;
      await api.delete(url);

      // call callback if parent passed one so it can refresh locally
      if (typeof onDeleted === 'function') onDeleted(postId);
      else {
        // default: navigate to feed (or reload)
        navigate('/feed');
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
      const msg = err?.response?.data?.message ?? err?.message ?? 'Delete failed';
      alert(`Delete failed: ${msg}`);
    }
  }

  const title = post?.title ?? post?.Title ?? 'Untitled Post';
  const authorName = post?.authorName ?? post?.AuthorName ?? post?.userName ?? post?.UserName ?? 'Unknown Author';
  const department = post?.department ?? post?.dept ?? post?.Department ?? null;
  const createdAt = post?.createdAt ?? post?.CreatedAt ?? post?.datetime ?? post?.date ?? null;

  return (
    <div className="post-card" style={{ display: 'flex', gap: 12 }}>
      {thumbnailUrl && (
        <div style={{ minWidth: 96, maxWidth: 120, alignSelf: 'flex-start' }}>
          <img src={thumbnailUrl} alt="attachment" style={{ width: '100%', height: 'auto', borderRadius: 6, objectFit: 'cover' }} loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        </div>
      )}

      <div style={{ flex: 1 }}>
        {/* Top row: optional repost banner + action buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div style={{ minWidth: 0 }}>
            {post.isRepost && (
              <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🔄</span>
                {post.repostedById ? (
                  <Link to={`/user/${post.repostedById}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    Reposted by <strong style={{ marginLeft: 6 }}>{post.repostedBy ?? post.repostedByName}</strong>
                  </Link>
                ) : (
                  <span>Reposted by <strong style={{ marginLeft: 6 }}>{post.repostedBy ?? post.repostedByName}</strong></span>
                )}
              </div>
            )}
          </div>

          {/* action buttons — Edit (owner or manager of dept) and Delete (manager only as described) */}
          <div style={{ display: 'flex', gap: 8 }}>
            {canEdit && (
              <button type="button" className="btn btn-sm" onClick={handleEdit}>
                ✏ Edit
              </button>
            )}

            {canDelete && (
              <button type="button" className="btn btn-sm btn-danger" onClick={handleDelete}>
                🗑 Delete
              </button>
            )}
          </div>
        </div>

        <Link to={`/post/${postId}`} className="post-title">
          {title}
        </Link>

        <div className="post-preview" style={{ marginTop: 8 }}>
          {preview}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div style={{ marginTop: 8 }}>
            {post.tags.map((tag, index) => <span key={index} className="tag" style={{ marginRight: 6 }}>{tag}</span>)}
          </div>
        )}

        <div className="post-meta" style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <strong>{authorName}</strong>
              {department && <span> • {department}</span>}
              <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>{createdAt ? dayjs(createdAt).fromNow() : ''}</div>
            </div>

            <div className="post-stats" style={{ minWidth: 120, textAlign: 'right' }}>
              <span title="Upvotes" style={{ marginRight: 8 }}>▲ {post.upvoteCount ?? post.upvotes ?? 0}</span>
              <span title="Downvotes" style={{ marginRight: 8 }}>▼ {post.downvoteCount ?? post.downvotes ?? 0}</span>
              <span title="Comments">💬 {post.commentsCount ?? post.comments?.length ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

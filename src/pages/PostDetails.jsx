// // import React, { useEffect, useState } from 'react'
// // import { useParams, useNavigate } from 'react-router-dom'
// // import api from '../utils/api'
// // import Navbar from '../Components/Navbar'
// // import dayjs from 'dayjs'
// // import relativeTime from 'dayjs/plugin/relativeTime'
// // import { isAuthenticated, getAuth } from '../utils/auth'
// // import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
// // import Comments from '../Components/Comments'
// // import '../styles/global.css'

// // dayjs.extend(relativeTime)

// // export default function PostDetails() {
// //   const { id } = useParams()
// //   const navigate = useNavigate()
// //   const [post, setPost] = useState(null)
// //   const [loading, setLoading] = useState(true)
// //   const [voting, setVoting] = useState(false)
// //   const [editingPost, setEditingPost] = useState(false)
// //   const [postForm, setPostForm] = useState({ title: '', body: '', attachments: null, tags: [] })
// //   const [tagInput, setTagInput] = useState('')
// //   const auth = getAuth()

// //   useEffect(() => { fetchPost() }, [id])

// //   async function fetchPost() {
// //     try {
// //       setLoading(true)
// //       // NOTE: Use correct casing to match backend controller route
// //       const res = await api.get(`/Posts/${id}`)
// //       setPost(res.data)
// //       setPostForm({
// //         title: res.data.title || '',
// //         body: res.data.body || '',
// //         attachments: null,
// //         tags: res.data.tags || []
// //       })
// //     } catch (e) {
// //       if (e.response?.status === 404) navigate('/feed')
// //       else console.error('Fetch post error:', e?.response ?? e)
// //     } finally { setLoading(false) }
// //   }

// //   async function handleVote(type) {
// //     if (!isAuthenticated()) return navigate('/login')
// //     try {
// //       setVoting(true)
// //       await api.post(`/votes`, { postId: parseInt(id, 10), commentId: null, voteType: type })
// //       await fetchPost()
// //     } finally { setVoting(false) }
// //   }

// //   async function handleRepost() {
// //     if (!isAuthenticated()) return navigate('/login')
// //     try {
// //       // correct casing for Posts
// //       await api.post(`/Posts/${id}/repost`)
// //       alert('Post reposted!')
// //     } catch (err) {
// //       console.error('Repost error:', err)
// //       alert('Repost failed')
// //     }
// //   }

// //   async function handleDeletePost() {
// //     try {
// //       if (!auth) return navigate('/login')
// //       if (auth?.role !== 'Manager') {
// //         alert('Only managers can delete posts.')
// //         return
// //       }

// //       const msg = prompt('Enter reason for deleting this post (required):')
// //       if (!msg || !msg.trim()) {
// //         alert('Delete cancelled — please provide a reason to delete the post.')
// //         return
// //       }

// //       const confirmed = window.confirm('Are you sure you want to delete this post?')
// //       if (!confirmed) return

// //       // ensure uppercase 'Posts' here
// //       await api.delete(`/Posts/${id}?commitMessage=${encodeURIComponent(msg.trim())}`)
// //       navigate('/feed')
// //     } catch (error) {
// //       console.error('Delete post error response:', error?.response ?? error)
// //       if (error.response?.status === 403) {
// //         alert('You do not have permission to delete this post. Only managers of that department can delete posts.')
// //         return
// //       }
// //       const serverMsg = error?.response?.data?.message
// //       const serverDetail = error?.response?.data?.detail || error?.response?.data
// //       if (serverMsg || serverDetail) {
// //         alert(`${serverMsg || 'Failed to delete post.'}\n\nServer detail:\n${serverDetail}`)
// //       } else {
// //         alert('Failed to delete post.')
// //       }
// //     }
// //   }

// //   async function handleUpdatePost(e) {
// //     e.preventDefault()
// //     const msg = auth?.role === 'Manager' ? prompt('Enter commit message:') : null
// //     if (auth?.role === 'Manager' && !msg) return

// //     const formData = new FormData()
// //     formData.append('Title', postForm.title)
// //     formData.append('Body', postForm.body)
// //     if (postForm.attachments) {
// //       for (const file of postForm.attachments) formData.append('Attachments', file)
// //     }
// //     if (postForm.tags && postForm.tags.length > 0) {
// //       postForm.tags.forEach(t => formData.append('Tags', t))
// //     }

// //     // use correct casing '/Posts'
// //     const url = `/Posts/${id}${msg ? `?commitMessage=${encodeURIComponent(msg)}` : ''}`
// //     try {
// //       await api.put(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
// //       setEditingPost(false)
// //       fetchPost()
// //     } catch (err) {
// //       console.error('Update post error:', err)
// //       const serverMsg = err?.response?.data?.message
// //       const serverDetail = err?.response?.data?.detail || err?.response?.data
// //       if (serverMsg || serverDetail) {
// //         alert(`${serverMsg || 'Failed to update post.'}\n\nServer detail:\n${serverDetail}`)
// //       } else {
// //         alert('Failed to update post.')
// //       }
// //     }
// //   }

// //   function addTag() {
// //     if (!tagInput.trim()) return
// //     if (!postForm.tags.includes(tagInput.trim())) {
// //       setPostForm({ ...postForm, tags: [...postForm.tags, tagInput.trim()] })
// //     }
// //     setTagInput('')
// //   }

// //   function removeTag(tag) {
// //     setPostForm({ ...postForm, tags: postForm.tags.filter(t => t !== tag) })
// //   }

// //   function renderBlocks(bodyJson) {
// //     if (!bodyJson) return <p>No content available</p>
// //     try {
// //       const blocks = typeof bodyJson === 'string' ? JSON.parse(bodyJson) : bodyJson
// //       if (!Array.isArray(blocks)) return <p>{bodyJson}</p>
// //       return blocks.map((b, i) =>
// //         b.type === 'code' ? (
// //           <div key={i} style={{ position: 'relative', marginBottom: '1rem' }}>
// //             <button
// //               className="btn btn-outline"
// //               style={{ position: 'absolute', right: '10px', top: '10px' }}
// //               onClick={() => navigator.clipboard.writeText(b.content)}
// //             >
// //               Copy Code
// //             </button>
// //             <SyntaxHighlighter language="python" showLineNumbers>{b.content}</SyntaxHighlighter>
// //           </div>
// //         ) : <p key={i} style={{ marginBottom: '1rem' }}>{b.content || ''}</p>
// //       )
// //     } catch (e) {
// //       console.warn('Failed to parse post body as JSON blocks:', e)
// //       return <div className="markdown-content">{bodyJson}</div>
// //     }
// //   }

// //   if (loading) return <><Navbar /><div className="container loading"><p>Loading post...</p></div></>
// //   if (!post) return <><Navbar /><div className="container"><div className="card" style={{ textAlign: 'center' }}>
// //     <h2>Post not found</h2><button className="btn" onClick={() => navigate('/feed')}>Back to Feed</button>
// //   </div></div></>

// //   const isManager = auth?.role === 'Manager'
// //   const isOwner = String(post.userId) === String(auth?.userId)
// //   const canManagePost = isManager && String(auth?.departmentId) === String(post.deptId)

// //   // DEBUG: log auth/post values so you can see why edit/delete buttons may not render
// //   // (remove these logs once you've debugged)
// //   console.log('PostDetails debug — auth:', auth)
// //   console.log('PostDetails debug — post:', post)
// //   console.log('PostDetails debug — isManager:', isManager, 'isOwner:', isOwner, 'canManagePost:', canManagePost)

// //   return (
// //     <div>
// //       <Navbar />
// //       <main className="container" style={{ marginTop: '2rem' }}>
// //         <button className="btn btn-outline" onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>← Back</button>
// //         <article className="card">
// //           <header style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e9ecef', paddingBottom: '1rem' }}>
// //             <h1>{post.title}</h1>
// //             <div className="flex justify-between items-center">
// //               <div>
// //                 <strong>{post.authorName}</strong>{post.department && <span> • {post.department}</span>}
// //                 <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
// //                   {dayjs(post.createdAt).format('MMMM D, YYYY h:mm A')} ({dayjs(post.createdAt).fromNow()})
// //                 </div>
// //               </div>
// //               {isAuthenticated() &&
// //                 <div className="flex gap-2">
// //                   <button className="btn btn-outline" onClick={handleRepost}>🔄 Repost</button>

// //                   {/* Edit: owner or manager */}
// //                   {(canManagePost || isOwner) &&
// //                     <button className="btn btn-outline" onClick={() => navigate(`/edit/${post.postId}`)}>✏ Edit</button>
// //                   }

// //                   {/* Delete: only manager of same dept */}
// //                   {canManagePost &&
// //                     <button className="btn btn-outline" onClick={handleDeletePost}>🗑 Delete</button>
// //                   }
// //                 </div>}
// //             </div>
// //             {post.tags?.length > 0 &&
// //               <div style={{ marginTop: '1rem' }}>{post.tags.map((t, i) => <span key={i} className="tag">{t}</span>)}</div>}
// //           </header>
// //           <div className="markdown-content">{renderBlocks(post.bodyPreview || post.body)}</div>

// //           {post.attachments?.length > 0 &&
// //             <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '6px' }}>
// //               <h3>Attachments</h3>
// //               <ul style={{ listStyle: 'none', padding: 0 }}>
// //                 {post.attachments.map(f => {
// //                   const url = `http://localhost:5157/${f.filePath}`
// //                   const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(f.fileName)
// //                   return <li key={f.attachmentId} style={{ marginBottom: '1rem' }}>
// //                     {isImg
// //                       ? <img src={url} alt={f.fileName} style={{ maxWidth: '100%', borderRadius: '6px' }} />
// //                       : <a href={url} target="_blank" rel="noreferrer">📎 {f.fileName}</a>}
// //                   </li>
// //                 })}
// //               </ul>
// //             </div>}
// //           <footer style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '6px' }}>
// //             <div className="flex justify-between items-center">
// //               <div className="flex gap-4">
// //                 <button className="btn btn-outline" onClick={() => handleVote('Upvote')}
// //                   disabled={voting || !isAuthenticated()}>▲ {post.upvoteCount || 0}</button>
// //                 <button className="btn btn-outline" onClick={() => handleVote('Downvote')}
// //                   disabled={voting || !isAuthenticated()}>▼ {post.downvoteCount || 0}</button>
// //               </div>
// //               <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>💬 {post.commentsCount || 0} comments</div>
// //             </div>
// //           </footer>
// //         </article>
// //         <Comments postId={post.postId} canManagePost={canManagePost} auth={auth} />
// //       </main>
// //     </div>
// //   )
// // }

// import React, { useEffect, useState } from 'react'
// import { useParams, useNavigate } from 'react-router-dom'
// import api from '../utils/api'
// import Navbar from '../Components/Navbar'
// import dayjs from 'dayjs'
// import relativeTime from 'dayjs/plugin/relativeTime'
// import { isAuthenticated, getAuth } from '../utils/auth'
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
// import Comments from '../Components/Comments'
// import '../styles/global.css'

// dayjs.extend(relativeTime)

// export default function PostDetails() {
//   const { id } = useParams()
//   const navigate = useNavigate()
//   const [post, setPost] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [voting, setVoting] = useState(false)
//   const [editingPost, setEditingPost] = useState(false)
//   const [postForm, setPostForm] = useState({ title: '', body: '', attachments: null, tags: [] })
//   const [tagInput, setTagInput] = useState('')
//   const auth = getAuth()

//   useEffect(() => { fetchPost() }, [id])

//   async function fetchPost() {
//     try {
//       setLoading(true)
//       // NOTE: Use correct casing to match backend controller route
//       const res = await api.get(`/Posts/${id}`)
//       setPost(res.data)
//       setPostForm({
//         title: res.data.title || '',
//         body: res.data.body || '',
//         attachments: null,
//         tags: res.data.tags || []
//       })
//     } catch (e) {
//       if (e.response?.status === 404) navigate('/feed')
//       else console.error('Fetch post error:', e?.response ?? e)
//     } finally { setLoading(false) }
//   }

//   async function handleVote(type) {
//     if (!isAuthenticated()) return navigate('/login')
//     try {
//       setVoting(true)
//       await api.post(`/votes`, { postId: parseInt(id, 10), commentId: null, voteType: type })
//       await fetchPost()
//     } finally { setVoting(false) }
//   }

//   async function handleRepost() {
//     if (!isAuthenticated()) return navigate('/login')
//     try {
//       // correct casing for Posts
//       await api.post(`/Posts/${id}/repost`)
//       alert('Post reposted!')
//     } catch (err) {
//       console.error('Repost error:', err)
//       alert('Repost failed')
//     }
//   }

//   async function handleDeletePost() {
//     try {
//       if (!auth) return navigate('/login')
//       if (auth?.role !== 'Manager') {
//         alert('Only managers can delete posts.')
//         return
//       }

//       const msg = prompt('Enter reason for deleting this post (required):')
//       if (!msg || !msg.trim()) {
//         alert('Delete cancelled — please provide a reason to delete the post.')
//         return
//       }

//       const confirmed = window.confirm('Are you sure you want to delete this post?')
//       if (!confirmed) return

//       // ensure uppercase 'Posts' here
//       await api.delete(`/Posts/${id}?commitMessage=${encodeURIComponent(msg.trim())}`)
//       navigate('/feed')
//     } catch (error) {
//       console.error('Delete post error response:', error?.response ?? error)
//       if (error.response?.status === 403) {
//         alert('You do not have permission to delete this post. Only managers of that department can delete posts.')
//         return
//       }
//       const serverMsg = error?.response?.data?.message
//       const serverDetail = error?.response?.data?.detail || error?.response?.data
//       if (serverMsg || serverDetail) {
//         alert(`${serverMsg || 'Failed to delete post.'}\n\nServer detail:\n${serverDetail}`)
//       } else {
//         alert('Failed to delete post.')
//       }
//     }
//   }

//   async function handleUpdatePost(e) {
//     e.preventDefault()
//     const msg = auth?.role === 'Manager' ? prompt('Enter commit message:') : null
//     if (auth?.role === 'Manager' && !msg) return

//     const formData = new FormData()
//     formData.append('Title', postForm.title)
//     formData.append('Body', postForm.body)
//     if (postForm.attachments) {
//       for (const file of postForm.attachments) formData.append('Attachments', file)
//     }
//     if (postForm.tags && postForm.tags.length > 0) {
//       postForm.tags.forEach(t => formData.append('Tags', t))
//     }

//     // use correct casing '/Posts'
//     const url = `/Posts/${id}${msg ? `?commitMessage=${encodeURIComponent(msg)}` : ''}`
//     try {
//       await api.put(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
//       setEditingPost(false)
//       fetchPost()
//     } catch (err) {
//       console.error('Update post error:', err)
//       const serverMsg = err?.response?.data?.message
//       const serverDetail = err?.response?.data?.detail || err?.response?.data
//       if (serverMsg || serverDetail) {
//         alert(`${serverMsg || 'Failed to update post.'}\n\nServer detail:\n${serverDetail}`)
//       } else {
//         alert('Failed to update post.')
//       }
//     }
//   }

//   function addTag() {
//     if (!tagInput.trim()) return
//     if (!postForm.tags.includes(tagInput.trim())) {
//       setPostForm({ ...postForm, tags: [...postForm.tags, tagInput.trim()] })
//     }
//     setTagInput('')
//   }

//   function removeTag(tag) {
//     setPostForm({ ...postForm, tags: postForm.tags.filter(t => t !== tag) })
//   }

//   function renderBlocks(bodyJson) {
//     if (!bodyJson) return <p>No content available</p>
//     try {
//       const blocks = typeof bodyJson === 'string' ? JSON.parse(bodyJson) : bodyJson
//       if (!Array.isArray(blocks)) return <p>{bodyJson}</p>
//       return blocks.map((b, i) =>
//         b.type === 'code' ? (
//           <div key={i} style={{ position: 'relative', marginBottom: '1rem' }}>
//             <button
//               className="btn btn-outline"
//               style={{ position: 'absolute', right: '10px', top: '10px' }}
//               onClick={() => navigator.clipboard.writeText(b.content)}
//             >
//               Copy Code
//             </button>
//             <SyntaxHighlighter language="python" showLineNumbers>{b.content}</SyntaxHighlighter>
//           </div>
//         ) : <p key={i} style={{ marginBottom: '1rem' }}>{b.content || ''}</p>
//       )
//     } catch (e) {
//       console.warn('Failed to parse post body as JSON blocks:', e)
//       return <div className="markdown-content">{bodyJson}</div>
//     }
//   }

//   if (loading) return <><Navbar /><div className="container loading"><p>Loading post...</p></div></>
//   if (!post) return <><Navbar /><div className="container"><div className="card" style={{ textAlign: 'center' }}>
//     <h2>Post not found</h2><button className="btn" onClick={() => navigate('/feed')}>Back to Feed</button>
//   </div></div></>

//   // prefer backend-provided permission flags when available
//   const backendCanEdit = typeof post?.canEdit === 'boolean' ? post.canEdit : (typeof post?.CanEdit === 'boolean' ? post.CanEdit : undefined);
//   const backendCanDelete = typeof post?.canDelete === 'boolean' ? post.canDelete : (typeof post?.CanDelete === 'boolean' ? post.CanDelete : undefined);

//   const isManager = auth?.role === 'Manager'
//   const isOwner = String(post.userId) === String(auth?.userId)

//   const managerDeptId = auth?.departmentId ?? auth?.deptId ?? null
//   const canManagePostLocal = isManager && String(managerDeptId) === String(post.deptId)

//   const canEdit = typeof backendCanEdit === 'boolean' ? backendCanEdit : (isOwner || canManagePostLocal)
//   const canDelete = typeof backendCanDelete === 'boolean' ? backendCanDelete : canManagePostLocal

//   // DEBUG: log auth/post values so you can see why edit/delete buttons may not render
//   // (remove these logs once you've debugged)
//   console.log('PostDetails debug — auth:', auth)
//   console.log('PostDetails debug — post:', post)
//   console.log('PostDetails debug — canEdit:', canEdit, 'canDelete:', canDelete, 'isOwner:', isOwner)

//   return (
//     <div>
//       <Navbar />
//       <main className="container" style={{ marginTop: '2rem' }}>
//         <button className="btn btn-outline" onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>← Back</button>
//         <article className="card">
//           <header style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e9ecef', paddingBottom: '1rem' }}>
//             <h1>{post.title}</h1>
//             <div className="flex justify-between items-center">
//               <div>
//                 <strong>{post.authorName}</strong>{post.department && <span> • {post.department}</span>}
//                 <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
//                   {dayjs(post.createdAt).format('MMMM D, YYYY h:mm A')} ({dayjs(post.createdAt).fromNow()})
//                 </div>
//               </div>
//               {isAuthenticated() &&
//                 <div className="flex gap-2">
//                   <button className="btn btn-outline" onClick={handleRepost}>🔄 Repost</button>

//                   {/* Edit: owner or manager */}
//                   {canEdit &&
//                     <button className="btn btn-outline" onClick={() => navigate(`/edit/${post.postId}`)}>✏ Edit</button>
//                   }

//                   {/* Delete: only manager of same dept */}
//                   {canDelete &&
//                     <button className="btn btn-outline" onClick={handleDeletePost}>🗑 Delete</button>
//                   }
//                 </div>}
//             </div>
//             {post.tags?.length > 0 &&
//               <div style={{ marginTop: '1rem' }}>{post.tags.map((t, i) => <span key={i} className="tag">{t}</span>)}</div>}
//           </header>
//           <div className="markdown-content">{renderBlocks(post.bodyPreview || post.body)}</div>

//           {post.attachments?.length > 0 &&
//             <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '6px' }}>
//               <h3>Attachments</h3>
//               <ul style={{ listStyle: 'none', padding: 0 }}>
//                 {post.attachments.map(f => {
//                   const url = `http://localhost:5157/${f.filePath}`
//                   const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(f.fileName)
//                   return <li key={f.attachmentId} style={{ marginBottom: '1rem' }}>
//                     {isImg
//                       ? <img src={url} alt={f.fileName} style={{ maxWidth: '100%', borderRadius: '6px' }} />
//                       : <a href={url} target="_blank" rel="noreferrer">📎 {f.fileName}</a>}
//                   </li>
//                 })}
//               </ul>
//             </div>}
//           <footer style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '6px' }}>
//             <div className="flex justify-between items-center">
//               <div className="flex gap-4">
//                 <button className="btn btn-outline" onClick={() => handleVote('Upvote')}
//                   disabled={voting || !isAuthenticated()}>▲ {post.upvoteCount || 0}</button>
//                 <button className="btn btn-outline" onClick={() => handleVote('Downvote')}
//                   disabled={voting || !isAuthenticated()}>▼ {post.downvoteCount || 0}</button>
//               </div>
//               <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>💬 {post.commentsCount || 0} comments</div>
//             </div>
//           </footer>
//         </article>
//         <Comments postId={post.postId} canManagePost={canDelete} auth={auth} />
//       </main>
//     </div>
//   )
// }

// src/pages/PostDetails.jsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Navbar from '../Components/Navbar'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { isAuthenticated, getAuth } from '../utils/auth'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import Comments from '../Components/Comments'
import '../styles/global.css'

dayjs.extend(relativeTime)

export default function PostDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [editingPost, setEditingPost] = useState(false)
  const [postForm, setPostForm] = useState({ title: '', body: '', attachments: null, tags: [] })
  const [tagInput, setTagInput] = useState('')
  const auth = getAuth()

  useEffect(() => { fetchPost() }, [id])

  async function fetchPost() {
    try {
      setLoading(true)
      // NOTE: Use correct casing to match backend controller route
      const res = await api.get(`/Posts/${id}`)
      setPost(res.data)
      setPostForm({
        title: res.data.title || '',
        body: res.data.body || '',
        attachments: null,
        tags: res.data.tags || []
      })
    } catch (e) {
      if (e.response?.status === 404) navigate('/feed')
      else console.error('Fetch post error:', e?.response ?? e)
    } finally { setLoading(false) }
  }

  async function handleVote(type) {
    if (!isAuthenticated()) return navigate('/login')
    try {
      setVoting(true)
      await api.post(`/votes`, { postId: parseInt(id, 10), commentId: null, voteType: type })
      await fetchPost()
    } finally { setVoting(false) }
  }

  async function handleRepost() {
    if (!isAuthenticated()) return navigate('/login')
    try {
      // correct casing for Posts
      await api.post(`/Posts/${id}/repost`)
      alert('Post reposted!')
    } catch (err) {
      console.error('Repost error:', err)
      alert('Repost failed')
    }
  }

  async function handleDeletePost() {
    try {
      if (!auth) return navigate('/login')

      // case-insensitive manager check
      const isManager = String(auth?.role ?? '').toLowerCase() === 'manager'
      if (!isManager) {
        alert('Only managers can delete posts.')
        return
      }

      const msg = prompt('Enter reason for deleting this post (required):')
      if (!msg || !msg.trim()) {
        alert('Delete cancelled — please provide a reason to delete the post.')
        return
      }

      const confirmed = window.confirm('Are you sure you want to delete this post?')
      if (!confirmed) return

      // ensure uppercase 'Posts' here
      await api.delete(`/Posts/${id}?commitMessage=${encodeURIComponent(msg.trim())}`)
      navigate('/feed')
    } catch (error) {
      console.error('Delete post error response:', error?.response ?? error)
      if (error.response?.status === 403) {
        alert('You do not have permission to delete this post. Only managers of that department can delete posts.')
        return
      }
      const serverMsg = error?.response?.data?.message
      const serverDetail = error?.response?.data?.detail || error?.response?.data
      if (serverMsg || serverDetail) {
        alert(`${serverMsg || 'Failed to delete post.'}\n\nServer detail:\n${serverDetail}`)
      } else {
        alert('Failed to delete post.')
      }
    }
  }

  async function handleUpdatePost(e) {
    e.preventDefault()
    // case-insensitive manager check
    const isManager = String(auth?.role ?? '').toLowerCase() === 'manager'
    const msg = isManager ? prompt('Enter commit message:') : null
    if (isManager && !msg) return

    const formData = new FormData()
    formData.append('Title', postForm.title)
    formData.append('Body', postForm.body)
    if (postForm.attachments) {
      for (const file of postForm.attachments) formData.append('Attachments', file)
    }
    if (postForm.tags && postForm.tags.length > 0) {
      postForm.tags.forEach(t => formData.append('Tags', t))
    }

    // use correct casing '/Posts'
    const url = `/Posts/${id}${msg ? `?commitMessage=${encodeURIComponent(msg)}` : ''}`
    try {
      await api.put(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setEditingPost(false)
      fetchPost()
    } catch (err) {
      console.error('Update post error:', err)
      const serverMsg = err?.response?.data?.message
      const serverDetail = err?.response?.data?.detail || err?.response?.data
      if (serverMsg || serverDetail) {
        alert(`${serverMsg || 'Failed to update post.'}\n\nServer detail:\n${serverDetail}`)
      } else {
        alert('Failed to update post.')
      }
    }
  }

  function addTag() {
    if (!tagInput.trim()) return
    if (!postForm.tags.includes(tagInput.trim())) {
      setPostForm({ ...postForm, tags: [...postForm.tags, tagInput.trim()] })
    }
    setTagInput('')
  }

  function removeTag(tag) {
    setPostForm({ ...postForm, tags: postForm.tags.filter(t => t !== tag) })
  }

  function renderBlocks(bodyJson) {
    if (!bodyJson) return <p>No content available</p>
    try {
      const blocks = typeof bodyJson === 'string' ? JSON.parse(bodyJson) : bodyJson
      if (!Array.isArray(blocks)) return <p>{bodyJson}</p>
      return blocks.map((b, i) =>
        b.type === 'code' ? (
          <div key={i} style={{ position: 'relative', marginBottom: '1rem' }}>
            <button
              className="btn btn-outline"
              style={{ position: 'absolute', right: '10px', top: '10px' }}
              onClick={() => navigator.clipboard.writeText(b.content)}
            >
              Copy Code
            </button>
            <SyntaxHighlighter language="python" showLineNumbers>{b.content}</SyntaxHighlighter>
          </div>
        ) : <p key={i} style={{ marginBottom: '1rem' }}>{b.content || ''}</p>
      )
    } catch (e) {
      console.warn('Failed to parse post body as JSON blocks:', e)
      return <div className="markdown-content">{bodyJson}</div>
    }
  }

  if (loading) return <><Navbar /><div className="container loading"><p>Loading post...</p></div></>
  if (!post) return <><Navbar /><div className="container"><div className="card" style={{ textAlign: 'center' }}>
    <h2>Post not found</h2><button className="btn" onClick={() => navigate('/feed')}>Back to Feed</button>
  </div></div></>

  // prefer backend-provided permission flags when available
  const backendCanEdit = typeof post?.canEdit === 'boolean' ? post.canEdit : (typeof post?.CanEdit === 'boolean' ? post.CanEdit : undefined);
  const backendCanDelete = typeof post?.canDelete === 'boolean' ? post.canDelete : (typeof post?.CanDelete === 'boolean' ? post.CanDelete : undefined);

  // local permission calculation (case-insensitive for role)
  const isManager = String(auth?.role ?? '').toLowerCase() === 'manager'
  const isOwner = String(post.userId) === String(auth?.userId)

  const managerDeptId = String(auth?.departmentId ?? auth?.deptId ?? '')
  const canManagePostLocal = isManager && managerDeptId && String(post.deptId) === managerDeptId

  const canEdit = typeof backendCanEdit === 'boolean' ? backendCanEdit : (isOwner || canManagePostLocal)
  const canDelete = typeof backendCanDelete === 'boolean' ? backendCanDelete : canManagePostLocal

  // DEBUG: log auth/post values so you can see why edit/delete buttons may not render
  // (remove these logs once you've debugged)
  console.log('PostDetails debug — auth:', auth)
  console.log('PostDetails debug — post:', post)
  console.log('PostDetails debug — canEdit:', canEdit, 'canDelete:', canDelete, 'isOwner:', isOwner)

  return (
    <div>
      <Navbar />
      <main className="container" style={{ marginTop: '2rem' }}>
        <button className="btn btn-outline" onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>← Back</button>
        <article className="card">
          <header style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e9ecef', paddingBottom: '1rem' }}>
            <h1>{post.title}</h1>
            <div className="flex justify-between items-center">
              <div>
                <strong>{post.authorName}</strong>{post.department && <span> • {post.department}</span>}
                <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                  {dayjs(post.createdAt).format('MMMM D, YYYY h:mm A')} ({dayjs(post.createdAt).fromNow()})
                </div>
              </div>
              {isAuthenticated() &&
                <div className="flex gap-2">
                  <button className="btn btn-outline" onClick={handleRepost}>🔄 Repost</button>

                  {/* Edit: owner or manager of same dept */}
                  {canEdit &&
                    <button className="btn btn-outline" onClick={() => navigate(`/edit/${post.postId}`)}>✏ Edit</button>
                  }

                  {/* Delete: only manager of same dept */}
                  {canDelete &&
                    <button className="btn btn-outline" onClick={handleDeletePost}>🗑 Delete</button>
                  }
                </div>}
            </div>
            {post.tags?.length > 0 &&
              <div style={{ marginTop: '1rem' }}>{post.tags.map((t, i) => <span key={i} className="tag">{t}</span>)}</div>}
          </header>
          <div className="markdown-content">{renderBlocks(post.bodyPreview || post.body)}</div>

          {post.attachments?.length > 0 &&
            <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '6px' }}>
              <h3>Attachments</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {post.attachments.map(f => {
                  const url = `http://localhost:5157/${f.filePath}`
                  const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(f.fileName)
                  return <li key={f.attachmentId} style={{ marginBottom: '1rem' }}>
                    {isImg
                      ? <img src={url} alt={f.fileName} style={{ maxWidth: '100%', borderRadius: '6px' }} />
                      : <a href={url} target="_blank" rel="noreferrer">📎 {f.fileName}</a>}
                  </li>
                })}
              </ul>
            </div>}
          <footer style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '6px' }}>
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <button className="btn btn-outline" onClick={() => handleVote('Upvote')}
                  disabled={voting || !isAuthenticated()}>▲ {post.upvoteCount || 0}</button>
                <button className="btn btn-outline" onClick={() => handleVote('Downvote')}
                  disabled={voting || !isAuthenticated()}>▼ {post.downvoteCount || 0}</button>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>💬 {post.commentsCount || 0} comments</div>
            </div>
          </footer>
        </article>
        <Comments postId={post.postId} canManagePost={canDelete} auth={auth} />
      </main>
    </div>
  )
}
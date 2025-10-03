// import React, { useEffect, useState } from 'react'
// import { useNavigate, useSearchParams } from 'react-router-dom'
// import api from '../utils/api'
// import Navbar from '../Components/Navbar'
// import PostCard from '../Components/PostCard'
// import '../styles/global.css'

// export default function Feed() {
//   const [posts, setPosts] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [tag, setTag] = useState('')
//   const [tagSuggestions, setTagSuggestions] = useState([])
//   const [dept, setDept] = useState('')
//   const [departments, setDepartments] = useState([])
//   const [searchParams] = useSearchParams()
//   const navigate = useNavigate()

//   const isMine = searchParams.get('mine') === 'true'

//   useEffect(() => {
//     fetchDepartments()
//     fetchFeed()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [tag, dept, isMine])

//   /* fetchDepartments - use /Categories (api.baseURL includes /api) */
//   async function fetchDepartments() {
//     try {
//       const res = await api.get('/Categories') // api.baseURL expected to include /api
//       const data = res.data
//       setDepartments(data.$values ? data.$values : Array.isArray(data) ? data : [])
//       console.log('Loaded departments:', (data && (data.$values ? data.$values.length : data.length)) || 0)
//     } catch (e) {
//       console.error('Failed to fetch departments:', e)
//       setDepartments([])
//     }
//   }

//   /* fetchFeed - try /Posts/feed first, fallback to /Posts (and similarly for "mine") */
//   async function fetchFeed() {
//     try {
//       setLoading(true)
//       const params = new URLSearchParams()
//       if (dept) params.set('deptId', dept)
//       if (tag) params.set('tag', tag)
//       if (isMine) params.set('mine', 'true')

//       const basePaths = isMine ? ['/Posts/mine', '/Posts'] : ['/Posts/feed', '/Posts']
//       for (const p of basePaths) {
//         try {
//           const url = `${p}${params.toString() ? `?${params.toString()}` : ''}`
//           const res = await api.get(url)
//           const d = res.data
//           setPosts(Array.isArray(d) ? d : (d.$values || []))
//           console.log('Loaded posts from', p)
//           return
//         } catch (err) {
//           if (err?.response?.status === 404) {
//             console.warn(`Path ${p} returned 404, trying next.`)
//             continue
//           } else {
//             throw err
//           }
//         }
//       }

//       console.warn('No posts endpoint matched tried paths:', basePaths)
//       setPosts([])
//     } catch (e) {
//       console.error('Failed to fetch posts:', e)
//       setPosts([])
//     } finally {
//       setLoading(false)
//     }
//   }

//   /* fetchTagSuggestions using /Tags endpoint (api.baseURL includes /api) */
//   async function fetchTagSuggestions(query) {
//     if (!query) return setTagSuggestions([])

//     try {
//       const url = dept ? `/Tags?deptId=${dept}` : `/Tags`
//       const res = await api.get(url)
//       const data = res.data
//       const allTags = Array.isArray(data) ? data : (data?.$values || [])

//       const filtered = allTags
//         .map(t => ({
//           tagId: t.tagId ?? t.TagId ?? t.id,
//           tagName: (t.tagName ?? t.TagName ?? t.name ?? '').toString(),
//           deptId: t.deptId ?? t.DeptId ?? t.deptId
//         }))
//         .filter(t => t.tagName.toLowerCase().includes(query.toLowerCase()))

//       setTagSuggestions(filtered)
//       console.log('Loaded tags from', url)
//     } catch (err) {
//       console.error('Failed to fetch tags:', err)
//       setTagSuggestions([])
//     }
//   }

//   function handleSearch(e) {
//     e.preventDefault()
//     fetchFeed()
//   }

//   return (
//     <div>
//       <Navbar />
//       <main className="container" style={{ marginTop: '2rem' }}>
//         {/* Page Header */}
//         <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
//           <h1>{isMine ? 'My Posts' : 'Knowledge Feed'}</h1>
//           <button className="btn" onClick={() => navigate('/new')}>
//             + New Post
//           </button>
//         </div>

//         {/* Search and Filters */}
//         <form onSubmit={handleSearch} className="card" style={{ position: 'relative' }}>
//           <div className="search-filters">
//             <div style={{ position: 'relative', flex: 1 }}>
//               <input
//                 type="text"
//                 placeholder="Search tags..."
//                 value={tag}
//                 onChange={e => {
//                   const value = e.target.value
//                   setTag(value)
//                   fetchTagSuggestions(value)
//                 }}
//               />
//               {tagSuggestions.length > 0 && (
//                 <ul style={{
//                   background: '#fff',
//                   border: '1px solid #ddd',
//                   borderRadius: '4px',
//                   marginTop: '0.25rem',
//                   maxHeight: '200px',
//                   overflowY: 'auto',
//                   position: 'absolute',
//                   zIndex: 1000,
//                   width: '100%'
//                 }}>
//                   {tagSuggestions.map(s => (
//                     <li key={s.tagId} style={{ padding: '0.5rem', cursor: 'pointer' }}
//                       onClick={() => { setTag(s.tagName); setTagSuggestions([]); fetchFeed() }}>
//                       {s.tagName}
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>

//             <select value={dept} onChange={e => setDept(e.target.value)}>
//               <option value="">All Departments</option>
//               {departments.map(d => (
//                 <option key={d.deptId} value={d.deptId}>{d.deptName}</option>
//               ))}
//             </select>

//             <button type="submit" className="btn" style={{ minWidth: 'auto', padding: '0.75rem 1.5rem' }}>
//               Search
//             </button>
//           </div>
//         </form>

//         {/* Filter Tabs */}
//         <div className="flex gap-2" style={{ marginBottom: '2rem' }}>
//           <button className={`btn ${!isMine ? '' : 'btn-outline'}`} onClick={() => navigate('/feed')}>All Posts</button>
//           <button className={`btn ${isMine ? '' : 'btn-outline'}`} onClick={() => navigate('/feed?mine=true')}>My Posts</button>
//         </div>

//         {/* Posts */}
//         {loading ? (
//           <div className="loading"><p>Loading posts...</p></div>
//         ) : posts.length === 0 ? (
//           <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
//             <h3>{isMine ? 'No posts created yet' : 'No posts found'}</h3>
//             <p style={{ color: '#6c757d', marginBottom: '1rem' }}>
//               {isMine ? 'Create your first post to share knowledge with your team.' : 'Try adjusting your search filters or create a new post.'}
//             </p>
//             <button className="btn" onClick={() => navigate('/new')}>Create Post</button>
//           </div>
//         ) : (
//           <div>{posts.map(p => <PostCard key={p.postId} post={p} />)}</div>
//         )}
//       </main>
//     </div>
//   )
// }

import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import Navbar from '../Components/Navbar'
import PostCard from '../Components/PostCard'
import '../styles/global.css'

export default function Feed() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [tag, setTag] = useState('')
  const [tagSuggestions, setTagSuggestions] = useState([])
  const [dept, setDept] = useState('')
  const [departments, setDepartments] = useState([])
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const isMine = searchParams.get('mine') === 'true'

  useEffect(() => {
    fetchDepartments()
    fetchFeed()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tag, dept, isMine])

  /* fetchDepartments - use /Categories (api.baseURL includes /api) */
  async function fetchDepartments() {
    try {
      const res = await api.get('/Categories') // api.baseURL expected to include /api
      const data = res.data
      setDepartments(data.$values ? data.$values : Array.isArray(data) ? data : [])
      console.log('Loaded departments:', (data && (data.$values ? data.$values.length : data.length)) || 0)
    } catch (e) {
      console.error('Failed to fetch departments:', e)
      setDepartments([])
    }
  }

  /* fetchFeed - try /Posts/feed first, fallback to /Posts (and similarly for "mine") */
  async function fetchFeed() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (dept) params.set('deptId', dept)
      if (tag) params.set('tag', tag)
      if (isMine) params.set('mine', 'true')

      const basePaths = isMine ? ['/Posts/mine', '/Posts'] : ['/Posts/feed', '/Posts']
      for (const p of basePaths) {
        try {
          const url = `${p}${params.toString() ? `?${params.toString()}` : ''}`
          const res = await api.get(url)
          const d = res.data
          setPosts(Array.isArray(d) ? d : (d.$values || []))
          console.log('Loaded posts from', p)
          return
        } catch (err) {
          if (err?.response?.status === 404) {
            console.warn(`Path ${p} returned 404, trying next.`)
            continue
          } else {
            throw err
          }
        }
      }

      console.warn('No posts endpoint matched tried paths:', basePaths)
      setPosts([])
    } catch (e) {
      console.error('Failed to fetch posts:', e)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  /* fetchTagSuggestions using /Tags endpoint (api.baseURL includes /api) */
  async function fetchTagSuggestions(query) {
    if (!query) return setTagSuggestions([])

    try {
      const url = dept ? `/Tags?deptId=${dept}` : `/Tags`
      const res = await api.get(url)
      const data = res.data
      const allTags = Array.isArray(data) ? data : (data?.$values || [])

      const filtered = allTags
        .map(t => ({
          tagId: t.tagId ?? t.TagId ?? t.id,
          tagName: (t.tagName ?? t.TagName ?? t.name ?? '').toString(),
          deptId: t.deptId ?? t.DeptId ?? t.deptId
        }))
        .filter(t => t.tagName.toLowerCase().includes(query.toLowerCase()))

      setTagSuggestions(filtered)
      console.log('Loaded tags from', url)
    } catch (err) {
      console.error('Failed to fetch tags:', err)
      setTagSuggestions([])
    }
  }

  function handleSearch(e) {
    e.preventDefault()
    fetchFeed()
  }

  return (
    <div>
      <Navbar />
      <main className="container" style={{ marginTop: '2rem' }}>
        {/* Page Header */}
        <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
          <h1>{isMine ? 'My Posts' : 'Knowledge Feed'}</h1>
          <button className="btn" onClick={() => navigate('/new')}>
            + New Post
          </button>
        </div>

        {/* Search and Filters */}
        <form onSubmit={handleSearch} className="card" style={{ position: 'relative' }}>
          <div className="search-filters">
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Search tags..."
                value={tag}
                onChange={e => {
                  const value = e.target.value
                  setTag(value)
                  fetchTagSuggestions(value)
                }}
              />
              {tagSuggestions.length > 0 && (
                <ul style={{
                  background: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  marginTop: '0.25rem',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  position: 'absolute',
                  zIndex: 1000,
                  width: '100%'
                }}>
                  {tagSuggestions.map(s => (
                    <li key={s.tagId} style={{ padding: '0.5rem', cursor: 'pointer' }}
                      onClick={() => { setTag(s.tagName); setTagSuggestions([]); fetchFeed() }}>
                      {s.tagName}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <select value={dept} onChange={e => setDept(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.deptId} value={d.deptId}>{d.deptName}</option>
              ))}
            </select>

            <button type="submit" className="btn" style={{ minWidth: 'auto', padding: '0.75rem 1.5rem' }}>
              Search
            </button>
          </div>
        </form>

        {/* Filter Tabs */}
        <div className="flex gap-2" style={{ marginBottom: '2rem' }}>
          <button className={`btn ${!isMine ? '' : 'btn-outline'}`} onClick={() => navigate('/feed')}>All Posts</button>
          <button className={`btn ${isMine ? '' : 'btn-outline'}`} onClick={() => navigate('/feed?mine=true')}>My Posts</button>
        </div>

        {/* Posts */}
        {loading ? (
          <div className="loading"><p>Loading posts...</p></div>
        ) : posts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h3>{isMine ? 'No posts created yet' : 'No posts found'}</h3>
            <p style={{ color: '#6c757d', marginBottom: '1rem' }}>
              {isMine ? 'Create your first post to share knowledge with your team.' : 'Try adjusting your search filters or create a new post.'}
            </p>
            <button className="btn" onClick={() => navigate('/new')}>Create Post</button>
          </div>
        ) : (
          <div>{posts.map(p => <PostCard key={p.postId} post={p} />)}</div>
        )}
      </main>
    </div>
  )
}

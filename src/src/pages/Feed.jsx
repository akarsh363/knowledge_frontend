import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import Navbar from '../Components/Navbar'
import PostCard from '../Components/PostCard'
import '../styles/global.css'

export default function Feed() {
  const [rawPosts, setRawPosts] = useState([]) // raw response from API
  const [loading, setLoading] = useState(true)
  const [tag, setTag] = useState('')
  const [debouncedTag, setDebouncedTag] = useState('')
  const [tagSuggestions, setTagSuggestions] = useState([])
  const [dept, setDept] = useState('')
  const [departments, setDepartments] = useState([])
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const isMine = searchParams.get('mine') === 'true'

  // Abort controller ref for in-flight feed request
  const fetchCtrlRef = useRef(null)
  // debounce timeout ref
  const debounceRef = useRef(null)

  // Fetch departments once on mount
  useEffect(() => {
    let mounted = true
    async function fetchDepartments() {
      try {
        // Categories endpoint - keep casing as /Categories
        const res = await api.get('/Categories')
        const data = res.data
        if (!mounted) return
        setDepartments(data?.$values ? data.$values : Array.isArray(data) ? data : [])
      } catch (e) {
        // Improved logging so backend 500 detail is visible in devtools
        console.error('Failed to fetch departments:', e?.response?.data ?? e?.response ?? e)
        if (!mounted) return
        setDepartments([])
      }
    }
    fetchDepartments()
    return () => { mounted = false }
  }, [])

  // Debounce tag input - update debouncedTag after 300ms of no typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedTag(tag.trim())
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [tag])

  // Normalize array-like response (handles $values)
  const normalizeArrayResponse = useCallback((d) => {
    if (!d) return []
    if (Array.isArray(d)) return d
    if (d.$values && Array.isArray(d.$values)) return d.$values
    return []
  }, [])

  // Expand nested reposts into feed items (pure function)
  const expandPostsWithNestedReposts = useCallback((originalPosts) => {
    const result = []
    const seenKeys = new Set()

    function pushIfNew(item) {
      const postId = item.postId ?? item.id ?? ''
      const repostId = item.repostId ?? ''
      const key = `${postId}::${repostId}`
      if (!seenKeys.has(key)) {
        seenKeys.add(key)
        result.push(item)
      }
    }

    for (const p of originalPosts) {
      const postId = p.postId ?? p.id
      const basePost = { ...p, postId }
      pushIfNew(basePost)

      const reposts = p.reposts ?? p.Reposts ?? p.Repost ?? p.repost ?? null
      if (Array.isArray(reposts) && reposts.length > 0) {
        for (const r of reposts) {
          const repostUser = r.user ?? r.User ?? null
          const repostedByName =
            r.repostedBy ??
            r.repostedByName ??
            repostUser?.fullName ??
            repostUser?.FullName ??
            r.userName ??
            r.UserName ??
            null

          const repostedById = r.userId ?? r.UserId ?? repostUser?.userId ?? repostUser?.id ?? null

          const repostItem = {
            ...p,
            postId: postId,
            isRepost: true,
            repostId: r.repostId ?? r.id ?? r.RepostId ?? null,
            repostedBy: repostedByName,
            repostedById: repostedById,
            repostedAt: r.createdAt ?? r.createdOn ?? r.CreatedAt ?? null
          }

          pushIfNew(repostItem)
        }
      }
    }

    result.sort((a, b) => {
      const aTime = new Date(a.repostedAt ?? a.createdAt ?? a.createdOn ?? a.datetime ?? 0).getTime()
      const bTime = new Date(b.repostedAt ?? b.createdAt ?? b.createdOn ?? b.datetime ?? 0).getTime()
      return bTime - aTime
    })

    return result
  }, [])

  // Fetch feed (cancellable)
  const fetchFeed = useCallback(async (options = {}) => {
    try {
      setLoading(true)

      // cancel previous request if still in-flight
      if (fetchCtrlRef.current) {
        try { fetchCtrlRef.current.abort() } catch { /* ignore */ }
        fetchCtrlRef.current = null
      }
      const ctrl = new AbortController()
      fetchCtrlRef.current = ctrl

      const params = new URLSearchParams()
      if (options.dept ?? dept) params.set('deptId', options.dept ?? dept)
      if (options.tag ?? debouncedTag) params.set('tag', options.tag ?? debouncedTag)
      if (isMine) params.set('mine', 'true')

      // basePaths use '/Posts' (correct casing)
      const basePaths = isMine ? ['/Posts/mine', '/Posts'] : ['/Posts/feed', '/Posts']
      let loaded = []
      for (const p of basePaths) {
        try {
          const url = `${p}${params.toString() ? `?${params.toString()}` : ''}`
          const res = await api.get(url, { signal: ctrl.signal })
          loaded = normalizeArrayResponse(res.data)
          console.log('Loaded posts from', p, 'count:', loaded.length)
          break
        } catch (err) {
          // axios abort handling
          if (err?.name === 'CanceledError' || err?.message === 'canceled') {
            console.debug('Fetch aborted:', p)
            return
          }

          if (err?.response?.status === 404) {
            console.warn(`Path ${p} returned 404, trying next.`)
            continue
          } else {
            throw err
          }
        }
      }

      setRawPosts(loaded || [])
    } catch (e) {
      console.error('Failed to fetch posts:', e)
      setRawPosts([])
    } finally {
      setLoading(false)
    }
  }, [debouncedTag, dept, isMine, normalizeArrayResponse])

  // Trigger feed fetch whenever debouncedTag, dept, or isMine changes
  useEffect(() => {
    fetchFeed()
    // cleanup on unmount
    return () => {
      if (fetchCtrlRef.current) {
        try { fetchCtrlRef.current.abort() } catch { /* ignore */ }
        fetchCtrlRef.current = null
      }
    }
  }, [fetchFeed])

  // Tag suggestions (debounced + only when typing)
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
        .slice(0, 20)

      setTagSuggestions(filtered)
    } catch (err) {
      console.error('Failed to fetch tags:', err)
      setTagSuggestions([])
    }
  }

  // call tag suggestions when user types (no API flood)
  useEffect(() => {
    if (!tag) {
      setTagSuggestions([])
      return
    }
    const t = setTimeout(() => fetchTagSuggestions(tag.trim()), 250)
    return () => clearTimeout(t)
  }, [tag, dept])

  // Memoize expansion: only recompute when rawPosts changes
  const posts = useMemo(() => {
    if (!rawPosts || rawPosts.length === 0) return []
    try {
      return expandPostsWithNestedReposts(rawPosts)
    } catch (err) {
      console.error('Failed to expand nested reposts:', err)
      return rawPosts
    }
  }, [rawPosts, expandPostsWithNestedReposts])

  // Render posts list memoized to avoid remapping unless 'posts' changes
  const postsList = useMemo(() => {
    if (!posts || posts.length === 0) return null
    return posts.map(p => <PostCard key={`${p.postId ?? p.id}::${p.repostId ?? ''}`} post={p} />)
  }, [posts])

  function handleSearch(e) {
    e.preventDefault()
    // update debouncedTag immediately so fetchFeed runs without waiting
    setDebouncedTag(tag.trim())
    // fetchFeed will react to debouncedTag change via useEffect
  }

  // Quick lightweight skeleton while loading
  const loadingSkeleton = (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ height: 12, width: '60%', background: '#eee', marginBottom: 8 }} />
      <div style={{ height: 12, width: '100%', background: '#f3f3f3', marginBottom: 8 }} />
      <div style={{ height: 12, width: '100%', background: '#f3f3f3', marginBottom: 8 }} />
    </div>
  )

  return (
    <div>
      <Navbar />
      <main className="container" style={{ marginTop: '2rem' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
          <h1>{isMine ? 'My Posts' : 'Knowledge Feed'}</h1>
          <button className="btn" onClick={() => navigate('/new')}>
            + New Post
          </button>
        </div>

        <form onSubmit={handleSearch} className="card" style={{ position: 'relative' }}>
          <div className="search-filters">
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Search tags..."
                value={tag}
                onChange={e => setTag(e.target.value)}
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
                      onClick={() => { setTag(s.tagName); setTagSuggestions([]); setDebouncedTag(s.tagName); }}>
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

        <div className="flex gap-2" style={{ marginBottom: '2rem' }}>
          <button className={`btn ${!isMine ? '' : 'btn-outline'}`} onClick={() => navigate('/feed')}>All Posts</button>
          <button className={`btn ${isMine ? '' : 'btn-outline'}`} onClick={() => navigate('/feed?mine=true')}>My Posts</button>
        </div>

        {loading ? (
          <div>{loadingSkeleton}</div>
        ) : posts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h3>{isMine ? 'No posts created yet' : 'No posts found'}</h3>
            <p style={{ color: '#6c757d', marginBottom: '1rem' }}>
              {isMine ? 'Create your first post to share knowledge with your team.' : 'Try adjusting your search filters or create a new post.'}
            </p>
            <button className="btn" onClick={() => navigate('/new')}>Create Post</button>
          </div>
        ) : (
          <div>{postsList}</div>
        )}
      </main>
    </div>
  )
}

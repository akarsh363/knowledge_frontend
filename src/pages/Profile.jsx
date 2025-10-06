// src/pages/Profile.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Navbar from '../Components/Navbar'
import PostCard from '../Components/PostCard'
import { getAuth } from '../utils/auth'
import '../styles/global.css'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [userPosts, setUserPosts] = useState([])
  const [userReposts, setUserReposts] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('posts') // 'posts' | 'reposts'
  const navigate = useNavigate()
  const auth = getAuth()

  useEffect(() => {
    // initial load: profile, posts, stats, and preload reposts silently
    fetchProfile()
    fetchUserPosts()
    fetchStats()
    fetchUserReposts(true) // silent prefetch so count is available on refresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-run repost fetch (non-silent) when tab switches to Reposts
  useEffect(() => {
    if (activeTab === 'reposts') {
      // fetch again to ensure fresh data when user actively opens the tab
      fetchUserReposts(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  async function fetchProfile() {
    try {
      const response = await api.get('/Users/me')
      setProfile(response.data)
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  async function fetchUserPosts() {
    try {
      const response = await api.get('/Posts/mine')
      const data = response.data
      const normalized = Array.isArray(data) ? data : (data?.$values || [])
      setUserPosts(normalized)
      console.log("Loaded user posts from /Posts/mine")
    } catch (error) {
      console.error('Failed to fetch user posts:', error)
      setUserPosts([])
    } finally {
      setLoading(false)
    }
  }

  /**
   * fetchUserReposts(silent = false)
   * - If silent === true, we won't toggle the global `loading` flag (used during initial prefetch)
   * - If silent === false, we show the loading spinner while fetching (used when user actively opens tab)
   */
  async function fetchUserReposts(silent = false) {
    try {
      if (!silent) setLoading(true)

      // Try feed endpoint first for relevance, fallback to /Posts to get broader data
      const candidatePaths = ['/Posts/feed', '/Posts']
      let allPosts = []
      for (const path of candidatePaths) {
        try {
          const res = await api.get(path)
          const d = res.data
          allPosts = Array.isArray(d) ? d : (d?.$values || [])
          console.log(`Loaded posts from ${path} (for repost scanning), count:`, allPosts.length)
          break
        } catch (err) {
          // try next path
          console.debug(`Path ${path} failed while fetching posts for reposts:`, err?.response?.status ?? err.message)
          continue
        }
      }

      if (!allPosts || allPosts.length === 0) {
        setUserReposts([])
        return
      }

      // Normalize current user's id
      const myId = auth?.userId ?? (profile?.userId) ?? null
      if (!myId) {
        console.warn('No current user id found; cannot compute reposts.')
        setUserReposts([])
        return
      }

      const repostItems = []

      for (const p of allPosts) {
        // reposts could be under different casing: reposts, Reposts, Repost, etc.
        const reposts = p.reposts ?? p.Reposts ?? p.Repost ?? p.repost ?? null
        if (!Array.isArray(reposts) || reposts.length === 0) continue

        for (const r of reposts) {
          // r may contain userId or nested user object
          const rUserId = r.userId ?? r.UserId ?? r.user?.userId ?? r.user?.id ?? r.User?.userId ?? null

          // compare as strings to be robust to number/string types
          if (String(rUserId) === String(myId)) {
            // Build a post-like object representing the repost (so PostCard renders it)
            const repostItem = {
              ...p, // copy original post fields (title, body, tags, attachments, etc.)
              postId: p.postId ?? p.id, // ensure postId exists
              isRepost: true,
              repostId: r.repostId ?? r.id ?? r.RepostId ?? null,
              repostedBy: r.userName ?? r.UserName ?? r.user?.fullName ?? r.User?.fullName ?? auth.fullName ?? r.repostedBy ?? null,
              repostedById: rUserId,
              repostedAt: r.createdAt ?? r.createdOn ?? r.CreatedAt ?? null
            }

            repostItems.push(repostItem)
          }
        }
      }

      // Sort reposts newest-first (by repostedAt fallback to post createdAt)
      repostItems.sort((a, b) => {
        const aTime = new Date(a.repostedAt ?? a.createdAt ?? 0).getTime()
        const bTime = new Date(b.repostedAt ?? b.createdAt ?? 0).getTime()
        return bTime - aTime
      })

      setUserReposts(repostItems)
    } catch (error) {
      console.error('Failed to fetch user reposts:', error)
      setUserReposts([])
    } finally {
      if (!silent) setLoading(false)
    }
  }

  async function fetchStats() {
    try {
      const response = await api.get('/Users/me/stats')
      setStats(response.data)
      console.log("Loaded stats from /Users/me/stats")
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      // Fallback compute from userPosts if available
      setStats({
        totalPosts: userPosts.length,
        totalUpvotes: userPosts.reduce((sum, post) => sum + (post.upvoteCount || 0), 0),
        totalDownvotes: userPosts.reduce((sum, post) => sum + (post.downvoteCount || 0), 0),
        totalCommentsReceived: userPosts.reduce((sum, post) => sum + (post.commentsCount || 0), 0),
        totalCommitsMade: 0
      })
    } finally {
      setLoading(false)
    }
  }

  // Helper to render list depending on active tab
  function renderTabContent() {
    if (activeTab === 'posts') {
      if (userPosts.length === 0) {
        return (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <h3>No posts yet</h3>
            <p style={{ color: '#6c757d', marginBottom: '1rem' }}>
              You haven't created any posts. Share your knowledge with the team!
            </p>
            <button className="btn" onClick={() => navigate('/new')}>
              Create Your First Post
            </button>
          </div>
        )
      }

      return <div>{userPosts.map(post => <PostCard key={post.postId} post={post} />)}</div>
    }

    // reposts tab
    if (userReposts.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>No reposts yet</h3>
          <p style={{ color: '#6c757d', marginBottom: '1rem' }}>
            You haven't reposted any posts yet.
          </p>
          <button className="btn" onClick={() => navigate('/feed')}>
            Browse Feed
          </button>
        </div>
      )
    }

    return <div>{userReposts.map(post => <PostCard key={`${post.postId}::${post.repostId ?? ''}`} post={post} />)}</div>
  }

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container loading">
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <main className="container" style={{ marginTop: '2rem' }}>
        <div className="card">
          <div className="flex gap-4 items-center">
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: profile?.profilePicture
                ? `url(${import.meta.env.VITE_API_BASE.replace(/\/api$/, "")}/${profile.profilePicture})`
                : '#007bff',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              color: 'white',
              fontSize: '2rem',
              fontWeight: 'bold'
            }}>
              {!profile?.profilePicture && (profile?.fullName?.[0] || auth.fullName?.[0] || '?')}
            </div>

            <div style={{ flex: 1 }}>
              <h1 style={{ marginBottom: '0.25rem' }}>
                {profile?.fullName || auth.fullName || 'Unknown User'}
              </h1>
              <p style={{ color: '#6c757d', marginBottom: '0.5rem' }}>
                {profile?.email || 'No email provided'}
              </p>
              {profile?.department && (
                <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                  {profile.department} Department
                </p>
              )}
            </div>

            <button
              className="btn btn-outline"
              onClick={() => navigate('/profile/edit')}
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#007bff', fontSize: '2rem', marginBottom: '0.5rem' }}>
              {stats?.totalPosts || 0}
            </h3>
            <p style={{ color: '#6c757d' }}>Posts Created</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#28a745', fontSize: '2rem', marginBottom: '0.5rem' }}>
              {stats?.totalUpvotes || 0}
            </h3>
            <p style={{ color: '#6c757d' }}>Total Upvotes</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#ffc107', fontSize: '2rem', marginBottom: '0.5rem' }}>
              {stats?.totalCommentsReceived || 0}
            </h3>
            <p style={{ color: '#6c757d' }}>Comments Received</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#6f42c1', fontSize: '2rem', marginBottom: '0.5rem' }}>
              {stats?.totalCommitsMade || 0}
            </h3>
            <p style={{ color: '#6c757d' }}>Commits Made</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="flex gap-4" style={{ borderBottom: '1px solid #e9ecef', marginBottom: '1.5rem' }}>
            <button
              className={`btn ${activeTab === 'posts' ? '' : 'btn-outline'}`}
              style={{ borderRadius: '0', borderBottom: activeTab === 'posts' ? '2px solid #007bff' : 'none' }}
              onClick={() => setActiveTab('posts')}
            >
              My Posts ({userPosts.length})
            </button>

            <button
              className={`btn ${activeTab === 'reposts' ? '' : 'btn-outline'}`}
              style={{ borderRadius: '0', borderBottom: activeTab === 'reposts' ? '2px solid #007bff' : 'none' }}
              onClick={() => setActiveTab('reposts')}
            >
              Reposts ({userReposts.length})
            </button>
          </div>

          {renderTabContent()}
        </div>
      </main>
    </div>
  )
}
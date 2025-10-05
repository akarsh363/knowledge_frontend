// src/pages/NewPost.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Navbar from '../Components/Navbar'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { getAuth } from '../utils/auth'
import '../styles/global.css'

export default function NewPost() {
  const [title, setTitle] = useState('')
  const [blocks, setBlocks] = useState([])
  const [input, setInput] = useState('')
  const [isCode, setIsCode] = useState(false)
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [tagSuggestions, setTagSuggestions] = useState([])
  const [allTagsByName, setAllTagsByName] = useState({})
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [profile, setProfile] = useState(null)
  const navigate = useNavigate()

  // get auth from local helper
  const auth = getAuth?.() ?? null

  useEffect(() => {
    loadAllTags()
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchProfile() {
    try {
      const res = await api.get('/Users/me')
      setProfile(res.data)
      console.log('Loaded user profile', res.data)
    } catch (err) {
      console.warn('Failed to load profile (will rely on auth fallback):', err)
      setProfile(null)
    }
  }

  async function loadAllTags() {
    try {
      const res = await api.get('/Tags')
      const all = Array.isArray(res.data) ? res.data : (res.data?.$values || [])
      const normalized = all.map(t => ({
        tagId: t.tagId ?? t.TagId ?? t.id,
        tagName: (t.tagName ?? t.TagName ?? t.name ?? '').toString(),
        deptId: t.deptId ?? t.DeptId ?? t.deptId
      }))
      const map = {}
      normalized.forEach(t => {
        if (t.tagName) map[t.tagName.trim().toLowerCase()] = t
      })
      setAllTagsByName(map)
    } catch (err) {
      console.error('Failed to load tags:', err)
      setAllTagsByName({})
    }
  }

  useEffect(() => {
    if (!tagInput.trim()) {
      setTagSuggestions([])
      return
    }
    const q = tagInput.trim().toLowerCase()
    const candidates = Object.values(allTagsByName)
      .filter(t => t.tagName.toLowerCase().includes(q) && !tags.includes(t.tagName))
      .slice(0, 20)
    setTagSuggestions(candidates)
  }, [tagInput, allTagsByName, tags])

  function addBlock() {
    if (!input.trim()) return
    const newBlock = isCode ? { type: 'code', content: input } : { type: 'text', content: input }
    setBlocks(prev => [...prev, newBlock])
    setInput('')
  }

  function removeBlock(index) {
    setBlocks(prev => prev.filter((_, i) => i !== index))
  }

  function handleFileChange(e) {
    const selectedFiles = Array.from(e.target.files || [])
    const maxSize = 10 * 1024 * 1024
    const validFiles = selectedFiles.filter(file => {
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Max size is 10MB.`)
        return false
      }
      return true
    })
    setFiles(validFiles)
  }

  function removeFile(index) {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  function addTag(tag) {
    if (!tags.includes(tag)) {
      if (!allTagsByName[tag.trim().toLowerCase()]) {
        alert(`Tag "${tag}" is not valid. Please select from suggestions.`)
        return
      }
      setTags(prev => [...prev, tag])
    }
    setTagInput('')
    setTagSuggestions([])
  }

  function removeTag(tag) {
    setTags(prev => prev.filter(t => t !== tag))
  }

  function logFormData(fd) {
    console.group('FormData contents')
    for (const pair of fd.entries()) {
      const key = pair[0]
      const value = pair[1]
      if (value instanceof File) {
        console.log(key, ': File ->', value.name, '(size', value.size, 'bytes, type', value.type + ')')
      } else {
        console.log(key, ':', value)
      }
    }
    console.groupEnd()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return

    // Auto-add textarea content if user forgot to click "Add Block"
    let effectiveBlocks = blocks
    if (effectiveBlocks.length === 0 && input.trim()) {
      effectiveBlocks = [{ type: isCode ? 'code' : 'text', content: input.trim() }]
      console.log('Auto-adding textarea content as a block for submission')
    }

    if (!title.trim() || effectiveBlocks.length === 0) {
      alert('Please fill in title and content')
      return
    }

    const validatedTags = tags.filter(t => allTagsByName[t.trim().toLowerCase()])
    if (tags.length > 0 && validatedTags.length === 0) {
      alert('Selected tags are not valid. Please choose from the suggestions.')
      return
    }

    // Determine DeptId: prefer auth, then profile fallback
    const deptFromAuth = auth?.departmentId ?? auth?.deptId ?? auth?.DepartmentId ?? auth?.department?.deptId ?? null
    const deptFromProfile =
      profile?.departmentId ??
      profile?.department?.deptId ??
      profile?.department?.departmentId ??
      profile?.deptId ??
      profile?.DepartmentId ??
      null

    const deptIdToSend = deptFromAuth ?? deptFromProfile ?? 0

    if (!deptIdToSend || deptIdToSend === 0) {
      alert('Your account does not have a department assigned. Please update your profile with a department before creating posts.')
      return
    }

    try {
      setSubmitting(true)
      setUploadProgress(0)

      const formData = new FormData()
      formData.append('Title', title.trim())
      formData.append('Body', JSON.stringify(effectiveBlocks))
      formData.append('DeptId', String(deptIdToSend))

      if (validatedTags.length > 0) {
        validatedTags.forEach(tag => formData.append('Tags', tag))
      }

      if (files.length > 0) {
        for (const file of files) {
          formData.append('Attachments', file)
        }
      }

      // DEBUG
      logFormData(formData)

      // Determine token (try common locations). If your api instance already attaches token, you can omit headers.
      const token =
        auth?.token ??
        auth?.accessToken ??
        auth?.jwt ??
        localStorage.getItem('authToken') ??
        localStorage.getItem('token') ??
        null

      const requestConfig = {
        timeout: 60000,
        onUploadProgress: (progressEvent) => {
          if (!progressEvent) return
          const { loaded, total } = progressEvent
          if (total) {
            const percent = Math.round((loaded * 100) / total)
            setUploadProgress(percent)
            console.debug('Upload progress', percent)
          } else {
            setUploadProgress(prev => Math.min(99, prev + 1))
          }
        }
      }

      // Attach Authorization header only if token is available. IMPORTANT: do NOT set Content-Type here.
      if (token) {
        requestConfig.headers = { Authorization: `Bearer ${token}` }
      }

      // Use axios instance
      const res = await api.post('/Posts', formData, requestConfig)

      console.log('Post created response:', res?.data)
      const newId = res?.data?.postId ?? res?.data?.post?.postId ?? res?.data?.id
      if (newId) navigate(`/post/${newId}`)
      else navigate('/feed')
    } catch (err) {
      console.error('Failed to create post:', err)

      const serverMessage = err?.response?.data?.message
      const serverDetail = err?.response?.data?.detail || err?.response?.data

      if (err?.code === 'ECONNABORTED' || (err?.message && err.message.toLowerCase().includes('timeout'))) {
        alert('Upload timed out. The server took too long to respond. Try again with a smaller attachment or check server availability.')
      } else if (serverDetail) {
        console.error('Server detail:', serverDetail)
        alert(`${serverMessage || 'Failed to create post'}\n\nServer detail (see console):\n${JSON.stringify(serverDetail)}`)
      } else {
        alert(serverMessage || err?.message || 'Failed to create post')
      }
    } finally {
      setSubmitting(false)
      setUploadProgress(0)
    }
  }

  const canSubmit =
    !submitting &&
    (title.trim().length > 0 || input.trim().length > 0 || blocks.length > 0)

  return (
    <div>
      <Navbar />
      <main className="container" style={{ marginTop: '2rem' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
          <h1>Create New Post</h1>
          <button className="btn btn-outline" onClick={() => navigate('/feed')}>
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card">
            {/* Title */}
            <label style={{ fontWeight: 'bold' }}>Title *</label>
            <input
              type="text"
              placeholder="Enter a descriptive title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={200}
              required
            />
            <div style={{ fontSize: '0.8rem', color: '#6c757d', textAlign: 'right' }}>
              {title.length}/200
            </div>

            {/* Block Editor */}
            <div style={{ margin: '1rem 0' }}>
              <label style={{ fontWeight: 'bold' }}>Content *</label>
              <textarea
                rows={6}
                placeholder={isCode ? 'Write code snippet here...' : 'Write text content here...'}
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <div className="flex gap-2" style={{ marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsCode(prev => !prev)}
                >
                  {isCode ? 'Switch to Text' : 'Add Code Snippet'}
                </button>
                <button type="button" className="btn" onClick={addBlock}>
                  Add Block
                </button>
              </div>
            </div>

            {/* Preview */}
            {blocks.length > 0 && (
              <div className="card" style={{ background: '#f8f9fa', marginTop: '1rem' }}>
                {blocks.map((block, idx) =>
                  block.type === 'code' ? (
                    <div key={idx} style={{ marginBottom: '1rem' }}>
                      <SyntaxHighlighter language="javascript" showLineNumbers>
                        {block.content}
                      </SyntaxHighlighter>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => removeBlock(idx)}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div key={idx} style={{ marginBottom: '0.5rem' }}>
                      <p>{block.content}</p>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => removeBlock(idx)}
                        style={{ marginTop: '0.25rem' }}
                      >
                        Remove
                      </button>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Tags */}
            <label style={{ fontWeight: 'bold', marginTop: '1rem' }}>Tags (select from suggestions)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Type to search tags"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
              />
              {tagSuggestions.length > 0 && (
                <ul
                  style={{
                    background: '#fff',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginTop: '0.25rem',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    position: 'absolute',
                    zIndex: 1000,
                    width: '100%'
                  }}
                >
                  {tagSuggestions.map(s => (
                    <li
                      key={s.tagId}
                      style={{ padding: '0.5rem', cursor: 'pointer' }}
                      onClick={() => addTag(s.tagName)}
                    >
                      {s.tagName}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              {tags.map((tag, idx) => (
                <span key={idx} className="tag" style={{ marginRight: '0.5rem' }}>
                  {tag}{' '}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    style={{ marginLeft: '0.25rem' }}
                  >
                    ✖
                  </button>
                </span>
              ))}
            </div>

            {/* Attachments */}
            <label style={{ fontWeight: 'bold', marginTop: '1rem' }}>Attachments</label>
            <input type="file" multiple onChange={handleFileChange} />
            {files.length > 0 && (
              <ul>
                {files.map((f, i) => (
                  <li key={i}>
                    {f.name}{' '}
                    <button type="button" onClick={() => removeFile(i)}>
                      ✖
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Upload progress */}
            {submitting && uploadProgress > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ height: '8px', background: '#e9ecef', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${uploadProgress}%`, height: '100%', transition: 'width 200ms linear', background: '#007bff' }} />
                </div>
                <div style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '0.25rem' }}>
                  Uploading... {uploadProgress}%
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn"
              disabled={!canSubmit}
              style={{ marginTop: '1rem' }}
            >
              {submitting ? 'Creating Post...' : 'Create Post'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

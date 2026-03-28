import { useCallback, useEffect, useMemo, useState } from 'react'

const API = '/api/users'
const PAGE_SIZE = 5

function isTempId(id) {
  return typeof id === 'string' && id.startsWith('temp-')
}

async function parseError(res) {
  try {
    const body = await res.json()
    return body.error || res.statusText
  } catch {
    return res.statusText || 'Request failed'
  }
}

export default function App() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const [filterText, setFilterText] = useState('')
  const [sortKey, setSortKey] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)

  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', department: '' })
  const [actionError, setActionError] = useState(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await fetch(API)
      if (!res.ok) throw new Error(await parseError(res))
      const data = await res.json()
      setUsers(data)
    } catch (e) {
      setLoadError(e.message || 'Failed to load users')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const filteredSorted = useMemo(() => {
    const q = filterText.trim().toLowerCase()
    let list = users
    if (q) {
      list = users.filter((u) => {
        const blob = `${u.name} ${u.email} ${u.department || ''}`.toLowerCase()
        return blob.includes(q)
      })
    }
    const dir = sortDir === 'asc' ? 1 : -1
    const sorted = [...list].sort((a, b) => {
      let va
      let vb
      if (sortKey === 'createdAt') {
        va = new Date(a.createdAt || 0).getTime()
        vb = new Date(b.createdAt || 0).getTime()
      } else {
        va = String(a[sortKey] ?? '').toLowerCase()
        vb = String(b[sortKey] ?? '').toLowerCase()
      }
      if (va < vb) return -1 * dir
      if (va > vb) return 1 * dir
      return 0
    })
    return sorted
  }, [users, filterText, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE))

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const pageSlice = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredSorted.slice(start, start + PAGE_SIZE)
  }, [filteredSorted, page])

  const resetForm = () => {
    setEditingId(null)
    setForm({ name: '', email: '', department: '' })
  }

  const openEdit = (user) => {
    setEditingId(user._id)
    setForm({
      name: user.name,
      email: user.email,
      department: user.department || '',
    })
    setActionError(null)
  }

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setActionError(null)
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      department: form.department.trim(),
    }
    if (!payload.name || !payload.email) {
      setActionError('Name and email are required.')
      return
    }

    if (editingId && !isTempId(editingId)) {
      const targetId = editingId
      const prev = users.find((u) => u._id === targetId)
      if (!prev) return

      setUsers((list) =>
        list.map((u) =>
          u._id === targetId ? { ...u, ...payload, __optimistic: true } : u
        )
      )
      resetForm()

      try {
        const res = await fetch(`${API}/${targetId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error(await parseError(res))
        const updated = await res.json()
        setUsers((list) =>
          list.map((u) =>
            u._id === targetId ? { ...updated, __optimistic: false } : u
          )
        )
      } catch (err) {
        setUsers((list) =>
          list.map((u) =>
            u._id === targetId ? { ...prev, __optimistic: false } : u
          )
        )
        setActionError(err.message || 'Update failed')
      }
      return
    }

    if (editingId && isTempId(editingId)) {
      setActionError('Please wait until the new user is saved.')
      return
    }

    const tempId = `temp-${crypto.randomUUID()}`
    const optimistic = {
      _id: tempId,
      ...payload,
      __optimistic: true,
      createdAt: new Date().toISOString(),
    }
    setUsers((list) => [optimistic, ...list])
    resetForm()

    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(await parseError(res))
      const created = await res.json()
      setUsers((list) =>
        list.map((u) => (u._id === tempId ? { ...created, __optimistic: false } : u))
      )
    } catch (err) {
      setUsers((list) => list.filter((u) => u._id !== tempId))
      setActionError(err.message || 'Create failed')
    }
  }

  const handleDelete = async (user) => {
    if (isTempId(user._id)) return
    setActionError(null)
    const snapshot = users
    setUsers((list) => list.filter((u) => u._id !== user._id))
    if (editingId === user._id) resetForm()

    try {
      const res = await fetch(`${API}/${user._id}`, { method: 'DELETE' })
      if (!res.ok && res.status !== 204) throw new Error(await parseError(res))
    } catch (err) {
      setUsers(snapshot)
      setActionError(err.message || 'Delete failed')
    }
  }

  const sortIndicator = (key) =>
    sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''

  return (
    <div className="bigDiv">
      <header className="titleArea">
        <h1 style={{ letterSpacing: '1px' }}>My User List App</h1>
        <p>react + node + mongodb (crud thing)</p>
      </header>

      {loadError && (
        <div className="errMsg">
          <b>Error loading:</b> {loadError}
          <br />
          <small>make sure mongodb is on and server is port 3001</small>
        </div>
      )}
      {actionError && (
        <div className="errMsg">
          {actionError}{' '}
          <button type="button" className="dismissLnk" onClick={() => setActionError(null)}>
            [dismiss]
          </button>
        </div>
      )}

      <section className="whiteBox">
        <h3>{editingId && !isTempId(editingId) ? 'Edit User' : 'Add New User'}</h3>
        <form className="myForm" onSubmit={handleSubmit}>
          <label className="lbl">
            Name:
            <input
              className="txt_input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </label>
          <label className="lbl">
            Email:
            <input
              className="txt_input"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </label>
          <label className="lbl">
            Department (optional):
            <input
              className="txt_input"
              value={form.department}
              onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
              placeholder="type something here"
            />
          </label>
          <div className="buttons_div">
            <button type="submit" className="goButton">
              {editingId && !isTempId(editingId) ? 'UPDATE' : 'ADD USER'}
            </button>
            {editingId && (
              <button type="button" className="grayButton" onClick={resetForm}>
                cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="whiteBox">
        <div className="searchRow">
          <label>
            Search / filter users:
            <br />
            <input
              id="findBox"
              type="search"
              value={filterText}
              onChange={(e) => {
                setFilterText(e.target.value)
                setPage(1)
              }}
              placeholder="name email dept..."
            />
          </label>
          <span className="howMany">
            showing {filteredSorted.length} total
          </span>
        </div>

        {loading ? (
          <p className="grayTxt">loading please wait...</p>
        ) : (
          <>
            <div className="scrollMaybe">
              <table id="userTable">
                <thead>
                  <tr>
                    <th>
                      <button type="button" className="colSort" onClick={() => toggleSort('name')}>
                        name{sortIndicator('name')}
                      </button>
                    </th>
                    <th>
                      <button type="button" className="colSort" onClick={() => toggleSort('email')}>
                        email{sortIndicator('email')}
                      </button>
                    </th>
                    <th>
                      <button type="button" className="colSort" onClick={() => toggleSort('department')}>
                        dept{sortIndicator('department')}
                      </button>
                    </th>
                    <th>
                      <button type="button" className="colSort" onClick={() => toggleSort('createdAt')}>
                        when added{sortIndicator('createdAt')}
                      </button>
                    </th>
                    <th>stuff</th>
                  </tr>
                </thead>
                <tbody>
                  {pageSlice.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="grayTxt">
                        nothing here try different search
                      </td>
                    </tr>
                  ) : (
                    pageSlice.map((u) => (
                      <tr key={u._id} className={u.__optimistic ? 'notSavedYet' : ''}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.department || '-'}</td>
                        <td>{u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}</td>
                        <td className="lastCol">
                          {u.__optimistic && <span className="waitText">saving...</span>}
                          <button
                            type="button"
                            className="miniBtn"
                            onClick={() => openEdit(u)}
                            disabled={u.__optimistic}
                          >
                            edit
                          </button>
                          <button
                            type="button"
                            className="miniBtn delOne"
                            onClick={() => handleDelete(u)}
                            disabled={u.__optimistic}
                          >
                            X
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="pageBtns">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                &lt;&lt; prev
              </button>
              <span style={{ fontSize: '14px' }}>
                page {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                next &gt;&gt;
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  )
}

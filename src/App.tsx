import { useCallback, useEffect, useMemo, useState } from 'react'
import { CircleCheck as CheckCircle2, ClipboardList, GraduationCap, Pencil, Plus, Search, Trash2, Users, Circle as XCircle } from 'lucide-react'
import { supabase } from './lib/supabase'
import {
  type AmbitusDelegate,
  type DelegateStatus,
  type DelegateType,
  type ExternalDelegate,
} from './types'
import { DelegateForm } from './components/DelegateForm'
import { ConfirmDialog } from './components/ConfirmDialog'

type AnyDelegate = AmbitusDelegate | ExternalDelegate

type ToastState = { message: string; error?: boolean; id: number } | null

const tableName: Record<DelegateType, string> = {
  ambitus: 'ambitus_delegates',
  external: 'external_delegates',
}

function isAmbitus(d: AnyDelegate): d is AmbitusDelegate {
  return 'class_year' in d
}

function isExternal(d: AnyDelegate): d is ExternalDelegate {
  return 'accommodation_required' in d
}

export default function App() {
  const [activeTab, setActiveTab] = useState<DelegateType>('ambitus')
  const [ambitus, setAmbitus] = useState<AmbitusDelegate[]>([])
  const [external, setExternal] = useState<ExternalDelegate[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<DelegateStatus | 'all'>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AnyDelegate | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<AnyDelegate | null>(null)
  const [toast, setToast] = useState<ToastState>(null)

  const showToast = useCallback((message: string, error = false) => {
    const id = Date.now()
    setToast({ message, error, id })
    setTimeout(() => {
      setToast((cur) => (cur?.id === id ? null : cur))
    }, 3500)
  }, [])

  const loadDelegates = useCallback(async () => {
    setLoading(true)
    const [amb, ext] = await Promise.all([
      supabase.from('ambitus_delegates').select('*').order('created_at', { ascending: false }),
      supabase.from('external_delegates').select('*').order('created_at', { ascending: false }),
    ])

    if (amb.error) {
      showToast('Failed to load Ambitus delegates.', true)
    } else {
      setAmbitus(amb.data as AmbitusDelegate[])
    }
    if (ext.error) {
      showToast('Failed to load External delegates.', true)
    } else {
      setExternal(ext.data as ExternalDelegate[])
    }
    setLoading(false)
  }, [showToast])

  useEffect(() => {
    loadDelegates()
  }, [loadDelegates])

  const currentList = useMemo<AnyDelegate[]>(
    () => (activeTab === 'ambitus' ? ambitus : external),
    [activeTab, ambitus, external],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return currentList.filter((d) => {
      if (statusFilter !== 'all' && d.status !== statusFilter) return false
      if (!q) return true
      return [
        d.full_name,
        d.email ?? '',
        d.phone ?? '',
        d.institution ?? '',
        d.allocated_committee ?? '',
        d.allocated_portfolio ?? '',
        isAmbitus(d) ? d.class_year ?? '' : '',
        isExternal(d) ? (d.accommodation_required ? 'accommodation' : '') : '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [currentList, search, statusFilter])

  const stats = useMemo(() => {
    const calc = (list: AnyDelegate[]) => ({
      total: list.length,
      confirmed: list.filter((d) => d.status === 'confirmed').length,
      pending: list.filter((d) => d.status === 'pending').length,
      allocated: list.filter((d) => d.allocated_committee && d.allocated_portfolio).length,
    })
    return {
      ambitus: calc(ambitus),
      external: calc(external),
    }
  }, [ambitus, external])

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (delegate: AnyDelegate) => {
    setEditing(delegate)
    setFormOpen(true)
  }

  const handleSave = async (data: Partial<AnyDelegate>) => {
    const table = tableName[activeTab]
    const { id, created_at, updated_at, ...payload } = data as Record<string, unknown>

    // Coerce empty strings to null for optional text fields
    const clean: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(payload)) {
      clean[k] = v === '' ? null : v
    }
    if (clean.full_name === null) clean.full_name = ''
    if (clean.status === null) clean.status = 'pending'

    if (editing) {
      const { error } = await supabase
        .from(table)
        .update({ ...clean, updated_at: new Date().toISOString() })
        .eq('id', editing.id)
      if (error) throw error
      showToast('Delegate updated successfully.')
    } else {
      const { error } = await supabase.from(table).insert(clean)
      if (error) throw error
      showToast('Delegate added successfully.')
    }
    setFormOpen(false)
    setEditing(null)
    await loadDelegates()
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    const table = tableName[activeTab]
    const { error } = await supabase.from(table).delete().eq('id', confirmDelete.id)
    if (error) {
      showToast('Failed to delete delegate.', true)
    } else {
      showToast('Delegate removed.')
    }
    setConfirmDelete(null)
    await loadDelegates()
  }

  const activeStats = activeTab === 'ambitus' ? stats.ambitus : stats.external

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-logo">M</div>
            <div className="brand-text">
              <h1>MUN Delegate Management</h1>
              <p>Ambitus &amp; External Delegate Allocation System</p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-pill">
              <div className="stat-value">{activeStats.total}</div>
              <div className="stat-label">Total</div>
            </div>
            <div className="stat-pill">
              <div className="stat-value">{activeStats.confirmed}</div>
              <div className="stat-label">Confirmed</div>
            </div>
            <div className="stat-pill">
              <div className="stat-value">{activeStats.pending}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-pill">
              <div className="stat-value">{activeStats.allocated}</div>
              <div className="stat-label">Allocated</div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="tabs-bar">
        <div className="tabs-inner">
          <button
            className={`tab ${activeTab === 'ambitus' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('ambitus')
              setSearch('')
              setStatusFilter('all')
            }}
          >
            <GraduationCap size={16} />
            Ambitus Delegates
            <span className="tab-badge">{ambitus.length}</span>
          </button>
          <button
            className={`tab ${activeTab === 'external' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('external')
              setSearch('')
              setStatusFilter('all')
            }}
          >
            <Users size={16} />
            External Delegates
            <span className="tab-badge">{external.length}</span>
          </button>
        </div>
      </nav>

      {/* Main */}
      <main className="main">
        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-box">
            <Search size={16} />
            <input
              className="search-input"
              placeholder="Search by name, email, institution, allocation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as DelegateStatus | 'all')}
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
          <div className="toolbar-actions">
            <button className="btn btn-accent" onClick={openAdd}>
              <Plus size={18} />
              Add Delegate
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            Loading delegates...
          </div>
        ) : filtered.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <ClipboardList size={48} />
              <h3>No delegates yet</h3>
              <p>
                {currentList.length === 0
                  ? `Add your first ${activeTab} delegate to get started.`
                  : 'No delegates match your search or filter.'}
              </p>
              {currentList.length === 0 && (
                <button className="btn btn-accent" onClick={openAdd}>
                  <Plus size={18} />
                  Add Delegate
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Institution</th>
                    <th>Preferences</th>
                    <th>Allocation</th>
                    <th>Status</th>
                    <th style={{ width: 80 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d) => {
                    const prefs = [
                      d.preferred_committee_1,
                      d.preferred_portfolio_1,
                      d.preferred_committee_2,
                      d.preferred_portfolio_2,
                    ].filter(Boolean)
                    return (
                      <tr key={d.id}>
                        <td>
                          <div className="delegate-name">{d.full_name}</div>
                          <div className="delegate-sub">
                            {d.email || '—'}
                            {isAmbitus(d) && d.class_year ? ` · ${d.class_year}` : ''}
                            {isExternal(d) && d.accommodation_required ? ' · Accommodation' : ''}
                          </div>
                        </td>
                        <td>{d.institution || '—'}</td>
                        <td>
                          {prefs.length > 0 ? (
                            <div className="allocation">
                              <span className="allocation-portfolio">
                                1: {d.preferred_committee_1 ?? '—'} / {d.preferred_portfolio_1 ?? '—'}
                              </span>
                              <span className="allocation-portfolio">
                                2: {d.preferred_committee_2 ?? '—'} / {d.preferred_portfolio_2 ?? '—'}
                              </span>
                            </div>
                          ) : (
                            <span className="allocation-empty">No preferences set</span>
                          )}
                        </td>
                        <td>
                          {d.allocated_committee && d.allocated_portfolio ? (
                            <div className="allocation">
                              <span className="allocation-committee">{d.allocated_committee}</span>
                              <span className="allocation-portfolio">{d.allocated_portfolio}</span>
                            </div>
                          ) : (
                            <span className="allocation-empty">Not allocated</span>
                          )}
                        </td>
                        <td>
                          <span className={`status-badge status-${d.status}`}>{d.status}</span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              className="btn-icon"
                              onClick={() => openEdit(d)}
                              aria-label="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              className="btn-icon danger"
                              onClick={() => setConfirmDelete(d)}
                              aria-label="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {formOpen && (
        <DelegateForm
          type={activeTab}
          initial={editing}
          onSave={handleSave}
          onClose={() => {
            setFormOpen(false)
            setEditing(null)
          }}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete delegate?"
          message={`This will permanently remove ${confirmDelete.full_name} from the ${activeTab} delegate list.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.error ? 'error' : ''}`}>
          {toast.error ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
          {toast.message}
        </div>
      )}
    </div>
  )
}

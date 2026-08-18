import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import {
  COMMITTEES,
  PORTFOLIOS,
  STATUS_OPTIONS,
  type AmbitusDelegate,
  type DelegateStatus,
  type DelegateType,
  type ExternalDelegate,
} from '../types'

type DelegateData = Partial<AmbitusDelegate> & Partial<ExternalDelegate>

interface Props {
  type: DelegateType
  initial: DelegateData | null
  onSave: (data: DelegateData) => Promise<void>
  onClose: () => void
}

const emptyForm: DelegateData = {
  full_name: '',
  email: '',
  phone: '',
  institution: '',
  experience: '',
  preferred_committee_1: '',
  preferred_committee_2: '',
  preferred_portfolio_1: '',
  preferred_portfolio_2: '',
  allocated_committee: '',
  allocated_portfolio: '',
  status: 'pending',
  notes: '',
  class_year: '',
  accommodation_required: false,
}

export function DelegateForm({ type, initial, onSave, onClose }: Props) {
  const [form, setForm] = useState<DelegateData>(initial ?? emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const update = (field: keyof DelegateData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.full_name?.trim()) {
      setError('Full name is required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSave(form)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save delegate.')
    } finally {
      setSaving(false)
    }
  }

  const isAmbitus = type === 'ambitus'
  const titleLabel = isAmbitus ? 'Ambitus Delegate' : 'External Delegate'
  const editMode = !!initial

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            {editMode ? `Edit ${titleLabel}` : `Add ${titleLabel}`}
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              {/* Personal Details */}
              <div className="form-section-title">Personal Details</div>

              <div className="form-field full">
                <label className="form-label">
                  Full Name <span className="required">*</span>
                </label>
                <input
                  className="form-input"
                  value={form.full_name ?? ''}
                  onChange={(e) => update('full_name', e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  autoFocus
                />
              </div>

              <div className="form-field">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={form.email ?? ''}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="delegate@example.com"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Phone</label>
                <input
                  className="form-input"
                  value={form.phone ?? ''}
                  onChange={(e) => update('phone', e.target.value)}
                  placeholder="+91 ..."
                />
              </div>

              <div className="form-field">
                <label className="form-label">Institution</label>
                <input
                  className="form-input"
                  value={form.institution ?? ''}
                  onChange={(e) => update('institution', e.target.value)}
                  placeholder={isAmbitus ? 'Home institution' : 'Visiting institution'}
                />
              </div>

              {isAmbitus ? (
                <div className="form-field">
                  <label className="form-label">Class / Year</label>
                  <input
                    className="form-input"
                    value={form.class_year ?? ''}
                    onChange={(e) => update('class_year', e.target.value)}
                    placeholder="e.g. 2nd Year BA"
                  />
                </div>
              ) : (
                <div className="form-field">
                  <label className="form-label">Accommodation Required</label>
                  <label className="form-checkbox">
                    <input
                      type="checkbox"
                      checked={form.accommodation_required ?? false}
                      onChange={(e) => update('accommodation_required', e.target.checked)}
                    />
                    <span>Needs accommodation during conference</span>
                  </label>
                </div>
              )}

              <div className="form-field full">
                <label className="form-label">MUN Experience</label>
                <textarea
                  className="form-textarea"
                  value={form.experience ?? ''}
                  onChange={(e) => update('experience', e.target.value)}
                  placeholder="Previous conferences, portfolios, awards..."
                />
              </div>

              {/* Preferences */}
              <div className="form-section-title">Committee & Portfolio Preferences</div>

              <div className="form-field">
                <label className="form-label">Preferred Committee 1</label>
                <select
                  className="form-select"
                  value={form.preferred_committee_1 ?? ''}
                  onChange={(e) => update('preferred_committee_1', e.target.value)}
                >
                  <option value="">— Select —</option>
                  {COMMITTEES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Preferred Committee 2</label>
                <select
                  className="form-select"
                  value={form.preferred_committee_2 ?? ''}
                  onChange={(e) => update('preferred_committee_2', e.target.value)}
                >
                  <option value="">— Select —</option>
                  {COMMITTEES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Preferred Portfolio 1</label>
                <select
                  className="form-select"
                  value={form.preferred_portfolio_1 ?? ''}
                  onChange={(e) => update('preferred_portfolio_1', e.target.value)}
                >
                  <option value="">— Select —</option>
                  {PORTFOLIOS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Preferred Portfolio 2</label>
                <select
                  className="form-select"
                  value={form.preferred_portfolio_2 ?? ''}
                  onChange={(e) => update('preferred_portfolio_2', e.target.value)}
                >
                  <option value="">— Select —</option>
                  {PORTFOLIOS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Allocation */}
              <div className="form-section-title">Final Allocation</div>

              <div className="form-field">
                <label className="form-label">Allocated Committee</label>
                <select
                  className="form-select"
                  value={form.allocated_committee ?? ''}
                  onChange={(e) => update('allocated_committee', e.target.value)}
                >
                  <option value="">— Not yet allocated —</option>
                  {COMMITTEES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Allocated Portfolio</label>
                <select
                  className="form-select"
                  value={form.allocated_portfolio ?? ''}
                  onChange={(e) => update('allocated_portfolio', e.target.value)}
                >
                  <option value="">— Not yet allocated —</option>
                  {PORTFOLIOS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={form.status ?? 'pending'}
                  onChange={(e) => update('status', e.target.value as DelegateStatus)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s} className="capitalize">{s}</option>
                  ))}
                </select>
              </div>

              <div className="form-field full">
                <label className="form-label">Internal Notes</label>
                <textarea
                  className="form-textarea"
                  value={form.notes ?? ''}
                  onChange={(e) => update('notes', e.target.value)}
                  placeholder="Organizer notes..."
                />
              </div>

              {error && <div className="form-error">{error}</div>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-accent" disabled={saving}>
              {saving ? 'Saving...' : editMode ? 'Update Delegate' : 'Add Delegate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

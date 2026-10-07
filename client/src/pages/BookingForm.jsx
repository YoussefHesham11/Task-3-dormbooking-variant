import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { roomNumber: '', startDate: '', endDate: '', purpose: '' }

// The server sends "2026-10-10T00:00:00.000Z", but <input type="date"> only accepts "YYYY-MM-DD"
const toDateInput = (iso) => (iso ? iso.slice(0, 10) : '')

export default function BookingForm() {
  const nav = useNavigate()
  const { id } = useParams()          // undefined on /bookings/new, set on /bookings/:id
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  // TODO 3: edit mode → load the booking and fill the form
  useEffect(() => {
    if (!id) return
    api.get(`/bookings/${id}`)
      .then(({ data }) => {
        setForm({
          roomNumber: data.roomNumber,
          startDate: toDateInput(data.startDate),
          endDate: toDateInput(data.endDate),
          purpose: data.purpose || ''
        })
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load booking'))
  }, [id])

  // TODO 1: one handler for all inputs, using each input's `name`
  function onChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // TODO 2 + 3: POST when creating, PATCH when editing
  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    // Only these 4 fields are sent; bookedBy is never sent (the server takes it from the token)
    const body = {
      roomNumber: form.roomNumber,
      startDate: form.startDate,
      endDate: form.endDate,
      purpose: form.purpose
    }
    try {
      if (id) await api.patch(`/bookings/${id}`, body)
      else await api.post('/bookings', body)
      nav('/bookings')
    } catch (err) {
      // Shows the server's message for 400 (bad dates), 403 (not yours) or 409 (room taken)
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Booking</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="input"
          name="roomNumber"
          placeholder="Room number (e.g. B2-104)"
          value={form.roomNumber}
          onChange={onChange}
          required
        />
        <label className="block text-sm">
          Start date
          <input className="input" type="date" name="startDate" value={form.startDate} onChange={onChange} required />
        </label>
        <label className="block text-sm">
          End date
          <input className="input" type="date" name="endDate" value={form.endDate} onChange={onChange} required />
        </label>
        <textarea
          className="input"
          name="purpose"
          placeholder="Purpose (optional)"
          rows={3}
          value={form.purpose}
          onChange={onChange}
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}

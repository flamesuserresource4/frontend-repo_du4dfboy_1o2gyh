import { useEffect, useMemo, useState } from 'react'

const categories = [
  { id: 'skin', label: 'Skin' },
  { id: 'hair', label: 'Hair' },
  { id: 'style', label: 'Style' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'sleep', label: 'Sleep' },
  { id: 'confidence', label: 'Confidence' },
]

function App() {
  const BACKEND = useMemo(() => import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', [])
  const [activeCat, setActiveCat] = useState('skin')

  // Profile state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    skin_type: '',
    hair_type: '',
    style_vibe: ''
  })
  const [profileStatus, setProfileStatus] = useState('')

  // Data
  const [routines, setRoutines] = useState([])
  const [tips, setTips] = useState([])
  const [loading, setLoading] = useState(false)

  // Create routine form
  const [newRoutine, setNewRoutine] = useState({ title: '', stepsText: '' })
  const [creating, setCreating] = useState(false)

  // Create tip form
  const [newTip, setNewTip] = useState({ title: '', body: '' })
  const [creatingTip, setCreatingTip] = useState(false)

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCat])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [rRes, tRes] = await Promise.all([
        fetch(`${BACKEND}/api/routines?category=${activeCat}`),
        fetch(`${BACKEND}/api/tips?category=${activeCat}`)
      ])
      const rData = await rRes.json()
      const tData = await tRes.json()
      setRoutines(Array.isArray(rData) ? rData : [])
      setTips(Array.isArray(tData) ? tData : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async (e) => {
    e.preventDefault()
    setProfileStatus('Saving...')
    try {
      const res = await fetch(`${BACKEND}/api/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })
      const data = await res.json()
      if (res.ok) {
        setProfileStatus('Saved ✓')
        // Load personalized routines for this email
        await fetchData()
      } else {
        setProfileStatus(data?.detail || 'Failed')
      }
    } catch (e) {
      setProfileStatus('Network error')
    } finally {
      setTimeout(() => setProfileStatus(''), 2000)
    }
  }

  const createRoutine = async (e) => {
    e.preventDefault()
    if (!newRoutine.title.trim()) return
    setCreating(true)
    try {
      const steps = newRoutine.stepsText
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean)
      const res = await fetch(`${BACKEND}/api/routines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newRoutine.title,
          steps,
          category: activeCat,
          owner_email: profile.email || undefined
        })
      })
      if (res.ok) {
        setNewRoutine({ title: '', stepsText: '' })
        fetchData()
      }
    } finally {
      setCreating(false)
    }
  }

  const createTip = async (e) => {
    e.preventDefault()
    if (!newTip.title.trim() || !newTip.body.trim()) return
    setCreatingTip(true)
    try {
      const res = await fetch(`${BACKEND}/api/tips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: activeCat,
          title: newTip.title,
          body: newTip.body,
          tags: []
        })
      })
      if (res.ok) {
        setNewTip({ title: '', body: '' })
        fetchData()
      }
    } finally {
      setCreatingTip(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-sky-50 to-emerald-50">
      <header className="sticky top-0 backdrop-blur bg-white/60 border-b border-black/5">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-emerald-500" />
            <h1 className="text-xl font-bold text-gray-800">LooksMax</h1>
          </div>
          <nav className="flex items-center gap-2">
            <a href="/test" className="text-sm text-gray-600 hover:text-gray-900">System Check</a>
            <a href="https://" className="text-sm text-gray-400 pointer-events-none">v1</a>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
        {/* Left: Profile */}
        <section className="lg:col-span-1 bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-black/5 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Profile</h2>
          <form className="space-y-3" onSubmit={saveProfile}>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Name</label>
              <input value={profile.name} onChange={e=>setProfile(p=>({...p, name: e.target.value}))} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" placeholder="Optional" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input value={profile.email} onChange={e=>setProfile(p=>({...p, email: e.target.value}))} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" placeholder="Use to save preferences" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Skin type</label>
              <select value={profile.skin_type} onChange={e=>setProfile(p=>({...p, skin_type: e.target.value}))} className="w-full rounded-md border border-gray-300 px-3 py-2">
                <option value="">Select</option>
                <option>normal</option>
                <option>oily</option>
                <option>dry</option>
                <option>combination</option>
                <option>sensitive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Hair type</label>
              <select value={profile.hair_type} onChange={e=>setProfile(p=>({...p, hair_type: e.target.value}))} className="w-full rounded-md border border-gray-300 px-3 py-2">
                <option value="">Select</option>
                <option>straight</option>
                <option>wavy</option>
                <option>curly</option>
                <option>coily</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Style vibe</label>
              <select value={profile.style_vibe} onChange={e=>setProfile(p=>({...p, style_vibe: e.target.value}))} className="w-full rounded-md border border-gray-300 px-3 py-2">
                <option value="">Select</option>
                <option>classic</option>
                <option>minimal</option>
                <option>streetwear</option>
                <option>preppy</option>
                <option>sporty</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium">Save</button>
              {profileStatus && <span className="text-sm text-gray-600 self-center">{profileStatus}</span>}
            </div>
          </form>

          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Focus Area</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map(c => (
                <button key={c.id} onClick={() => setActiveCat(c.id)} className={`px-3 py-1.5 rounded-full text-sm border ${activeCat===c.id ? 'bg-sky-600 text-white border-sky-600' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'}`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Right: Content */}
        <section className="lg:col-span-2 space-y-8">
          <div className="bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-black/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Suggested Routines</h2>
              <button onClick={fetchData} className="text-sm text-sky-700 hover:text-sky-900">Refresh</button>
            </div>
            {loading && <p className="text-sm text-gray-500">Loading...</p>}
            {!loading && routines.length === 0 && (
              <p className="text-sm text-gray-600">No routines yet. Create one below tailored to your focus.</p>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              {routines.map(r => (
                <div key={r._id} className="rounded-xl border border-gray-200 bg-white p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">{r.title}</h3>
                  {Array.isArray(r.steps) && r.steps.length > 0 ? (
                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                      {r.steps.map((s, i) => <li key={i}>{s}</li>)}
                    </ol>
                  ) : (
                    <p className="text-sm text-gray-500">No steps listed.</p>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={createRoutine} className="mt-6 grid gap-3">
              <h4 className="text-sm font-semibold text-gray-700">Add a routine</h4>
              <input value={newRoutine.title} onChange={e=>setNewRoutine(n=>({...n, title: e.target.value}))} className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder={`e.g., ${activeCat[0].toUpperCase()+activeCat.slice(1)} Morning Routine`} />
              <textarea value={newRoutine.stepsText} onChange={e=>setNewRoutine(n=>({...n, stepsText: e.target.value}))} className="w-full rounded-md border border-gray-300 px-3 py-2 h-28" placeholder="One step per line" />
              <div className="flex gap-2">
                <button disabled={creating} className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium disabled:opacity-60">{creating ? 'Creating...' : 'Create routine'}</button>
                <span className="text-xs text-gray-500 self-center">Saved to your profile when email is set</span>
              </div>
            </form>
          </div>

          <div className="bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-black/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Tips</h2>
              <button onClick={fetchData} className="text-sm text-sky-700 hover:text-sky-900">Refresh</button>
            </div>
            {tips.length === 0 && <p className="text-sm text-gray-600">No tips yet. Add your best advice.</p>}
            <div className="space-y-3">
              {tips.map(t => (
                <div key={t._id} className="rounded-xl border border-gray-200 bg-white p-4">
                  <h3 className="font-semibold text-gray-800">{t.title}</h3>
                  <p className="text-sm text-gray-700 mt-1">{t.body}</p>
                  {t.tags && t.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {t.tags.map((g, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">{g}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={createTip} className="mt-6 grid gap-3">
              <h4 className="text-sm font-semibold text-gray-700">Add a tip</h4>
              <input value={newTip.title} onChange={e=>setNewTip(n=>({...n, title: e.target.value}))} className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Concise title" />
              <textarea value={newTip.body} onChange={e=>setNewTip(n=>({...n, body: e.target.value}))} className="w-full rounded-md border border-gray-300 px-3 py-2 h-28" placeholder="Practical, healthy, evidence-based advice" />
              <div className="flex gap-2">
                <button disabled={creatingTip} className="px-4 py-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium disabled:opacity-60">{creatingTip ? 'Adding...' : 'Add tip'}</button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer className="py-8 text-center text-xs text-gray-500">
        Built for positive, sustainable self-care. Avoid extremes; celebrate consistency.
      </footer>
    </div>
  )
}

export default App

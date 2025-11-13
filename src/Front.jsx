import { useMemo, useState } from 'react'

export default function Front() {
  const BACKEND = useMemo(() => import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', [])

  const [started, setStarted] = useState(false)
  const [goal, setGoal] = useState('')
  const [days, setDays] = useState(3)
  const [sens, setSens] = useState('')

  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const onFile = (e) => {
    const f = e.target.files?.[0]
    setFile(f || null)
    setResult(null)
    setError('')
    if (f) {
      const url = URL.createObjectURL(f)
      setPreview(url)
    } else {
      setPreview('')
    }
  }

  const analyze = async () => {
    if (!file) return
    setAnalyzing(true)
    setResult(null)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`${BACKEND}/api/face/analyze`, { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.detail || 'Failed to analyze')
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setAnalyzing(false)
    }
  }

  const colors = (result?.guidance?.color_palette || []).join(', ')
  const neutrals = (result?.guidance?.neutrals || []).join(', ')
  const shapeTips = result?.guidance?.shape_tips || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-sky-900 text-white">
      <header className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-500 to-emerald-500" />
          <h1 className="text-xl font-bold">LooksMax</h1>
        </a>
        <nav className="flex items-center gap-3">
          <a href="/app" className="text-sm text-slate-300 hover:text-white">Open App</a>
          <a href="/test" className="text-sm text-slate-400 hover:text-white/90">System Check</a>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Healthy LooksMax
          </h2>
          <p className="mt-4 text-lg md:text-xl text-slate-300 max-w-2xl">
            Build compounding habits for skin, hair, sleep, fitness and style. Evidence-informed. No extremes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => setStarted(true)} className="bg-white text-slate-900 px-5 py-3 rounded-xl font-semibold hover:bg-slate-100">
              Get Personalized
            </button>
            <a href="/app" className="px-5 py-3 rounded-xl font-semibold border border-white/20 text-white hover:bg-white/10">
              Explore Routines
            </a>
          </div>
        </div>
      </section>

      {/* Questions + Photo */}
      <section className="max-w-6xl mx-auto px-6 pb-20 grid lg:grid-cols-2 gap-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-semibold">Quick Questions</h3>
          <p className="text-slate-300 text-sm mb-4">Answer a few to tailor your plan.</p>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Primary goal this month</label>
              <input value={goal} onChange={e=>setGoal(e.target.value)} className="w-full bg-white/10 border border-white/10 rounded-md px-3 py-2 placeholder-slate-400" placeholder="e.g., clearer skin, better sleep" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Days per week you can commit</label>
              <input type="number" min="1" max="7" value={days} onChange={e=>setDays(Number(e.target.value))} className="w-full bg-white/10 border border-white/10 rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Any sensitivities?</label>
              <input value={sens} onChange={e=>setSens(e.target.value)} className="w-full bg-white/10 border border-white/10 rounded-md px-3 py-2" placeholder="e.g., fragrance, retinoids" />
            </div>
            {started && (
              <div className="text-slate-300 text-sm">
                We’ll reflect this in suggested routines on the app page.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-semibold">Optional: Face Shape, Symmetry, and Colors</h3>
          <p className="text-slate-300 text-sm mb-4">Upload a clear, front-facing photo in decent light. Data is processed server-side and discarded.</p>
          <div className="grid gap-3">
            <input type="file" accept="image/*" onChange={onFile} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-white file:text-slate-900 hover:file:bg-slate-100" />
            {preview && (
              <div className="mt-2">
                <img src={preview} alt="preview" className="max-h-56 rounded-lg border border-white/10" />
              </div>
            )}
            <div className="flex gap-2">
              <button disabled={!file || analyzing} onClick={analyze} className="px-4 py-2 rounded-md bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-semibold">
                {analyzing ? 'Analyzing...' : 'Analyze Photo'}
              </button>
              <a href="/app" className="px-4 py-2 rounded-md border border-white/20 text-white hover:bg-white/10">Go to App</a>
            </div>
            {error && <p className="text-rose-300 text-sm">{error}</p>}
            {result && (
              <div className="mt-3 bg-black/30 border border-white/10 rounded-xl p-4">
                <h4 className="font-semibold mb-2">Your Snapshot</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-slate-200">
                  <div>Shape: <span className="font-semibold">{result.shape}</span></div>
                  <div>Rating: <span className="font-semibold">{result.rating}/10</span></div>
                  <div>Symmetry: {result.symmetry}</div>
                  <div>Proportion: {result.proportion}</div>
                  <div>Edge: {result.edge}</div>
                  <div>Aspect: {result.aspect_ratio}</div>
                </div>
                {result.guidance && (
                  <div className="mt-3 text-sm">
                    <p className="text-slate-200 font-semibold">Face-shape tips</p>
                    <ul className="list-disc list-inside text-slate-300 space-y-1">
                      {shapeTips.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                    <div className="mt-3">
                      <p className="text-slate-200 font-semibold">Best colors</p>
                      <p className="text-slate-300">{colors || '—'}</p>
                      <p className="text-slate-400 text-xs">Neutrals: {neutrals || '—'}</p>
                    </div>
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-2">For fun and education. Focus on sustainable habits over scores.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

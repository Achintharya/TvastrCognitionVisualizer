import { AppShell } from './layouts/AppShell'
import { WorldCanvas } from './canvas/WorldCanvas'

/* ============================================
   TVASTR COGNITION OBSERVATORY
   Industrial Intelligence Visualization System
   
   Philosophy:
   - Optimize for 30-minute exploration sessions
   - Every feature answers: Explore / Observe / Understand / Evolve
   - Clarity first, beauty second
   - Vajra is the cognitive anchor
   ============================================ */

export default function App() {
  return (
    <AppShell>
      <WorldCanvas />
    </AppShell>
  )
}

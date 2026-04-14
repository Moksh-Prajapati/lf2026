import { useState, useEffect, useCallback, useRef } from 'react'

/* =========================================================
   ITINERARY DATA (from official poster)
   ========================================================= */
interface ItineraryItem {
  date: string
  day: string
  performer: string
  time: string
  venue: string
  type: 'concert' | 'dj' | 'poetry' | 'comedy' | 'band' | 'singer'
  image?: string
}

const ITINERARY: ItineraryItem[] = [
  { date: '24 April', day: 'Friday', performer: 'Snehi Live', time: '8 PM Onwards', venue: 'BBC', type: 'concert', image: '/images/artists/snehi-live.png' },
  { date: '24 April', day: 'Friday', performer: 'DJ Tuhina', time: '8 PM Onwards', venue: 'BBC', type: 'dj', image: '/images/artists/dj-tuhina.png' },
  { date: '25 April', day: 'Saturday', performer: 'Kavi Samelan', time: '8 PM Onwards', venue: 'Auditorium', type: 'poetry', image: '/images/artists/kavi-samelan.png' },
  { date: '25 April', day: 'Saturday', performer: 'Naptune', time: '8 PM Onwards', venue: 'BBC', type: 'band', image: '/images/artists/neptune.png' },
  { date: '25 April', day: 'Saturday', performer: 'Anuj Sharma', time: '8 PM Onwards', venue: 'BBC', type: 'singer', image: '/images/artists/anuj-sharma.png' },
  { date: '25 April', day: 'Saturday', performer: 'DJ Kikie', time: '8 PM Onwards', venue: 'BBC', type: 'dj', image: '/images/artists/dj-kikie.png' },
  { date: '26 April', day: 'Sunday', performer: 'Rajat Chauhan', time: '8 PM Onwards', venue: 'BBC', type: 'comedy', image: '/images/artists/rajat-chauhan.png' },
  { date: '26 April', day: 'Sunday', performer: 'Harmony of Pine', time: '8 PM Onwards', venue: 'BBC', type: 'band', image: '/images/artists/harmony-of-pine.png' },
  { date: '26 April', day: 'Sunday', performer: 'Simar Kaur', time: '8 PM Onwards', venue: 'BBC', type: 'concert', image: '/images/artists/simar-kaur.png' },
  { date: '26 April', day: 'Sunday', performer: 'DJ Ana', time: '8 PM Onwards', venue: 'BBC', type: 'dj', image: '/images/artists/dj-ana.png' },
]

const TYPE_COLORS: Record<string, string> = {
  concert: '#ec4899',
  dj: '#eab308',
  poetry: '#8b5cf6',
  comedy: '#f97316',
  band: '#14b8a6',
  singer: '#f43f5e'
}

const TYPE_LABELS: Record<string, string> = {
  concert: 'Live Performance',
  dj: 'DJ Set',
  poetry: 'Poetry',
  comedy: 'Stand Up Comedy',
  band: 'Band',
  singer: 'Singer',
}

/* =========================================================
   SPONSOR LOGOS
   ========================================================= */
const SPONSORS = [
  { name: 'Nescafe', logo: '/images/sponsors/nescafe.png' },
  { name: 'Amul', logo: '/images/sponsors/amul.png' },
  { name: 'Pepsi', logo: '/images/sponsors/pepsi.png' },
  { name: 'Dominos', logo: '/images/sponsors/dominos.png' },
  { name: 'Food Dude', logo: '/images/sponsors/food-dude.png' },
  { name: 'Stargaze', logo: '/images/sponsors/stargaze.png' },
  { name: 'Black Crab', logo: '/images/sponsors/blackcrab.png' },
  { name: 'Kaku', logo: '/images/sponsors/kaku.png' },
  { name: 'PNB', logo: '/images/sponsors/pnb.png' },
]

/* =========================================================
   PAST VIDEOS
   ========================================================= */
const PAST_VIDEOS = [
  { year: '2022', url: 'https://www.youtube.com/watch?v=ZCeBhDzq1-Q' },
  { year: '2019', url: 'https://www.youtube.com/watch?v=0YSL2r481yE' },
  { year: '2018', url: 'https://www.youtube.com/watch?v=7zKsf_yNyd0' },
  { year: '2017', url: 'https://www.youtube.com/watch?v=AMqo58rct1o' },
  { year: '2016', url: 'https://www.youtube.com/watch?v=Jp9jjPZx5D4' },
]

/* =========================================================
   CLUBS & COMMITTEES (for footer)
   ========================================================= */
const CLUBS = [
  'Technical Sciences, Movies & Photography',
  'Sports', 'Literary & Debating', 'Koshish',
  'Cultural & Dance', 'Theatre & Music',
  'Environment, Ecology & Health',
]

const COMMITTEES = [
  'Procurement & Events', 'Finance', 'Creative Arts',
  'Disciplinary', 'Media & Publicity', 'Registration & Hospitality',
]

/* =========================================================
   COUNTDOWN
   ========================================================= */
function useCountdown() {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const target = new Date('2026-04-24T00:00:00+05:30').getTime()
    function update() {
      const diff = target - Date.now()
      if (diff <= 0) { setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return }
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return time
}

/* =========================================================
   SCROLL REVEAL HOOK
   ========================================================= */
function useScrollReveal(dep?: unknown) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const elements = containerRef.current?.querySelectorAll('.reveal-item')
    if (!elements) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement
            const delay = el.dataset.delay || '0'
            el.style.transitionDelay = `${delay}ms`
            el.classList.add('revealed')
            observer.unobserve(el)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [dep])

  return containerRef
}

/* =========================================================
   SMOOTH SCROLL
   ========================================================= */
function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

/* =========================================================
   MAIN EXPORT
   ========================================================= */
export default function OverlayUI() {
  const countdown = useCountdown()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDay, setActiveDay] = useState<string | null>(null)
  const [heroFade, setHeroFade] = useState(1)
  const pad = (n: number) => String(n).padStart(2, '0')
  const revealRef = useScrollReveal(activeDay)

  // Fade out hero elements as user scrolls
  useEffect(() => {
    function onScroll() {
      const progress = Math.min(window.scrollY / (window.innerHeight * 0.5), 1)
      setHeroFade(1 - progress)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNav = useCallback((id: string) => {
    scrollTo(id)
    setMobileMenuOpen(false)
  }, [])

  const days = ['24 April', '25 April', '26 April']
  const dayNames: Record<string, string> = { '24 April': 'Friday', '25 April': 'Saturday', '26 April': 'Sunday' }
  const dayLabels: Record<string, string> = { '24 April': 'DAY 1', '25 April': 'DAY 2', '26 April': 'DAY 3' }

  const filteredDays = activeDay ? [activeDay] : days

  return (
    <>
      {/* ===== HERO OVERLAY ===== */}
      <div className="hero-overlay">
        <nav className="nav-bar">
          <div className="nav-logos">
            <a href="https://jyc.co.in" target="_blank" rel="noopener noreferrer">
              <img src="/images/jyc-logo-white.png" alt="JYC" className="nav-logo-img" />
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
              <img src="/images/lf-logo-new.png" alt="LE FIESTUS" className="nav-logo-img" style={{ height: 50 }} />
            </a>
          </div>

          <div className="nav-links">
            <button className="nav-btn" onClick={() => handleNav('about')}>About</button>
            <button className="nav-btn" onClick={() => handleNav('itinerary')}>Itinerary</button>
            <button className="nav-btn nav-btn--pink" onClick={() => handleNav('memories')}>Memories</button>
            <button className="nav-btn nav-btn--purple" onClick={() => handleNav('sponsors')}>Sponsors</button>
          </div>

          <button
            className="nav-hamburger interactive"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <span /><span /><span />
          </button>
        </nav>

        <div className="hero-bottom" style={{ opacity: heroFade, pointerEvents: heroFade < 0.1 ? 'none' : 'auto' }}>
          <div style={{ flex: 1 }} />
          <div className="countdown-card interactive">
            <div className="countdown-label">TIME TO GO</div>
            <div className="countdown-digits">
              {(['days', 'hours', 'minutes', 'seconds'] as const).map((unit, i) => (
                <div key={unit} style={{ display: 'flex', alignItems: 'center' }}>
                  {i > 0 && <span className="countdown-sep">:</span>}
                  <div className="countdown-unit">
                    <span className="countdown-num">{pad(countdown[unit])}</span>
                    <span className="countdown-txt">{unit.slice(0, 3).toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button className="scroll-cta" onClick={() => handleNav('about')} style={{ opacity: heroFade, pointerEvents: heroFade < 0.1 ? 'none' : 'auto' }}>
          <span className="scroll-cta-text">SCROLL DOWN</span>
          <span className="scroll-cta-arrow">&#8964;</span>
        </button>
      </div>

      {/* ===== SOCIAL BAR ===== */}
      <div className="social-bar" style={{ opacity: heroFade, pointerEvents: heroFade < 0.1 ? 'none' : 'auto' }}>
        <a className="social-link social-link--yt" href="https://www.youtube.com/@JYCPhotographyClub" target="_blank" rel="noopener noreferrer" title="YouTube">&#9654;</a>
        <a className="social-link social-link--ig" href="https://www.instagram.com/le.fiestus" target="_blank" rel="noopener noreferrer" title="Instagram">&#10047;</a>
        <a className="social-link social-link--fb" href="https://www.facebook.com/jyc.juit/" target="_blank" rel="noopener noreferrer" title="Facebook">f</a>
        <a className="social-link social-link--tw" href="https://x.com/JycJuit/" target="_blank" rel="noopener noreferrer" title="Twitter">&#120143;</a>
      </div>

      {/* ===== SCROLLABLE CONTENT ===== */}
      <div className="site-content" ref={revealRef}>

        {/* --- ABOUT --- */}
        <div className="content-section-full" id="about">
          <div className="content-inner">
            <span className="section-tag reveal-item" data-delay="0" style={{ background: '#8b5cf6' }}>JUIT&rsquo;S ANNUAL FEST</span>
            <h2 className="reveal-item" data-delay="100">About Le Fiestus</h2>
            <p className="reveal-item" data-delay="200">
              Le Fiestus is the annual cultural extravaganza of Jaypee University of Information Technology,
              Solan, Himachal Pradesh. Since its inception, it has grown into one of the most anticipated college
              festivals in the region — featuring live concerts, cultural performances, DJ nights, comedy shows,
              poetry slams, and much more.
            </p>
            <p className="tagline reveal-item" data-delay="300">&ldquo;Be the part. Discover the beauty.&rdquo;</p>

            <div className="about-grid">
              <div className="about-info-card reveal-item" data-delay="400">
                <h3>When</h3>
                <p>24 &ndash; 26 April, 2026</p>
              </div>
              <div className="about-info-card reveal-item" data-delay="500">
                <h3>Where</h3>
                <p>BBC Auditorium &amp; Campus, JUIT, Solan, Himachal Pradesh</p>
              </div>
            </div>

            <div className="key-dates-row">
              {[
                { num: '24', day: 'Friday', name: 'Day 1' },
                { num: '25', day: 'Saturday', name: 'Day 2' },
                { num: '26', day: 'Sunday', name: 'Day 3' },
              ].map((d, i) => (
                <div className="key-date-chip reveal-item" key={d.num} data-delay={String(600 + i * 100)}>
                  <span className="key-date-num">{d.num}</span>
                  <span className="key-date-month">APR</span>
                  <span className="key-date-name">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- ITINERARY (Redesigned) --- */}
        <div className="content-section-full itinerary-section" id="itinerary">
          <div className="content-inner">
            <span className="section-tag reveal-item" style={{ background: '#ec4899' }}>24&ndash;26 APRIL 2026</span>
            <h2 className="itin-title reveal-item" data-delay="100">The Lineup</h2>
            <p className="itin-subtitle reveal-item" data-delay="150">Three nights. Ten acts. One unforgettable experience.</p>

            {/* Day filter tabs */}
            <div className="itin-tabs reveal-item" data-delay="200">
              <button
                className={`itin-tab ${activeDay === null ? 'itin-tab--active' : ''}`}
                onClick={() => setActiveDay(null)}
              >
                ALL DAYS
              </button>
              {days.map((date) => (
                <button
                  key={date}
                  className={`itin-tab ${activeDay === date ? 'itin-tab--active' : ''}`}
                  onClick={() => setActiveDay(activeDay === date ? null : date)}
                >
                  {dayLabels[date]}
                </button>
              ))}
            </div>

            {/* Timeline */}
            <div className="itin-timeline">
              {filteredDays.map((date, dayIdx) => {
                const dayItems = ITINERARY.filter((i) => i.date === date)
                return (
                  <div key={date} className="itin-day-block reveal-item" data-delay={String(300 + dayIdx * 150)}>
                    {/* Day header */}
                    <div className="itin-day-head">
                      <div className="itin-day-circle">
                        <span className="itin-day-circle-num">{date.split(' ')[0]}</span>
                        <span className="itin-day-circle-month">APR</span>
                      </div>
                      <div className="itin-day-info">
                        <span className="itin-day-label">{dayLabels[date]}</span>
                        <span className="itin-day-weekday">{dayNames[date]}</span>
                      </div>
                    </div>

                    {/* Performance cards */}
                    <div className="itin-performances">
                      {dayItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="itin-perf-card"
                          data-delay={String(400 + dayIdx * 150 + idx * 80)}
                          style={{
                            '--accent': TYPE_COLORS[item.type],
                          } as React.CSSProperties}
                        >
                          {/* Artist image */}
                          {item.image && (
                            <div className="itin-perf-image">
                              <img
  src={item.image}
  alt={item.performer}
  loading="lazy"
  className={
  item.performer === 'Naptune'
    ? 'fit-center'
    : item.performer === 'Kavi Samelan' ||
    item.performer === 'Harmony of Pine'
    ? 'fit-bottom'
    : 'fit-bottom'
}
/>
                            </div>
                          )}

                          <div className="itin-perf-content">
                            <div className="itin-perf-badge" style={{ background: TYPE_COLORS[item.type] }}>
                              {TYPE_LABELS[item.type]}
                            </div>
                            <h3 className="itin-perf-name">{item.performer}</h3>
                            <div className="itin-perf-meta">
                              <span className="itin-perf-time">{item.time}</span>
                              <span className="itin-perf-venue">{item.venue}</span>
                            </div>
                          </div>

                          {/* Decorative accent stripe */}
                          <div className="itin-perf-stripe" style={{ background: TYPE_COLORS[item.type] }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* --- MEMORIES --- */}
        <div className="content-section-full" id="memories">
          <div className="content-inner">
            <span className="section-tag reveal-item" style={{ background: '#ec4899' }}>PAST VIDEOS</span>
            <h2 className="reveal-item" data-delay="100">Memories in Motion</h2>
            <p className="reveal-item" data-delay="150">Relive the energy of past Le Fiestus editions through these aftermovies.</p>
            <div className="memories-grid">
              {PAST_VIDEOS.map((v, i) => (
                <a key={v.year} href={v.url} target="_blank" rel="noopener noreferrer" className="memory-card reveal-item" data-delay={String(200 + i * 100)}>
                  <img
                    src={`https://img.youtube.com/vi/${v.url.split('v=')[1]}/mqdefault.jpg`}
                    alt={`Le Fiestus ${v.year}`}
                    loading="lazy"
                  />
                  <span className="memory-year">LE FIESTUS {v.year}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* --- SPONSORS CAROUSEL --- */}
        <div className="content-section-full" id="sponsors">
          <div className="content-inner">
            <span className="section-tag reveal-item" style={{ background: '#eab308' }}>PAST SPONSORS</span>
            <h2 className="reveal-item" data-delay="100">Our Partners</h2>
            <p className="reveal-item" data-delay="150">Brands that have been a part of the Le Fiestus experience.</p>
          </div>
          <div className="carousel-wrap">
            <div className="carousel-track">
              {[...SPONSORS, ...SPONSORS].map((s, i) => (
                <div key={i} className="carousel-item">
                  <img src={s.logo} alt={s.name} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== FOOTER (with clubs & committees) ===== */}
      <footer className="site-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <img src="/images/lf-logo-new.png" alt="LE FIESTUS" className="footer-logo" />
            <p className="footer-title">LE FIESTUS 2026</p>
            <p className="footer-sub">Jaypee University of Information Technology<br />Solan, Himachal Pradesh</p>
            <p className="footer-sub">24 &ndash; 26 April 2026</p>
            <div className="footer-links">
              <a href="https://www.youtube.com/@JYCPhotographyClub" target="_blank" rel="noopener noreferrer">YouTube</a>
              <a href="https://www.instagram.com/le.fiestus" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://www.facebook.com/jyc.juit/" target="_blank" rel="noopener noreferrer">Facebook</a>
              <a href="https://x.com/JycJuit/" target="_blank" rel="noopener noreferrer">Twitter</a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Clubs</h4>
            <ul>{CLUBS.map((c) => <li key={c}>{c}</li>)}</ul>
          </div>

          <div className="footer-col">
            <h4>Committees</h4>
            <ul>{COMMITTEES.map((c) => <li key={c}>{c}</li>)}</ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 LE FIESTUS &bull; Organized by JYC &bull; All rights reserved.</p>
        </div>
      </footer>

      {/* ===== MOBILE MENU ===== */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <button className="mobile-menu-close" onClick={() => setMobileMenuOpen(false)}>&times;</button>
          {[
            ['about', 'About'],
            ['itinerary', 'Itinerary'],
            ['memories', 'Memories'],
            ['sponsors', 'Sponsors'],
          ].map(([key, label]) => (
            <button key={key} className="mobile-menu-link" onClick={() => handleNav(key)}>{label}</button>
          ))}
        </div>
      )}
    </>
  )
}

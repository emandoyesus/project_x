import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'

type Category = 'Marketplace' | 'Delivery' | 'Sports' | 'Outfits'
type Filter = 'All' | Category
type Post = { id: number; type: Category; emoji: string; art: string; time: string; title: string; desc: string; price: string; name: string; initials: string; rating: string }

const initialPosts: Post[] = [
  { id: 1, type: 'Marketplace', emoji: '📚', art: 'books', time: '12 min ago', title: 'First-year engineering book set', desc: 'Physics, calculus & mechanics. All in great shape.', price: '650 birr', name: 'Mimi T.', initials: 'MT', rating: '4.9' },
  { id: 2, type: 'Marketplace', emoji: '👟', art: 'shoe', time: '28 min ago', title: 'Campus classic sneakers', desc: 'Worn a few times, still lots of life left. Size 39.', price: '1,200 birr', name: 'Dawit K.', initials: 'DK', rating: '5.0' },
  { id: 3, type: 'Sports', emoji: '⚽', art: 'ball', time: '35 min ago', title: 'Need 2 players for a friendly', desc: 'Today at 4:30 · Main field. Any position welcome!', price: 'Today · 4:30 PM', name: 'Samson A.', initials: 'SA', rating: '4.8' },
  { id: 4, type: 'Delivery', emoji: '☕', art: 'tea', time: '41 min ago', title: 'Tea run to the library', desc: 'Heading to the cafe now. Add your order and split the walk.', price: 'From 15 birr', name: 'Liya B.', initials: 'LB', rating: '5.0' },
  { id: 5, type: 'Outfits', emoji: '🧥', art: 'outfit', time: '1 hr ago', title: 'Outfit week: campus colors', desc: 'Vote for your favorite look before Friday evening.', price: 'Vote this week', name: 'Campus Style', initials: 'CS', rating: '✦' },
  { id: 6, type: 'Marketplace', emoji: '🧮', art: 'calculator', time: '2 hrs ago', title: 'Casio scientific calculator', desc: 'Works perfectly. Happy to swap for a lab coat.', price: '900 birr', name: 'Hana G.', initials: 'HG', rating: '4.9' },
]

const categories: { name: Category; icon: string; sub: string; style: string }[] = [
  { name: 'Marketplace', icon: '↗', sub: 'Buy, swap, share', style: 'market' },
  { name: 'Delivery', icon: '⌁', sub: 'Run an errand', style: 'delivery' },
  { name: 'Sports', icon: '◎', sub: 'Find a match', style: 'sports' },
  { name: 'Outfits', icon: '✳', sub: 'Vote & get inspired', style: 'outfits' },
]

const services: { id: Filter; label: string; icon: string; title: string; description: string; action: string }[] = [
  { id: 'All', label: 'Home', icon: '⌂', title: 'A little help. A better campus.', description: 'Find your next great deal, your next teammate, or someone going your way.', action: 'Create a post' },
  { id: 'Delivery', label: 'Delivery', icon: '↗', title: 'Less running around. More living.', description: 'Coffee runs, lunch pickups, and everyday errands. Find a helping hand nearby.', action: 'Post an errand' },
  { id: 'Marketplace', label: 'Exchange', icon: '⇄', title: 'Good finds. New beginnings.', description: 'Buy, sell, or swap the things that make student life a little easier.', action: 'List an item' },
  { id: 'Sports', label: 'Games', icon: '◎', title: 'Your next team starts here.', description: 'Find a pickup match, bring your friends, and make time to play.', action: 'Organize a game' },
  { id: 'Outfits', label: 'Style', icon: '✳', title: 'Make campus your runway.', description: 'Share your everyday looks and discover a little inspiration between lectures.', action: 'Share a look' },
]
const labelFor = (category: Category) => services.find(service => service.id === category)!.label

function readStored<T>(key: string, fallback: T): T {
  try { const value = JSON.parse(localStorage.getItem(key) || 'null'); return Array.isArray(value) ? value as T : fallback } catch { return fallback }
}

export default function App() {
  const [posts, setPosts] = useState<Post[]>(() => readStored('campuslink.posts', initialPosts).filter(p => p && typeof p.title === 'string' && typeof p.desc === 'string' && categories.some(c => c.name === p.type)))
  const [filter, setFilter] = useState<Filter>(() => services.find(s => `#${s.label.toLowerCase()}` === window.location.hash)?.id || 'All')
  const [saved, setSaved] = useState<number[]>(() => readStored('campuslink.saved', []))
  const [dialogOpen, setDialogOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [query, setQuery] = useState('')
  const [savedOnly, setSavedOnly] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const search = useRef<HTMLInputElement>(null)
  const toastTimer = useRef<number>()
  useEffect(() => {
    try { localStorage.setItem('campuslink.posts', JSON.stringify(posts)); localStorage.setItem('campuslink.saved', JSON.stringify(saved)) }
    catch { setToast('Browser storage unavailable. Changes last for this session only.') }
  }, [posts, saved])
  useEffect(() => {
    if (!dialogOpen) return
    dialog.current?.showModal()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [dialogOpen])
  useEffect(() => () => window.clearTimeout(toastTimer.current), [])
  const visiblePosts = useMemo(() => posts.filter(post => (filter === 'All' || post.type === filter) && (!savedOnly || saved.includes(post.id)) && `${post.title} ${post.desc}`.toLowerCase().includes(query.trim().toLowerCase())), [posts, filter, savedOnly, saved, query])

  function notify(message: string) { window.clearTimeout(toastTimer.current); setToast(message); toastTimer.current = window.setTimeout(() => setToast(''), 1900) }
  function selectFilter(value: Filter) { setFilter(value); setQuery(''); setSavedOnly(false); window.scrollTo({ top: 0 }); window.history.replaceState(null, '', `#${services.find(s => s.id === value)!.label.toLowerCase()}`) }
  function toggleSave(id: number) {
    const isSaved = saved.includes(id)
    setSaved(current => isSaved ? current.filter(item => item !== id) : [...current, id])
    notify(isSaved ? 'Removed from saved' : 'Saved to your list')
  }
  function submitPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const title = String(data.get('title') || '').trim()
    if (!title) return
    const type = data.get('type') as Category
    const artwork = { Marketplace: ['📦', 'books'], Delivery: ['☕', 'tea'], Sports: ['⚽', 'ball'], Outfits: ['🧥', 'outfit'] }[type]
    setPosts(current => [{ id: Date.now(), type, emoji: artwork[0], art: artwork[1], time: 'Just now', title, desc: String(data.get('details') || 'A new post from your campus community.'), price: String(data.get('price') || 'Get in touch'), name: 'You', initials: 'YO', rating: 'New' }, ...current])
    selectFilter(type); setDialogOpen(false); event.currentTarget.reset(); notify('Post saved on this device.')
  }

  const service = services.find(item => item.id === filter)!
  return <div className="app-shell">
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="topbar"><a className="brand" href="#home" onClick={() => selectFilter('All')}><span className="brand-mark">c<span>↗</span></span>campuslink<span className="brand-period">.</span></a><span className="campus-picker"><span className="online-dot"/> AAU · Main campus</span><span className="avatar" aria-label="Guest account">G</span></header>
    <nav className="service-nav" aria-label="Campus services">{services.map(item => <button key={item.id} aria-current={filter === item.id ? 'page' : undefined} className={filter === item.id ? 'selected' : ''} onClick={() => selectFilter(item.id)}><span aria-hidden="true">{item.icon}</span>{item.label}</button>)}</nav>
    <main id="main">
      <section className={`hero hero-${service.label.toLowerCase()}`}><div className="hero-copy"><p className="eyebrow"><span/> STUDENT LIFE, SIMPLIFIED</p><h1>{service.title}</h1><p>{service.description}</p><button className="primary-button" onClick={() => setDialogOpen(true)}>{service.action}<span aria-hidden="true">＋</span></button><small>Made for the people who make your campus.</small></div><div className="hero-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><span className="art-spark">✳</span><div className="floating-card card-one"><span>⇄</span><div>A new home for<br/><strong>your old favorites.</strong></div></div><div className="floating-card card-two"><span>↗</span><div>A helping hand,<br/><strong>just around the corner.</strong></div></div><div className="art-stamp">BETTER<br/><b>TOGETHER</b><span>✦</span></div></div></section>
      {filter === 'All' ? <section className="services-section" aria-labelledby="services-title"><div className="section-heading"><h2 id="services-title">What’s on your agenda?</h2><span>One campus. More possibilities.</span></div><div className="service-grid">{services.slice(1).map((item, index) => <button className={`service-card service-${item.label.toLowerCase()}`} key={item.id} onClick={() => selectFilter(item.id)}><div><span className="service-icon">{item.icon}</span><span className="service-number">0{index + 1}</span></div><h3>{item.label}<span>↗</span></h3><p>{categories.find(c => c.name === item.id)?.sub}</p></button>)}</div></section> : <section className="service-guide" aria-label={`${service.label} guide`}><span className="guide-icon">{service.icon}</span><div><strong>{filter === 'Delivery' ? 'Small errands, shared effort' : filter === 'Marketplace' ? 'Pass it on, keep it on campus' : filter === 'Sports' ? 'There’s always room for another player' : 'A little everyday inspiration'}</strong><p>{filter === 'Delivery' ? 'Include your pickup point, destination, and preferred time when posting.' : filter === 'Marketplace' ? 'Include condition, price, and whether you’re open to a swap.' : filter === 'Sports' ? 'Share the location, start time, and how many players you need.' : 'Tell the community about your look and what inspired it.'}</p></div></section>}
      <section className="board" aria-labelledby="board-title"><div className="section-heading board-heading"><div><p className="eyebrow">THE CAMPUS BOARD</p><h2 id="board-title">{filter === 'All' ? 'Fresh from your community' : `${service.label} on campus`}</h2></div><span className="listing-count">{visiblePosts.length} listings</span></div>
      <div className="board-tools"><label className="search-box"><span aria-hidden="true">⌕</span><span className="sr-only">Search {service.label.toLowerCase()} listings</span><input ref={search} type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={filter === 'All' ? 'Search your campus…' : `Search ${service.label.toLowerCase()}…`} maxLength={100}/></label><button className={`saved-filter ${savedOnly ? 'active' : ''}`} aria-pressed={savedOnly} onClick={() => setSavedOnly(!savedOnly)}>♡ <span>Saved</span> {saved.length}</button></div>
      <div className="feed">{visiblePosts.map(post => <article className="post-card" key={post.id}><div className={`post-image ${post.art}`}><span className="post-emoji" aria-hidden="true">{post.emoji}</span><span className="tag">{labelFor(post.type)}</span><button className={`save ${saved.includes(post.id) ? 'saved' : ''}`} aria-label={`${saved.includes(post.id) ? 'Unsave' : 'Save'} ${post.title}`} aria-pressed={saved.includes(post.id)} onClick={() => toggleSave(post.id)}>{saved.includes(post.id) ? '♥' : '♡'}</button></div><div className="post-content"><div className="post-meta"><span>{post.time}</span><span>Demo listing</span></div><h3>{post.title}</h3><p>{post.desc}</p><strong className="price">{post.price}</strong><div className="post-bottom"><span className="user"><i>{post.initials}</i>{post.name}</span><span className="campus-location">AAU campus</span></div></div></article>)}</div>
      {!visiblePosts.length && <div className="empty-state"><span>⌕</span><h3>No listings here yet</h3><p>Try another search, or start something for your campus.</p><button className="secondary-button" onClick={() => { setQuery(''); setSavedOnly(false) }}>Clear filters</button></div>}
      <p className="feed-end" role="status">{visiblePosts.length ? 'You’re all caught up. Good things are always around the corner.' : 'No matching listings.'}</p></section>
      <footer><a className="footer-brand" href="#home" onClick={() => selectFilter('All')}>campuslink.</a><p>A campus is better when we’re connected.</p><small>Demo experience · Posts and saves stay on this device.</small></footer>
    </main>
    {dialogOpen && <dialog ref={dialog} className="post-dialog" aria-labelledby="dialog-title" onCancel={() => setDialogOpen(false)} onClose={() => setDialogOpen(false)}><form onSubmit={submitPost}><button type="button" className="close" aria-label="Close" onClick={() => setDialogOpen(false)}>×</button><p className="eyebrow">CAMPUS BOARD</p><h2 id="dialog-title">Create a post</h2><p className="demo-note">Saved locally on this device.</p><label>What are you posting?<select name="type" defaultValue={filter === 'All' ? 'Marketplace' : filter}>{categories.map(category => <option key={category.name} value={category.name}>{labelFor(category.name)}</option>)}</select></label><label>Give it a title<input name="title" autoFocus required pattern=".*\S.*" maxLength={70} placeholder="e.g. Looking for a calculus textbook"/></label><label>Add a few details<textarea name="details" maxLength={1000} rows={3} placeholder="Share the useful details..."/></label><label>Price or note<input name="price" maxLength={60} placeholder="e.g. 450 birr · open to swaps"/></label><button className="submit-post">Save post <span>→</span></button></form></dialog>}
    <div role="status" aria-live="polite" className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
  </div>
}

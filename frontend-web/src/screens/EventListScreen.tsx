import { type FC, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import AppHeader from '../components/AppHeader';
import EventCard, { type EventSummary } from '../components/EventCard';
import { GET_EVENTS } from '../graphql/queries';
import { PREVIEW_EVENTS, PREVIEW_MODE } from '../preview';
import '../styles/EventList.css';

const categories = ['All', 'Tech', 'Music', 'Sports', 'Arts'];

const EventListScreen: FC = () => {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, loading, error, refetch } = useQuery<{ events: EventSummary[] }>(GET_EVENTS, {
    variables: { category: category === 'All' ? undefined : category, search: debouncedSearch || undefined, date: date || undefined },
  });
  const events = useMemo(() => {
    if (!PREVIEW_MODE) return data?.events || [];
    const normalizedSearch = debouncedSearch.trim().toLowerCase();
    return PREVIEW_EVENTS.filter((event) => {
      const matchesCategory = category === 'All' || event.category === category;
      const matchesSearch = !normalizedSearch || `${event.name} ${event.location} ${event.category || ''}`.toLowerCase().includes(normalizedSearch);
      const matchesDate = !date || event.startTime.startsWith(date);
      return matchesCategory && matchesSearch && matchesDate;
    });
  }, [category, data?.events, date, debouncedSearch]);
  const featured = events.slice(0, 2);
  const categoriesInData = useMemo(() => new Set(events.map((event) => event.category).filter(Boolean)), [events]);
  const visibleCategories = categories.filter((item) => item === 'All' || categoriesInData.has(item));

  return (
    <div className="app-shell">
      <AppHeader />
      <main className="page-content discovery-page">
        <section className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow">MAKE ROOM FOR FUN</p>
            <h1>Find your next<br /><em>favourite</em> experience<span className="heading-dot">.</span></h1>
            <p className="hero-subtitle">A little inspiration for your calendar, from people and communities you love.</p>
          </div>
          <div className="hero-art" aria-hidden="true"><span>✦</span><strong>Good times<br />are ahead</strong><small>discover · join · enjoy</small></div>
        </section>

        <section className="discovery-controls" aria-label="Find events">
          <label className="search-field"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search events, places or vibes" /></label>
          <label className="date-field"><span>◷</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} aria-label="Filter by date" /></label>
          <button className="filter-button" onClick={() => refetch()}>Search</button>
        </section>
        <div className="category-row" aria-label="Event categories">
          {visibleCategories.map((item) => <button key={item} className={category === item ? 'category-chip selected' : 'category-chip'} onClick={() => setCategory(item)}>{item}</button>)}
        </div>

        {loading && !PREVIEW_MODE && <div className="state-card">Finding wonderful events...</div>}
        {error && !PREVIEW_MODE && <div className="state-card state-error">We couldn't load events. Please try again.</div>}
        {!loading && !error && !events.length && <div className="state-card"><span className="state-icon">✦</span><h2>No events found</h2><p>Try a different search or category.</p></div>}
        {(!loading || PREVIEW_MODE) && events.length > 0 && (
          <>
            <section className="section-block">
              <div className="section-heading"><div><p className="eyebrow">HANDPICKED FOR YOU</p><h2>Featured events</h2></div><span className="section-count">{featured.length} picks</span></div>
              <div className="featured-grid">{featured.map((event) => <EventCard key={event.id} event={event} featured />)}</div>
            </section>
            <section className="section-block">
              <div className="section-heading"><div><p className="eyebrow">WHAT'S HAPPENING</p><h2>Upcoming events</h2></div><span className="section-count">{events.length} events</span></div>
              <div className="events-grid">{events.map((event) => <EventCard key={event.id} event={event} />)}</div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default EventListScreen;

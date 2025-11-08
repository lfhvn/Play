import React, { useState, useEffect } from 'react';
import { rapidsAPI } from '../services/api';
import RapidsMap from '../components/RapidsMap';
import '../styles/Home.css';

const Home = () => {
  const [rapids, setRapids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    difficulty: '',
    river: '',
  });

  useEffect(() => {
    loadRapids();
  }, [filters]);

  const loadRapids = async () => {
    try {
      setLoading(true);
      const response = await rapidsAPI.getAll(filters);
      setRapids(response.data.rapids);
      setError(null);
    } catch (err) {
      console.error('Error loading rapids:', err);
      setError('Failed to load rapids. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadRapids();
      return;
    }

    try {
      setLoading(true);
      const response = await rapidsAPI.search(searchQuery);
      setRapids(response.data.results);
      setError(null);
    } catch (err) {
      console.error('Error searching rapids:', err);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>🌊 Whitewater Rapids</h1>
          <p>Community-driven rapid information and beta</p>
        </div>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search rapids or rivers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>

        <div className="filters">
          <h3>Filters</h3>

          <div className="filter-group">
            <label>Difficulty</label>
            <select
              value={filters.difficulty}
              onChange={(e) =>
                setFilters({ ...filters, difficulty: e.target.value })
              }
              className="filter-select"
            >
              <option value="">All Difficulties</option>
              <option value="I">Class I</option>
              <option value="II">Class II</option>
              <option value="III">Class III</option>
              <option value="IV">Class IV</option>
              <option value="IV+">Class IV+</option>
              <option value="V">Class V</option>
              <option value="V+">Class V+</option>
              <option value="VI">Class VI</option>
            </select>
          </div>

          {filters.difficulty && (
            <button
              onClick={() => setFilters({ difficulty: '', river: '' })}
              className="clear-filters"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="rapids-list">
          <h3>
            Rapids Found: <span className="count">{rapids.length}</span>
          </h3>

          {loading && <p className="loading">Loading rapids...</p>}
          {error && <p className="error">{error}</p>}

          <div className="rapids-items">
            {rapids.map((rapid) => (
              <div key={rapid.id} className="rapid-item">
                <div className="rapid-info">
                  <h4>{rapid.name}</h4>
                  <p className="river">{rapid.river}</p>
                  <span className={`difficulty difficulty-${rapid.difficulty}`}>
                    Class {rapid.difficulty}
                  </span>
                </div>
                <button
                  onClick={() => (window.location.href = `/rapid/${rapid.id}`)}
                  className="view-button"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="map-container">
        {!loading && rapids.length > 0 ? (
          <RapidsMap rapids={rapids} />
        ) : (
          <div className="map-placeholder">
            {loading ? 'Loading map...' : 'No rapids to display'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

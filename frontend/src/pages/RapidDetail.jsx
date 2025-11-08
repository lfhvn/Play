import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { rapidsAPI, discussionsAPI, photosAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/RapidDetail.css';

const RapidDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [rapid, setRapid] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // New discussion form
  const [showDiscussionForm, setShowDiscussionForm] = useState(false);
  const [discussionForm, setDiscussionForm] = useState({
    title: '',
    content: '',
    is_trip_report: false,
    run_date: '',
    flow_level: '',
  });

  useEffect(() => {
    loadRapidData();
  }, [id]);

  const loadRapidData = async () => {
    try {
      setLoading(true);
      const [rapidRes, discussionsRes, photosRes] = await Promise.all([
        rapidsAPI.getById(id),
        discussionsAPI.getByRapidId(id),
        photosAPI.getByRapidId(id),
      ]);

      setRapid(rapidRes.data);
      setDiscussions(discussionsRes.data.discussions);
      setPhotos(photosRes.data.photos);
      setError(null);
    } catch (err) {
      console.error('Error loading rapid data:', err);
      setError('Failed to load rapid information');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDiscussion = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please login to post discussions');
      return;
    }

    try {
      await discussionsAPI.create({
        rapid_id: id,
        ...discussionForm,
      });

      // Reset form and reload discussions
      setDiscussionForm({
        title: '',
        content: '',
        is_trip_report: false,
        run_date: '',
        flow_level: '',
      });
      setShowDiscussionForm(false);
      loadRapidData();
    } catch (err) {
      console.error('Error creating discussion:', err);
      alert('Failed to create discussion');
    }
  };

  if (loading) {
    return <div className="loading-container">Loading rapid information...</div>;
  }

  if (error || !rapid) {
    return <div className="error-container">{error || 'Rapid not found'}</div>;
  }

  return (
    <div className="rapid-detail">
      <div className="rapid-header">
        <div className="header-content">
          <h1>{rapid.name}</h1>
          <p className="river-name">{rapid.river}</p>
          <div className="rapid-meta">
            <span className={`difficulty-badge difficulty-${rapid.difficulty}`}>
              Class {rapid.difficulty}
            </span>
            {rapid.permit_required && (
              <span className="permit-badge">Permit Required</span>
            )}
            {rapid.average_rating && (
              <span className="rating">
                ⭐ {rapid.average_rating.toFixed(1)} ({rapid.rating_count} ratings)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="rapid-content">
        <div className="tabs">
          <button
            className={activeTab === 'overview' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={activeTab === 'discussions' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('discussions')}
          >
            Discussions ({discussions.length})
          </button>
          <button
            className={activeTab === 'photos' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('photos')}
          >
            Photos ({photos.length})
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <section className="info-section">
                <h2>Description</h2>
                <p>{rapid.description}</p>
              </section>

              <div className="info-grid">
                <section className="info-section">
                  <h3>Characteristics</h3>
                  <ul className="info-list">
                    <li>
                      <strong>Length:</strong> {rapid.length_miles} miles
                    </li>
                    <li>
                      <strong>Gradient:</strong> {rapid.gradient_fppm} ft/mile
                    </li>
                    <li>
                      <strong>Season:</strong> {rapid.season}
                    </li>
                  </ul>
                </section>

                <section className="info-section">
                  <h3>Flow Information</h3>
                  <ul className="info-list">
                    <li>
                      <strong>Optimal Range:</strong> {rapid.optimal_flow_min}-
                      {rapid.optimal_flow_max} CFS
                    </li>
                    {rapid.current_flow && (
                      <>
                        <li>
                          <strong>Current Flow:</strong> {rapid.current_flow.flow_cfs}{' '}
                          CFS
                        </li>
                        <li>
                          <strong>Last Updated:</strong>{' '}
                          {new Date(rapid.current_flow.recorded_at).toLocaleString()}
                        </li>
                      </>
                    )}
                  </ul>
                </section>
              </div>

              {rapid.hazards && rapid.hazards.length > 0 && (
                <section className="info-section hazards">
                  <h3>⚠️ Hazards</h3>
                  <ul>
                    {rapid.hazards.map((hazard, index) => (
                      <li key={index}>{hazard}</li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="info-section">
                <h3>Access Notes</h3>
                <p>{rapid.access_notes}</p>
              </section>
            </div>
          )}

          {activeTab === 'discussions' && (
            <div className="discussions-tab">
              <div className="discussions-header">
                <h2>Community Discussions</h2>
                {isAuthenticated && (
                  <button
                    className="new-discussion-btn"
                    onClick={() => setShowDiscussionForm(!showDiscussionForm)}
                  >
                    {showDiscussionForm ? 'Cancel' : '+ New Discussion'}
                  </button>
                )}
              </div>

              {showDiscussionForm && (
                <form
                  className="discussion-form"
                  onSubmit={handleSubmitDiscussion}
                >
                  <input
                    type="text"
                    placeholder="Discussion Title"
                    value={discussionForm.title}
                    onChange={(e) =>
                      setDiscussionForm({ ...discussionForm, title: e.target.value })
                    }
                    required
                  />
                  <textarea
                    placeholder="Share your beta, trip report, or ask questions..."
                    value={discussionForm.content}
                    onChange={(e) =>
                      setDiscussionForm({ ...discussionForm, content: e.target.value })
                    }
                    required
                    rows={6}
                  />
                  <div className="form-row">
                    <label>
                      <input
                        type="checkbox"
                        checked={discussionForm.is_trip_report}
                        onChange={(e) =>
                          setDiscussionForm({
                            ...discussionForm,
                            is_trip_report: e.target.checked,
                          })
                        }
                      />
                      Trip Report
                    </label>
                    {discussionForm.is_trip_report && (
                      <>
                        <input
                          type="date"
                          value={discussionForm.run_date}
                          onChange={(e) =>
                            setDiscussionForm({
                              ...discussionForm,
                              run_date: e.target.value,
                            })
                          }
                        />
                        <input
                          type="number"
                          placeholder="Flow (CFS)"
                          value={discussionForm.flow_level}
                          onChange={(e) =>
                            setDiscussionForm({
                              ...discussionForm,
                              flow_level: e.target.value,
                            })
                          }
                        />
                      </>
                    )}
                  </div>
                  <button type="submit" className="submit-btn">
                    Post Discussion
                  </button>
                </form>
              )}

              <div className="discussions-list">
                {discussions.length === 0 ? (
                  <p className="no-content">
                    No discussions yet. Be the first to share your experience!
                  </p>
                ) : (
                  discussions.map((discussion) => (
                    <div key={discussion.id} className="discussion-card">
                      <div className="discussion-header">
                        <h3>{discussion.title}</h3>
                        {discussion.is_trip_report && (
                          <span className="trip-report-badge">Trip Report</span>
                        )}
                      </div>
                      <p className="discussion-content">{discussion.content}</p>
                      <div className="discussion-meta">
                        <span>By {discussion.username || 'Anonymous'}</span>
                        <span>
                          {new Date(discussion.created_at).toLocaleDateString()}
                        </span>
                        <span>{discussion.reply_count} replies</span>
                      </div>
                      {discussion.flow_level && (
                        <p className="flow-info">Flow: {discussion.flow_level} CFS</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="photos-tab">
              <div className="photos-header">
                <h2>Photos</h2>
                {isAuthenticated && (
                  <button className="upload-btn">+ Upload Photo</button>
                )}
              </div>

              <div className="photos-grid">
                {photos.length === 0 ? (
                  <p className="no-content">
                    No photos yet. Upload the first photo of this rapid!
                  </p>
                ) : (
                  photos.map((photo) => (
                    <div key={photo.id} className="photo-card">
                      <img
                        src={`http://localhost:5000/uploads/${photo.filename}`}
                        alt={photo.caption}
                      />
                      <div className="photo-info">
                        <p>{photo.caption}</p>
                        <small>By {photo.username}</small>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RapidDetail;

import React, { useState, useRef, useEffect } from 'react';
import "../../css/Home.css";
import { useDispatch } from "react-redux";
import { propertyAction } from "../../store/Property/property-slice";
import { getAllProperties } from '../../store/Property/property-action';
import { Search as SearchIcon, MapPin, Calendar, Users, Sparkles, X } from 'lucide-react';

const popularLocations = [
  { city: 'Goa', state: 'Beach Capital of India' },
  { city: 'Mumbai', state: 'Financial Capital & Coastal Stays' },
  { city: 'Jaipur', state: 'Pink City Royal Heritage' },
  { city: 'Ooty', state: 'Queen of Hill Stations' },
  { city: 'Chikmagalur', state: 'Coffee & Nature Estates' },
  { city: 'Ladakh', state: 'High Altitude Mountain Retreats' },
  { city: 'Manali', state: 'Snow & Adventure Valleys' },
  { city: 'Munnar', state: 'Tea Plantation Hills' },
];

const Search = () => {
  const [keyword, setKeyword] = useState({ city: "", guests: "", dateIn: "", dateOut: "" });
  const [activeSegment, setActiveSegment] = useState(null); // 'where', 'checkin', 'checkout', 'guests'
  const searchContainerRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setActiveSegment(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function searchHandler(e) {
    if (e) e.preventDefault();
    setActiveSegment(null);
    dispatch(propertyAction.updateSearchParams(keyword));
    dispatch(getAllProperties());
  }

  const updateKeyword = (field, val) => {
    setKeyword((prev) => ({
      ...prev,
      [field]: val
    }));
  };

  const handleSelectLocation = (loc) => {
    setKeyword((prev) => ({ ...prev, city: loc }));
    setActiveSegment('checkin');
  };

  const filteredLocations = popularLocations.filter((loc) =>
    loc.city.toLowerCase().includes((keyword.city || '').toLowerCase())
  );

  const clearField = (field, e) => {
    e.stopPropagation();
    setKeyword((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <div ref={searchContainerRef} style={{ position: 'relative', width: '100%', maxWidth: '640px' }}>
      <form onSubmit={searchHandler} className="wow-searchbar">
        {/* SEGMENT 1: WHERE */}
        <div
          className={`search-segment ${activeSegment === 'where' ? 'active' : ''}`}
          onClick={() => setActiveSegment('where')}
        >
          <MapPin size={16} className="segment-icon" />
          <div className="segment-content">
            <span className="segment-label">Where</span>
            <input
              type="text"
              className="segment-input"
              placeholder="Search destination"
              value={keyword.city || ''}
              onChange={(e) => updateKeyword("city", e.target.value)}
              autoComplete="off"
            />
          </div>
          {keyword.city && (
            <button type="button" className="clear-btn" onClick={(e) => clearField('city', e)}>
              <X size={12} />
            </button>
          )}
        </div>

        <div className="segment-divider" />

        {/* SEGMENT 2: CHECK-IN */}
        <div
          className={`search-segment ${activeSegment === 'checkin' ? 'active' : ''}`}
          onClick={() => setActiveSegment('checkin')}
        >
          <Calendar size={16} className="segment-icon" />
          <div className="segment-content">
            <span className="segment-label">Check in</span>
            <input
              type="text"
              className="segment-input"
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = "text";
              }}
              placeholder="Add dates"
              value={keyword.dateIn || ''}
              onChange={(e) => updateKeyword("dateIn", e.target.value)}
            />
          </div>
          {keyword.dateIn && (
            <button type="button" className="clear-btn" onClick={(e) => clearField('dateIn', e)}>
              <X size={12} />
            </button>
          )}
        </div>

        <div className="segment-divider" />

        {/* SEGMENT 3: CHECK-OUT */}
        <div
          className={`search-segment ${activeSegment === 'checkout' ? 'active' : ''}`}
          onClick={() => setActiveSegment('checkout')}
        >
          <Calendar size={16} className="segment-icon" />
          <div className="segment-content">
            <span className="segment-label">Check out</span>
            <input
              type="text"
              className="segment-input"
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = "text";
              }}
              placeholder="Add dates"
              value={keyword.dateOut || ''}
              onChange={(e) => updateKeyword("dateOut", e.target.value)}
            />
          </div>
          {keyword.dateOut && (
            <button type="button" className="clear-btn" onClick={(e) => clearField('dateOut', e)}>
              <X size={12} />
            </button>
          )}
        </div>

        <div className="segment-divider" />

        {/* SEGMENT 4: GUESTS */}
        <div
          className={`search-segment ${activeSegment === 'guests' ? 'active' : ''}`}
          onClick={() => setActiveSegment('guests')}
        >
          <Users size={16} className="segment-icon" />
          <div className="segment-content">
            <span className="segment-label">Who</span>
            <input
              type="number"
              min="1"
              className="segment-input"
              placeholder="Add guests"
              value={keyword.guests || ''}
              onChange={(e) => updateKeyword("guests", e.target.value)}
            />
          </div>
          {keyword.guests && (
            <button type="button" className="clear-btn" onClick={(e) => clearField('guests', e)}>
              <X size={12} />
            </button>
          )}
        </div>

        {/* SEARCH TRIGGER BUTTON */}
        <button type="submit" className="wow-search-btn" title="Search Stays">
          <SearchIcon size={16} color="#ffffff" />
        </button>
      </form>

      {/* WHERE SUGGESTIONS POPUP PANEL */}
      {activeSegment === 'where' && filteredLocations.length > 0 && (
        <div className="wow-suggestions-panel">
          <div className="panel-header">
            <Sparkles size={14} color="var(--accent-color)" /> Popular Stays Near You
          </div>
          <div className="suggestions-list">
            {filteredLocations.map((loc, idx) => (
              <div
                key={idx}
                className="suggestion-item"
                onClick={() => handleSelectLocation(loc.city)}
              >
                <div className="item-icon-wrapper">
                  <MapPin size={16} color="var(--accent-color)" />
                </div>
                <div>
                  <strong className="item-title">{loc.city}</strong>
                  <span className="item-subtitle">{loc.state}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;

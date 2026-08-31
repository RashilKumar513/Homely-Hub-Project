import React, { useEffect, useState, useRef } from 'react';
import '../../css/Home.css';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getAllProperties } from '../../store/Property/property-action';
import { toggleWishlistApi } from '../../store/Wishlist/wishlist-action';
import { capitalizeText, formatLocation } from '../../utils/formatText';
import gsap from 'gsap';
import { Heart, Star, MapPin, Users, ChevronLeft, ChevronRight, ShieldCheck, Map as MapIcon, List as ListIcon } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const fallbackImg = 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80';

// City Coordinates for Map Pins
const cityCoordinates = {
  goa: [15.2993, 74.124],
  mumbai: [19.076, 72.8777],
  bandra: [19.0596, 72.8295],
  jaipur: [26.9124, 75.7873],
  ooty: [11.4102, 76.695],
  chikmagalur: [13.3161, 75.772],
  ladakh: [34.1526, 77.5771],
  leh: [34.1526, 77.5771],
  manali: [32.2432, 77.1892],
  bangalore: [12.9716, 77.5946],
  munnar: [10.0889, 77.0595],
  chennai: [13.0827, 80.2707],
  delhi: [28.6139, 77.209],
};

const getPropertyCoords = (address, index) => {
  const city = (address?.city || '').toLowerCase().trim();
  if (cityCoordinates[city]) {
    const base = cityCoordinates[city];
    return [base[0] + (index % 5) * 0.012, base[1] + (index % 5) * 0.015];
  }
  return [15.2993 + (index % 6) * 0.5, 74.124 + (index % 6) * 0.8];
};

const Card = ({ property }) => {
  const dispatch = useDispatch();
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const isWishlisted = wishlistItems.some((item) => item._id === property._id);

  const handleHeartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlistApi(property));
  };

  const imageUrl = property.images && property.images.length > 0 && property.images[0]?.url
    ? property.images[0].url
    : fallbackImg;

  const addressString = formatLocation(property.address?.city, property.address?.state);
  const rating = property.ratings ? property.ratings.toFixed(1) : '4.8';
  const isSuperhost = rating >= 4.8;

  return (
    <div className="property-card">
      <div className="card-img-wrapper">
        <Link to={`/propertylist/${property._id}`}>
          <img
            src={imageUrl}
            alt={property.propertyName || 'Property'}
            onError={(e) => {
              e.target.src = fallbackImg;
            }}
          />
        </Link>
        <button
          className={`wishlist-heart-btn ${isWishlisted ? 'active' : ''}`}
          onClick={handleHeartClick}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart size={18} fill={isWishlisted ? '#ff385c' : 'none'} color={isWishlisted ? '#ff385c' : '#475569'} />
        </button>

        {isSuperhost && (
          <span
            style={{
              position: 'absolute',
              top: '0.75rem',
              left: '0.75rem',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(4px)',
              color: '#ffffff',
              padding: '0.25rem 0.6rem',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              zIndex: 5,
            }}
          >
            <ShieldCheck size={14} color="#f59e0b" /> Superhost
          </span>
        )}

        {property.propertyType && (
          <span className="card-type-badge">{capitalizeText(property.propertyType)}</span>
        )}
      </div>

      <div className="card-info">
        <div className="card-header-row">
          <h4 className="card-title" title={property.propertyName}>
            {capitalizeText(property.propertyName || 'Cozy Home Stay')}
          </h4>
          <div className="card-rating">
            <Star size={14} fill="#f59e0b" color="#f59e0b" />
            <span>{rating}</span>
          </div>
        </div>

        <p className="card-address">
          <MapPin size={14} />
          {addressString}
        </p>

        {property.maximumGuest && (
          <p className="card-address" style={{ fontSize: '0.8rem' }}>
            <Users size={14} /> Up to {property.maximumGuest} guests
          </p>
        )}

        <div className="card-price-row">
          <span className="card-price">₹{property.price}</span>
          <span className="card-price-unit">/ night</span>
        </div>
      </div>
    </div>
  );
};

const PropertyList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const dispatch = useDispatch();
  const { properties, loading } = useSelector((state) => state.properties);
  const propertyListRef = useRef(null);

  useEffect(() => {
    dispatch(getAllProperties());
  }, [dispatch]);

  // Equal Split Pagination Calculation across Page 1 & Page 2
  const totalCount = properties.length;
  const itemsPerPage = totalCount > 0 ? Math.ceil(totalCount / 2) : 12;
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProperties = properties.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    if (propertyListRef.current && paginatedProperties.length > 0 && viewMode === 'list') {
      gsap.fromTo(
        propertyListRef.current.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
      );
    }
  }, [paginatedProperties, viewMode]);

  return (
    <>
      {/* Floating Map / List Toggle Button */}
      <div style={{ position: 'fixed', bottom: '2.5rem', right: '2.5rem', zIndex: 1000 }}>
        <button
          type="button"
          onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
          style={{
            background: '#0f172a',
            color: '#ffffff',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '30px',
            fontWeight: '700',
            fontSize: '0.95rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
          }}
        >
          {viewMode === 'list' ? <MapIcon size={18} /> : <ListIcon size={18} />}
          {viewMode === 'list' ? 'Show Map View' : 'Show List View'}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="spinner-border text-danger" role="status"></div>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading beautiful stays...</p>
        </div>
      ) : properties.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <h3>No Properties Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Try adjusting your search location or filters to find options.
          </p>
        </div>
      ) : viewMode === 'map' ? (
        /* MAP VIEW */
        <div style={{ maxWidth: '1400px', margin: '1rem auto', padding: '0 1.5rem', height: '650px', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
          <MapContainer center={[19.076, 72.8777]} zoom={6} scrollWheelZoom={true} style={{ width: '100%', height: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {properties.map((p, idx) => {
              const coords = getPropertyCoords(p.address, idx);
              const customIcon = L.divIcon({
                className: 'custom-map-price-pin',
                html: `<div style="background: #ff385c; color: white; padding: 4px 10px; border-radius: 20px; font-weight: 800; font-size: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid white; white-space: nowrap;">₹${p.price}</div>`,
                iconSize: [60, 30],
              });

              return (
                <Marker key={p._id} position={coords} icon={customIcon}>
                  <Popup>
                    <div style={{ minWidth: '180px' }}>
                      <img
                        src={p.images?.[0]?.url || fallbackImg}
                        alt={p.propertyName}
                        style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '10px', marginBottom: '8px' }}
                      />
                      <strong style={{ fontSize: '0.95rem', display: 'block' }}>{capitalizeText(p.propertyName)}</strong>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{formatLocation(p.address?.city, p.address?.state)}</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                        <span style={{ fontWeight: '800', color: '#ff385c' }}>₹{p.price}/night</span>
                        <Link to={`/propertylist/${p._id}`} style={{ background: '#3b82f6', color: 'white', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', textDecoration: 'none' }}>
                          View Stay
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      ) : (
        /* LIST VIEW: Equal Split Properties */
        <div className="propertylist" ref={propertyListRef}>
          {paginatedProperties.map((property) => (
            <Card key={property._id} property={property} />
          ))}
        </div>
      )}

      {viewMode === 'list' && totalPages > 1 && (
        <div className="property-pagination">
          <button
            className="property-pagination-btn"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={18} /> Previous
          </button>

          <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
            Page {currentPage} of {totalPages}
          </span>

          <button
            className="property-pagination-btn"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage >= totalPages}
          >
            Next <ChevronRight size={18} />
          </button>
        </div>
      )}
    </>
  );
};

export default PropertyList;

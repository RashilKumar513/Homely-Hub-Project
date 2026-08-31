import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, toggleWishlistApi } from '../../store/Wishlist/wishlist-action';
import { capitalizeText, formatLocation } from '../../utils/formatText';
import { Link } from 'react-router-dom';
import { Heart, Star, MapPin, Trash2, ArrowLeft } from 'lucide-react';

const Wishlist = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.user);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  const handleRemove = (property) => {
    dispatch(toggleWishlistApi(property));
  };

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
        <Heart size={48} color="#ff385c" style={{ marginBottom: '1rem' }} />
        <h2>Save Your Favorite Stays</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 1.5rem' }}>
          Log in to view and save properties to your wishlist.
        </p>
        <Link to="/login" className="btn btn-danger btn-lg" style={{ borderRadius: '30px', padding: '0.6rem 2rem' }}>
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/" style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', fontWeight: '600' }}>
          <ArrowLeft size={20} /> Back to Home
        </Link>
        <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800' }}>
          Your Saved Wishlist ❤️ ({items.length})
        </h2>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="spinner-border text-danger" role="status"></div>
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <Heart size={40} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
          <h3>Your Wishlist is Empty</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Click the heart icon on any property card to save your favorite accommodations.
          </p>
          <Link to="/" className="btn btn-primary" style={{ borderRadius: '30px', padding: '0.6rem 1.5rem' }}>
            Explore Properties
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {items.map((property) => {
            const imageUrl = property.images && property.images.length > 0
              ? property.images[0].url
              : 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80';

            return (
              <div key={property._id} className="property-card">
                <div className="card-img-wrapper">
                  <Link to={`/propertylist/${property._id}`}>
                    <img src={imageUrl} alt={property.propertyName} />
                  </Link>
                  <button
                    className="wishlist-heart-btn active"
                    onClick={() => handleRemove(property)}
                    title="Remove from wishlist"
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </button>
                  {property.propertyType && <span className="card-type-badge">{capitalizeText(property.propertyType)}</span>}
                </div>

                <div className="card-info">
                  <div className="card-header-row">
                    <h4 className="card-title">{capitalizeText(property.propertyName)}</h4>
                    <div className="card-rating">
                      <Star size={14} fill="#f59e0b" color="#f59e0b" />
                      <span>{property.ratings ? property.ratings.toFixed(1) : '4.8'}</span>
                    </div>
                  </div>

                  <p className="card-address">
                    <MapPin size={14} />
                    {formatLocation(property.address?.city, property.address?.state)}
                  </p>

                  <div className="card-price-row">
                    <span className="card-price">₹{property.price}</span>
                    <span className="card-price-unit">/ night</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;

import axios from 'axios';
import { wishlistActions } from './wishlist-slice';
import toast from 'react-hot-toast';

export const fetchWishlist = () => async (dispatch) => {
  try {
    dispatch(wishlistActions.setLoading(true));
    const response = await axios.get('/api/v1/rent/user/wishlist');
    dispatch(wishlistActions.setWishlist(response.data.wishlist));
    dispatch(wishlistActions.setLoading(false));
  } catch (error) {
    dispatch(wishlistActions.setLoading(false));
    dispatch(wishlistActions.setError(error.response?.data?.message || 'Failed to fetch wishlist'));
  }
};

export const toggleWishlistApi = (property) => async (dispatch) => {
  try {
    dispatch(wishlistActions.toggleWishlistLocal(property));
    const response = await axios.post(`/api/v1/rent/user/wishlist/${property._id}`);
    if (response.data.isWishlisted) {
      toast.success('Added to Wishlist ❤️');
    } else {
      toast.success('Removed from Wishlist');
    }
  } catch (error) {
    dispatch(wishlistActions.toggleWishlistLocal(property)); // revert if failed
    toast.error('Please login to save properties!');
  }
};

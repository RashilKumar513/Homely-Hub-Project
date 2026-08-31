import { Property } from '../Models/PropertyModel.js';
import APIFeatures from '../utils/APIFeatures.js';
import imagekit from '../utils/ImagekitIO.js';

export const createProperty = async (req, res) => {
  try {
    const {
      propertyName,
      description,
      extraInfo,
      propertyType,
      roomType,
      address,
      amenities,
      checkInTime,
      checkOutTime,
      maximumGuest,
      price,
      images,
    } = req.body;

    let uploadedImages = [];

    if (images && Array.isArray(images) && images.length > 0) {
      for (const img of images) {
        if (typeof img === 'string' && img.startsWith('data:image')) {
          const uploadRes = await imagekit.upload({
            file: img,
            fileName: `prop_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`,
            folder: 'properties',
          });
          uploadedImages.push({
            public_id: uploadRes.fileId,
            url: uploadRes.url,
          });
        } else if (typeof img === 'object' && img.url) {
          uploadedImages.push(img);
        } else if (typeof img === 'string') {
          uploadedImages.push({ url: img });
        }
      }
    }

    const defaultImages = [
      { url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80' },
      { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80' },
      { url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80' },
      { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80' },
      { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80' },
      { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80' },
    ];

    const finalImages = uploadedImages.length >= 6 ? uploadedImages : [...uploadedImages, ...defaultImages].slice(0, 6);

    const newProperty = await Property.create({
      propertyName,
      description,
      propertyType: propertyType || 'House',
      roomType: roomType || 'Anytype',
      extraInfo,
      address,
      amenities: amenities || [],
      checkInTime: checkInTime || '11:00',
      checkOutTime: checkOutTime || '13:00',
      maximumGuest: Number(maximumGuest) || 2,
      price: Number(price) || 500,
      images: finalImages,
      userId: req.user._id,
    });

    res.status(201).json({
      status: 'success',
      data: { data: newProperty },
    });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(400).json({
      status: 'fail',
      error: error.message || 'Error creating property',
    });
  }
};

export const getProperties = async (req, res) => {
  try {
    const features = new APIFeatures(Property.find(), req.query)
      .filter()
      .search()
      .paginate();

    const totalPropertiesCount = await Property.countDocuments();
    const properties = await features.query;

    res.status(200).json({
      status: 'success',
      no_of_responses: properties.length,
      all_properties: totalPropertiesCount,
      data: properties,
    });
  } catch (error) {
    console.error('Error searching properties:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getUsersProperties = async (req, res) => {
  try {
    const properties = await Property.find({ userId: req.user._id });
    res.status(200).json({
      status: 'success',
      data: properties,
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ status: 'fail', message: 'Property not found' });
    }

    const isOwner = property.userId && req.user && property.userId.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ status: 'fail', message: 'Not authorized to edit this property' });
    }

    const updatePayload = { ...req.body };
    if (updatePayload.price !== undefined) updatePayload.price = Number(updatePayload.price);
    if (updatePayload.maximumGuest !== undefined) updatePayload.maximumGuest = Number(updatePayload.maximumGuest);

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      { $set: updatePayload },
      {
        new: true,
        runValidators: false,
      }
    );

    res.status(200).json({
      status: 'success',
      data: updatedProperty,
    });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ status: 'fail', message: 'Property not found' });
    }

    const isOwner = property.userId && req.user && property.userId.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ status: 'fail', message: 'Not authorized to delete this property' });
    }

    await Property.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Property deleted successfully',
    });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

export const createPropertyReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ status: 'fail', message: 'Property not found' });
    }

    const alreadyReviewed = property.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      alreadyReviewed.rating = Number(rating);
      alreadyReviewed.comment = comment;
    } else {
      const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
      };
      property.reviews.push(review);
      property.numOfReviews = property.reviews.length;
    }

    property.ratings =
      property.reviews.reduce((acc, item) => item.rating + acc, 0) / property.reviews.length;

    await property.save();

    res.status(200).json({
      status: 'success',
      message: 'Review added successfully',
      ratings: property.ratings,
      reviews: property.reviews,
    });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

export const getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ status: 'fail', message: 'Property not found' });
    }
    res.status(200).json({
      status: 'success',
      data: property,
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const filterConditions = {};

    if (queryObj.minPrice && queryObj.maxPrice) {
      if (queryObj.maxPrice.includes('>')) {
        filterConditions.price = { $gte: Number(queryObj.minPrice) };
      } else {
        filterConditions.price = {
          $gte: Number(queryObj.minPrice),
          $lte: Number(queryObj.maxPrice),
        };
      }
    } else if (queryObj.minPrice) {
      filterConditions.price = { $gte: Number(queryObj.minPrice) };
    } else if (queryObj.maxPrice && !queryObj.maxPrice.includes('>')) {
      filterConditions.price = { $lte: Number(queryObj.maxPrice) };
    }

    if (queryObj.propertyType) {
      const types = queryObj.propertyType.split(',').map((t) => t.trim());
      filterConditions.propertyType = { $in: types };
    }

    if (queryObj.roomType && queryObj.roomType !== 'Anytype') {
      filterConditions.roomType = queryObj.roomType;
    }

    if (queryObj.amenities) {
      const amenities = Array.isArray(queryObj.amenities)
        ? queryObj.amenities
        : [queryObj.amenities];
      filterConditions['amenities.name'] = { $all: amenities };
    }

    this.query = this.query.find(filterConditions);
    return this;
  }

  search() {
    const queryObj = { ...this.queryString };
    const searchConditions = {};

    if (queryObj.city) {
      const cleanCity = queryObj.city.toLowerCase().replace(/\s+/g, '');
      const cityRegex = new RegExp(cleanCity, 'i');
      searchConditions['$or'] = [
        { 'address.city': cityRegex },
        { 'address.state': cityRegex },
        { 'address.area': cityRegex },
        { propertyName: cityRegex },
      ];
    }

    if (queryObj.guests) {
      searchConditions.maximumGuest = { $gte: Number(queryObj.guests) };
    }

    if (queryObj.dateIn && queryObj.dateOut) {
      searchConditions['$and'] = [
        {
          currentBookings: {
            $not: {
              $elemMatch: {
                $or: [
                  {
                    fromDate: { $lt: queryObj.dateOut },
                    toDate: { $gt: queryObj.dateIn },
                  },
                  {
                    fromDate: { $lt: queryObj.dateIn },
                    toDate: { $gt: queryObj.dateIn },
                  },
                ],
              },
            },
          },
        },
      ];
    }

    this.query = this.query.find(searchConditions);
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

export default APIFeatures;
export { APIFeatures };
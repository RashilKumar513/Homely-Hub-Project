import { Property } from '../Models/PropertyModel.js';

// Natural Language Smart Search & AI Match Calculator
export const smartSearchAI = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ status: 'fail', message: 'Please provide a search prompt query' });
    }

    const lowerQuery = query.toLowerCase();

    // Extract destination keyword
    const knownDestinations = ['goa', 'ooty', 'manali', 'munnar', 'jaipur', 'mumbai', 'chikmagalur', 'bangalore', 'delhi', 'ladakh'];
    const matchedDest = knownDestinations.find((dest) => lowerQuery.includes(dest));

    // Extract budget limit
    const budgetMatch = lowerQuery.match(/(?:under|below|less than|max|budget)\s*(?:₹|rs\.?|inr)?\s*(\d+[\d,]*)/i);
    const budgetLimit = budgetMatch ? parseInt(budgetMatch[1].replace(/,/g, ''), 10) : null;

    // Extract guest capacity
    const guestMatch = lowerQuery.match(/(\d+)\s*(?:people|guests|persons|adults)/i);
    const requiredGuests = guestMatch ? parseInt(guestMatch[1], 10) : 1;

    // Extract desired amenities
    const requestedPool = lowerQuery.includes('pool') || lowerQuery.includes('swimming');
    const requestedWifi = lowerQuery.includes('wifi') || lowerQuery.includes('internet');
    const requestedAC = lowerQuery.includes('ac') || lowerQuery.includes('air conditioning');

    // Build Mongoose database filter
    const dbFilter = {};
    if (matchedDest) {
      dbFilter['address.city'] = new RegExp(matchedDest, 'i');
    }
    if (budgetLimit) {
      dbFilter.price = { $lte: budgetLimit };
    }
    if (requiredGuests > 1) {
      dbFilter.maximumGuest = { $gte: requiredGuests };
    }

    let properties = await Property.find(dbFilter);

    // Fallback search if strict filter returned 0 results
    if (properties.length === 0) {
      properties = await Property.find({});
    }

    // Calculate match score and match reasons for each property
    const scoredProperties = properties.map((prop) => {
      let score = 70; // Base score
      const matchReasons = [];

      if (matchedDest && prop.address?.city?.toLowerCase().includes(matchedDest)) {
        score += 15;
        matchReasons.push(`Located in ${matchedDest.toUpperCase()}`);
      }
      if (budgetLimit && prop.price <= budgetLimit) {
        score += 10;
        matchReasons.push(`Fits budget (₹${prop.price.toLocaleString('en-IN')}/night)`);
      }
      if (prop.maximumGuest >= requiredGuests) {
        score += 5;
        matchReasons.push(`Accommodates ${prop.maximumGuest} guests`);
      }

      const hasPool = prop.amenities?.some((a) => a.name?.toLowerCase().includes('pool'));
      if (requestedPool && hasPool) {
        score += 5;
        matchReasons.push('Swimming Pool available');
      }

      const finalMatchPercentage = Math.min(score, 99);

      return {
        ...prop.toObject(),
        matchPercentage: finalMatchPercentage,
        matchReasons,
      };
    });

    scoredProperties.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.status(200).json({
      status: 'success',
      queryParsed: {
        destination: matchedDest || 'All Staycations',
        maxBudget: budgetLimit,
        guests: requiredGuests,
      },
      matchCount: scoredProperties.length,
      data: scoredProperties,
    });
  } catch (error) {
    console.error('AI Smart Search Error:', error);
    res.status(500).json({ status: 'fail', message: error.message });
  }
};

// Homely AI Concierge Assistant
export const aiConcierge = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ status: 'fail', message: 'Please provide a message' });
    }

    const text = message.toLowerCase();
    let reply = '';

    if (text.includes('cancel') || text.includes('refund')) {
      reply = 'ℹ️ Homely Hub Policy: Cancellations made before check-in receive an 85% refund credited directly to your bank account / payment method. A 15% non-refundable processing fee applies.';
    } else if (text.includes('flexi') || text.includes('checkin') || text.includes('check-in')) {
      reply = '⏱️ Flexi Stay Feature: You can select early check-in from 10:00 AM or late checkout up to 11:00 PM. Rates calculate dynamically based on exact hours.';
    } else if (text.includes('goa') || text.includes('ooty') || text.includes('beach') || text.includes('mountain')) {
      reply = '🌴 Staycation Guide: We feature premium villas in Goa, Ooty, Munnar, Manali, Jaipur, and Mumbai with verified pools, private lawns, and high-speed Wi-Fi!';
    } else {
      reply = `✨ Homely AI Concierge: Thank you for asking! I can assist with property search, Flexi Stay timings, GST tax invoice receipts, and stay itineraries.`;
    }

    res.status(200).json({
      status: 'success',
      reply,
    });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: error.message });
  }
};

// Personalization Quiz Matcher
export const personalizationQuiz = async (req, res) => {
  try {
    const { destinationType, budget, travelStyle, guests } = req.body;

    const query = {};
    if (budget) query.price = { $lte: Number(budget) };
    if (guests) query.maximumGuest = { $gte: Number(guests) };

    let properties = await Property.find(query);
    if (properties.length === 0) properties = await Property.find({});

    res.status(200).json({
      status: 'success',
      message: 'Personalized Staycation Recommendations Found',
      data: properties.slice(0, 6),
    });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: error.message });
  }
};

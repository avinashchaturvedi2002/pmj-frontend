export const parseItinerary = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === 'object') {
    return value;
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  return null;
};

export const hasItineraryContent = (itinerary) => {
  if (!itinerary) {
    return false;
  }

  if (typeof itinerary.overview === 'string' && itinerary.overview.trim().length > 0) {
    return true;
  }

  if (Array.isArray(itinerary.days) && itinerary.days.length > 0) {
    return true;
  }

  if (Array.isArray(itinerary.travelTips) && itinerary.travelTips.length > 0) {
    return true;
  }

  if (Array.isArray(itinerary.packingList) && itinerary.packingList.length > 0) {
    return true;
  }

  return false;
};



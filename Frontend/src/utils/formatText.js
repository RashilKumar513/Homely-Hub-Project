export const capitalizeText = (str) => {
  if (!str) return '';
  return str
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const formatLocation = (city, state) => {
  const cleanCity = capitalizeText(city || '');
  const cleanState = capitalizeText(state || '');
  if (cleanCity && cleanState) return `${cleanCity}, ${cleanState}`;
  return cleanCity || cleanState || 'Location Unavailable';
};

export const formatTime = (timeStr, defaultTime = '12:00 PM') => {
  if (!timeStr) return defaultTime;
  if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) {
    return timeStr;
  }
  const parts = timeStr.split(':');
  if (parts.length < 2) return defaultTime;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
};

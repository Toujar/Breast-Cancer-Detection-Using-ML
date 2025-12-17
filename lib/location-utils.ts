// Karnataka cities with real coordinates
export interface LocationCoordinates {
  name: string;
  latitude: number;
  longitude: number;
  district: string;
}

export const karnatakaLocations: LocationCoordinates[] = [
  // Major Cities
  { name: 'Bangalore', latitude: 12.9716, longitude: 77.5946, district: 'Bangalore Urban' },
  { name: 'Mysuru', latitude: 12.2958, longitude: 76.6394, district: 'Mysuru' },
  { name: 'Hubli', latitude: 15.3647, longitude: 75.1240, district: 'Dharwad' },
  { name: 'Mangaluru', latitude: 12.9141, longitude: 74.8560, district: 'Dakshina Kannada' },
  { name: 'Belagavi', latitude: 15.8497, longitude: 74.4977, district: 'Belagavi' },
  { name: 'Kalaburagi', latitude: 17.3297, longitude: 76.8343, district: 'Kalaburagi' },
  
  // Bangalore Areas
  { name: 'Koramangala', latitude: 12.9279, longitude: 77.6271, district: 'Bangalore Urban' },
  { name: 'Whitefield', latitude: 12.9698, longitude: 77.7499, district: 'Bangalore Urban' },
  { name: 'Jayanagar', latitude: 12.9237, longitude: 77.5838, district: 'Bangalore Urban' },
  { name: 'HSR Layout', latitude: 12.9081, longitude: 77.6476, district: 'Bangalore Urban' },
  { name: 'Bannerghatta Road', latitude: 12.8996, longitude: 77.6047, district: 'Bangalore Urban' },
  { name: 'HAL Airport Road', latitude: 12.9611, longitude: 77.6645, district: 'Bangalore Urban' },
  { name: 'Cunningham Road', latitude: 12.9716, longitude: 77.5946, district: 'Bangalore Urban' },
  { name: 'K R Road', latitude: 12.9591, longitude: 77.5857, district: 'Bangalore Urban' },
  { name: 'Fort', latitude: 12.9591, longitude: 77.5857, district: 'Bangalore Urban' },
  { name: 'Bommasandra', latitude: 12.8066, longitude: 77.6848, district: 'Bangalore Urban' }
];

// Haversine formula to calculate distance between two points on Earth
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Get coordinates for a location name
export function getLocationCoordinates(locationName: string): LocationCoordinates | null {
  const normalizedName = locationName.toLowerCase().trim();
  
  // First try exact match
  let location = karnatakaLocations.find(loc => 
    loc.name.toLowerCase() === normalizedName
  );
  
  // If not found, try partial match
  if (!location) {
    location = karnatakaLocations.find(loc => 
      loc.name.toLowerCase().includes(normalizedName) ||
      normalizedName.includes(loc.name.toLowerCase())
    );
  }
  
  return location || null;
}

// Calculate distance between two location names
export function getDistanceBetweenLocations(
  location1: string, 
  location2: string
): number | null {
  const coords1 = getLocationCoordinates(location1);
  const coords2 = getLocationCoordinates(location2);
  
  if (!coords1 || !coords2) {
    return null;
  }
  
  return calculateDistance(
    coords1.latitude, 
    coords1.longitude, 
    coords2.latitude, 
    coords2.longitude
  );
}

// Format distance for display
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)}km`;
  } else {
    return `${Math.round(distance)}km`;
  }
}

// Enhanced doctor location matching
export function parseLocationFromString(locationString: string): string {
  // Extract location from strings like "HAL Airport Road, Bangalore"
  const parts = locationString.split(',');
  if (parts.length > 1) {
    // Try the last part first (usually the city)
    const city = parts[parts.length - 1].trim();
    if (getLocationCoordinates(city)) {
      return city;
    }
    
    // Try the first part (specific area)
    const area = parts[0].trim();
    if (getLocationCoordinates(area)) {
      return area;
    }
  }
  
  // Try the whole string
  if (getLocationCoordinates(locationString)) {
    return locationString;
  }
  
  // Default to Bangalore if nothing matches
  return 'Bangalore';
}
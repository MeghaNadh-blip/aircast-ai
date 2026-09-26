export interface CityLocation {
  name: string;
  lat: number;
  lng: number;
}

export interface StateLocation {
  name: string;
  cities: CityLocation[];
}

export interface CountryLocation {
  code: string;
  name: string;
  states: StateLocation[];
}

export const CASCADING_LOCATIONS: CountryLocation[] = [
  {
    code: 'US',
    name: 'United States',
    states: [
      {
        name: 'California',
        cities: [
          { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
          { name: 'San Francisco', lat: 37.7749, lng: -122.4194 },
          { name: 'San Diego', lat: 32.7157, lng: -117.1611 },
          { name: 'Sacramento', lat: 38.5816, lng: -121.4944 },
          { name: 'San Jose', lat: 37.3382, lng: -121.8863 },
        ],
      },
      {
        name: 'New York',
        cities: [
          { name: 'New York City', lat: 40.7128, lng: -74.006 },
          { name: 'Buffalo', lat: 42.8864, lng: -78.8784 },
          { name: 'Albany', lat: 42.6526, lng: -73.7562 },
          { name: 'Rochester', lat: 43.1566, lng: -77.6088 },
        ],
      },
      {
        name: 'Texas',
        cities: [
          { name: 'Houston', lat: 29.7604, lng: -95.3698 },
          { name: 'Austin', lat: 30.2672, lng: -97.7431 },
          { name: 'Dallas', lat: 32.7767, lng: -96.797 },
          { name: 'San Antonio', lat: 29.4241, lng: -98.4936 },
        ],
      },
      {
        name: 'Illinois',
        cities: [
          { name: 'Chicago', lat: 41.8781, lng: -87.6298 },
          { name: 'Springfield', lat: 39.7817, lng: -89.6501 },
          { name: 'Peoria', lat: 40.6936, lng: -89.589 },
        ],
      },
      {
        name: 'Washington',
        cities: [
          { name: 'Seattle', lat: 47.6062, lng: -122.3321 },
          { name: 'Spokane', lat: 47.6588, lng: -117.426 },
          { name: 'Tacoma', lat: 47.2529, lng: -122.4443 },
        ],
      },
    ],
  },
  {
    code: 'IN',
    name: 'India',
    states: [
      {
        name: 'Delhi NCR',
        cities: [
          { name: 'New Delhi', lat: 28.6139, lng: 77.209 },
          { name: 'Noida', lat: 28.5355, lng: 77.391 },
          { name: 'Gurugram', lat: 28.4595, lng: 77.0266 },
          { name: 'Faridabad', lat: 28.4089, lng: 77.3178 },
        ],
      },
      {
        name: 'Maharashtra',
        cities: [
          { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
          { name: 'Pune', lat: 18.5204, lng: 73.8567 },
          { name: 'Nagpur', lat: 21.1458, lng: 79.0882 },
          { name: 'Nashik', lat: 19.9975, lng: 73.7898 },
        ],
      },
      {
        name: 'Karnataka',
        cities: [
          { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
          { name: 'Mysuru', lat: 12.2958, lng: 76.6394 },
          { name: 'Mangaluru', lat: 12.9141, lng: 74.856 },
        ],
      },
      {
        name: 'Tamil Nadu',
        cities: [
          { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
          { name: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
          { name: 'Madurai', lat: 9.9252, lng: 78.1198 },
        ],
      },
      {
        name: 'West Bengal',
        cities: [
          { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
          { name: 'Howrah', lat: 22.5958, lng: 88.2636 },
          { name: 'Siliguri', lat: 26.7271, lng: 88.3953 },
        ],
      },
    ],
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    states: [
      {
        name: 'England',
        cities: [
          { name: 'London', lat: 51.5074, lng: -0.1278 },
          { name: 'Manchester', lat: 53.4808, lng: -2.2426 },
          { name: 'Birmingham', lat: 52.4862, lng: -1.8904 },
          { name: 'Leeds', lat: 53.8008, lng: -1.5491 },
        ],
      },
      {
        name: 'Scotland',
        cities: [
          { name: 'Edinburgh', lat: 55.9533, lng: -3.1883 },
          { name: 'Glasgow', lat: 55.8642, lng: -4.2518 },
          { name: 'Aberdeen', lat: 57.1497, lng: -2.0943 },
        ],
      },
      {
        name: 'Wales',
        cities: [
          { name: 'Cardiff', lat: 51.4816, lng: -3.1791 },
          { name: 'Swansea', lat: 51.6214, lng: -3.9436 },
        ],
      },
    ],
  },
  {
    code: 'FR',
    name: 'France',
    states: [
      {
        name: 'Île-de-France',
        cities: [
          { name: 'Paris', lat: 48.8566, lng: 2.3522 },
          { name: 'Versailles', lat: 48.8049, lng: 2.1204 },
          { name: 'Saint-Denis', lat: 48.9362, lng: 2.3574 },
        ],
      },
      {
        name: "Provence-Alpes-Côte d'Azur",
        cities: [
          { name: 'Marseille', lat: 43.2965, lng: 5.3698 },
          { name: 'Nice', lat: 43.7102, lng: 7.262 },
          { name: 'Cannes', lat: 43.5528, lng: 7.0174 },
        ],
      },
      {
        name: 'Auvergne-Rhône-Alpes',
        cities: [
          { name: 'Lyon', lat: 45.764, lng: 4.8357 },
          { name: 'Grenoble', lat: 45.1885, lng: 5.7245 },
        ],
      },
    ],
  },
  {
    code: 'DE',
    name: 'Germany',
    states: [
      {
        name: 'Berlin',
        cities: [{ name: 'Berlin', lat: 52.52, lng: 13.405 }],
      },
      {
        name: 'Bavaria',
        cities: [
          { name: 'Munich', lat: 48.1351, lng: 11.582 },
          { name: 'Nuremberg', lat: 49.4521, lng: 11.0767 },
          { name: 'Augsburg', lat: 48.3705, lng: 10.8978 },
        ],
      },
      {
        name: 'North Rhine-Westphalia',
        cities: [
          { name: 'Cologne', lat: 50.9375, lng: 6.9603 },
          { name: 'Düsseldorf', lat: 51.2277, lng: 6.7735 },
          { name: 'Dortmund', lat: 51.5136, lng: 7.4653 },
        ],
      },
    ],
  },
  {
    code: 'JP',
    name: 'Japan',
    states: [
      {
        name: 'Kanto',
        cities: [
          { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
          { name: 'Yokohama', lat: 35.4437, lng: 139.638 },
          { name: 'Chiba', lat: 35.6074, lng: 140.1065 },
        ],
      },
      {
        name: 'Kansai',
        cities: [
          { name: 'Osaka', lat: 34.6937, lng: 135.5023 },
          { name: 'Kyoto', lat: 35.0116, lng: 135.7681 },
          { name: 'Kobe', lat: 34.6901, lng: 135.1955 },
        ],
      },
    ],
  },
  {
    code: 'AU',
    name: 'Australia',
    states: [
      {
        name: 'New South Wales',
        cities: [
          { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
          { name: 'Newcastle', lat: -32.9283, lng: 151.7817 },
          { name: 'Wollongong', lat: -34.4278, lng: 150.8931 },
        ],
      },
      {
        name: 'Victoria',
        cities: [
          { name: 'Melbourne', lat: -37.8136, lng: 144.9631 },
          { name: 'Geelong', lat: -38.1499, lng: 144.3617 },
        ],
      },
      {
        name: 'Queensland',
        cities: [
          { name: 'Brisbane', lat: -27.4698, lng: 153.0251 },
          { name: 'Gold Coast', lat: -28.0167, lng: 153.4 },
        ],
      },
    ],
  },
  {
    code: 'BR',
    name: 'Brazil',
    states: [
      {
        name: 'São Paulo',
        cities: [
          { name: 'São Paulo', lat: -23.5505, lng: -46.6333 },
          { name: 'Campinas', lat: -22.9099, lng: -47.0626 },
          { name: 'Santos', lat: -23.9608, lng: -46.3336 },
        ],
      },
      {
        name: 'Rio de Janeiro',
        cities: [
          { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
          { name: 'Niterói', lat: -22.8833, lng: -43.1039 },
        ],
      },
    ],
  },
  {
    code: 'EG',
    name: 'Egypt',
    states: [
      {
        name: 'Cairo Governorate',
        cities: [
          { name: 'Cairo', lat: 30.0444, lng: 31.2357 },
          { name: 'New Cairo', lat: 30.0074, lng: 31.4913 },
        ],
      },
      {
        name: 'Alexandria Governorate',
        cities: [
          { name: 'Alexandria', lat: 31.2001, lng: 29.9187 },
        ],
      },
    ],
  },
];

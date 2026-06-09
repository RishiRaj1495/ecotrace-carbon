/**
 * Emission factors in kg CO2e per unit
 * Sources: EPA, IPCC, Our World in Data
 */

export const EMISSION_FACTORS = {
  transport: {
    car_petrol: 0.21,       // kg CO2e per km
    car_diesel: 0.17,
    car_electric: 0.05,
    motorbike: 0.11,
    bus: 0.089,
    train: 0.041,
    domestic_flight: 0.255, // per km
    longhaul_flight: 0.195,
  },
  diet: {
    vegan: 1.5,             // kg CO2e per day
    vegetarian: 2.0,
    pescatarian: 2.5,
    flexitarian: 3.0,
    omnivore: 3.8,
    high_meat: 5.5,
  },
  energy: {
    electricity_kwh: 0.233, // kg CO2e per kWh (global avg)
    gas_kwh: 0.203,
    oil_litre: 2.52,
    coal_kg: 2.42,
  },
  shopping: {
    clothing_item: 10,      // kg CO2e per item
    electronics_small: 30,
    electronics_large: 300,
    furniture: 50,
  },
};

export const GLOBAL_AVERAGE_FOOTPRINT = 4800; // kg CO2e/year

export const UK_AVERAGE_FOOTPRINT = 5500;
export const US_AVERAGE_FOOTPRINT = 14600;
export const INDIA_AVERAGE_FOOTPRINT = 1900;
export const TARGET_FOOTPRINT = 2000; // Paris Agreement target per capita

export const EMISSION_CATEGORIES = [
  { key: 'transport', label: 'Transport', color: '#c8f135', icon: '🚗' },
  { key: 'diet', label: 'Diet & Food', color: '#5edb7a', icon: '🍽️' },
  { key: 'energy', label: 'Home Energy', color: '#5eb8db', icon: '⚡' },
  { key: 'shopping', label: 'Shopping', color: '#ffaa4d', icon: '🛍️' },
];

export const REDUCTION_TIPS = [
  {
    id: 1,
    category: 'transport',
    title: 'Switch to Public Transit',
    description: 'Replace one car journey per week with bus or train.',
    saving: 0.15,        // fraction of category emissions saved
    difficulty: 'easy',
    co2Saved: 250,       // kg CO2e/year estimate
    icon: '🚌',
  },
  {
    id: 2,
    category: 'transport',
    title: 'Cycle Short Distances',
    description: 'Cycle trips under 5km instead of driving.',
    saving: 0.20,
    difficulty: 'easy',
    co2Saved: 320,
    icon: '🚴',
  },
  {
    id: 3,
    category: 'diet',
    title: 'Try Meat-Free Mondays',
    description: 'Going vegetarian just one day per week cuts food emissions significantly.',
    saving: 0.14,
    difficulty: 'easy',
    co2Saved: 180,
    icon: '🥗',
  },
  {
    id: 4,
    category: 'diet',
    title: 'Reduce Beef Consumption',
    description: 'Beef has 20x more emissions than chicken per gram of protein.',
    saving: 0.25,
    difficulty: 'medium',
    co2Saved: 340,
    icon: '🌿',
  },
  {
    id: 5,
    category: 'energy',
    title: 'Switch to LED Lighting',
    description: 'LEDs use 75% less energy than incandescent bulbs.',
    saving: 0.08,
    difficulty: 'easy',
    co2Saved: 90,
    icon: '💡',
  },
  {
    id: 6,
    category: 'energy',
    title: 'Lower Heating by 1°C',
    description: 'Each degree reduction saves ~10% on heating bills and emissions.',
    saving: 0.10,
    difficulty: 'easy',
    co2Saved: 160,
    icon: '🌡️',
  },
  {
    id: 7,
    category: 'shopping',
    title: 'Buy Second-Hand Clothing',
    description: 'Extend garment lifespan and avoid new manufacturing emissions.',
    saving: 0.30,
    difficulty: 'easy',
    co2Saved: 120,
    icon: '👕',
  },
  {
    id: 8,
    category: 'energy',
    title: 'Install Solar Panels',
    description: 'Generate your own clean electricity and cut grid dependency.',
    saving: 0.50,
    difficulty: 'hard',
    co2Saved: 1200,
    icon: '☀️',
  },
  {
    id: 9,
    category: 'transport',
    title: 'Avoid Short-Haul Flights',
    description: 'Take trains instead of flying for journeys under 600km.',
    saving: 0.40,
    difficulty: 'medium',
    co2Saved: 600,
    icon: '🚆',
  },
  {
    id: 10,
    category: 'diet',
    title: 'Reduce Food Waste',
    description: 'Planning meals and composting leftovers cuts emissions significantly.',
    saving: 0.12,
    difficulty: 'easy',
    co2Saved: 150,
    icon: '♻️',
  },
];

export const QUIZ_QUESTIONS = [
  {
    id: 'transport_mode',
    category: 'transport',
    question: 'How do you usually commute to work or school?',
    options: [
      { label: 'Private car (petrol/diesel)', value: 'car', multiplier: 1.0 },
      { label: 'Electric vehicle', value: 'ev', multiplier: 0.25 },
      { label: 'Motorcycle / scooter', value: 'moto', multiplier: 0.55 },
      { label: 'Public transport', value: 'public', multiplier: 0.2 },
      { label: 'Cycling or walking', value: 'active', multiplier: 0.02 },
      { label: 'Work from home', value: 'wfh', multiplier: 0.0 },
    ],
    baseKgCO2: 1200,
  },
  {
    id: 'flight_frequency',
    category: 'transport',
    question: 'How many flights do you take per year?',
    options: [
      { label: 'None', value: 0, multiplier: 0 },
      { label: '1–2 short flights', value: 1, multiplier: 0.5 },
      { label: '3–5 flights', value: 3, multiplier: 1.0 },
      { label: '6+ flights / frequent flyer', value: 6, multiplier: 2.5 },
    ],
    baseKgCO2: 800,
  },
  {
    id: 'diet_type',
    category: 'diet',
    question: 'Which best describes your diet?',
    options: [
      { label: 'Vegan', value: 'vegan', multiplier: 0.4 },
      { label: 'Vegetarian', value: 'vegetarian', multiplier: 0.55 },
      { label: 'Pescatarian', value: 'pescatarian', multiplier: 0.65 },
      { label: 'Some meat (a few times a week)', value: 'flexitarian', multiplier: 0.8 },
      { label: 'Meat every day', value: 'omnivore', multiplier: 1.0 },
      { label: 'High meat diet', value: 'high_meat', multiplier: 1.45 },
    ],
    baseKgCO2: 1400,
  },
  {
    id: 'energy_source',
    category: 'energy',
    question: 'What is your primary home energy source?',
    options: [
      { label: 'Renewable / solar / wind', value: 'renewable', multiplier: 0.05 },
      { label: 'Mixed / grid average', value: 'grid', multiplier: 0.6 },
      { label: 'Mostly fossil fuel (coal/gas)', value: 'fossil', multiplier: 1.0 },
      { label: 'Not sure', value: 'unknown', multiplier: 0.7 },
    ],
    baseKgCO2: 1500,
  },
  {
    id: 'home_size',
    category: 'energy',
    question: 'How large is your home?',
    options: [
      { label: 'Apartment / studio', value: 'small', multiplier: 0.5 },
      { label: 'Small house (< 100 m²)', value: 'medium', multiplier: 0.8 },
      { label: 'Medium house (100–200 m²)', value: 'large', multiplier: 1.0 },
      { label: 'Large house (> 200 m²)', value: 'xlarge', multiplier: 1.5 },
    ],
    baseKgCO2: 900,
  },
  {
    id: 'shopping_frequency',
    category: 'shopping',
    question: 'How often do you buy new clothes?',
    options: [
      { label: 'Rarely (a few items per year)', value: 'rarely', multiplier: 0.3 },
      { label: 'Occasionally (monthly)', value: 'occasional', multiplier: 0.7 },
      { label: 'Regularly (weekly)', value: 'regular', multiplier: 1.0 },
      { label: 'Frequently (fast fashion)', value: 'frequent', multiplier: 1.6 },
    ],
    baseKgCO2: 600,
  },
];

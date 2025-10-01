import { PlatformLink, ShoppingPlatform } from '../types';

/**
 * Generates shopping platform links for eco-friendly products
 */
export const generatePlatformLinks = (productName: string): PlatformLink[] => {
  const ecoSearchQuery = `${productName} eco friendly sustainable`;
  
  return [
    {
      platform: 'flipkart',
      url: generateFlipkartUrl(ecoSearchQuery),
      displayName: 'Flipkart'
    },
    {
      platform: 'amazon',
      url: generateAmazonIndiaUrl(ecoSearchQuery),
      displayName: 'Amazon'
    },
    {
      platform: 'meesho',
      url: generateMeeshoUrl(ecoSearchQuery),
      displayName: 'Meesho'
    }
  ];
};

/**
 * Generate Flipkart search URL
 * Format: https://www.flipkart.com/search?q=water+bottle+eco+friendly
 */
const generateFlipkartUrl = (query: string): string => {
  const encodedQuery = encodeURIComponent(query.toLowerCase().replace(/\s+/g, ' '));
  return `https://www.flipkart.com/search?q=${encodedQuery}&as=on&as-show=on&otracker=search`;
};

/**
 * Generate Amazon India search URL
 * Format: https://www.amazon.in/s?k=water+bottle+eco+friendly
 */
const generateAmazonIndiaUrl = (query: string): string => {
  const encodedQuery = encodeURIComponent(query.toLowerCase().replace(/\s+/g, '+'));
  return `https://www.amazon.in/s?k=${encodedQuery}`;
};

/**
 * Generate Meesho search URL
 * Format: https://www.meesho.com/search?q=water%20bottle%20eco%20friendly
 */
const generateMeeshoUrl = (query: string): string => {
  const encodedQuery = encodeURIComponent(query.toLowerCase());
  return `https://www.meesho.com/search?q=${encodedQuery}&searchType=manual&searchIdentifier=text_search`;
};

/**
 * Get platform icon color
 */
export const getPlatformColor = (platform: ShoppingPlatform): string => {
  switch (platform) {
    case 'flipkart':
      return 'bg-blue-600 hover:bg-blue-700';
    case 'amazon':
      return 'bg-orange-500 hover:bg-orange-600';
    case 'meesho':
      return 'bg-pink-600 hover:bg-pink-700';
    default:
      return 'bg-gray-600 hover:bg-gray-700';
  }
};

/**
 * Get platform display name with icon
 */
export const getPlatformDisplayName = (platform: ShoppingPlatform): string => {
  switch (platform) {
    case 'flipkart':
      return '🛒 Flipkart';
    case 'amazon':
      return '📦 Amazon';
    case 'meesho':
      return '🛍️ Meesho';
    default:
      return platform;
  }
};
import cmsData from '@/data/cms-data.json';

export interface RestaurantInfo {
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  streetAddress: string;
  postalCode: string;
  city: string;
  country: string;
  countryCode: string;
  phone: string;
  phoneInternational: string;
  email: string;
  websiteUrl: string;
  logoUrl?: string;
  seatBookingUrl: string;
  seatBookingEngineId: string;
  smileyUrl: string;
  googleMapsUrl: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  indoorCapacity: number;
  outdoorCapacity: number;
  priceRange: string;
  servesCuisine: string[];
  socialLinks: {
    facebook: string;
    instagram: string;
  };
}

export interface ScheduleDay {
  id: string;
  days: string;
  open: string;
  close: string;
  kitchenClose: string;
  daysOfWeek: string[];
}

export interface SpecialHoliday {
  title: string;
  description: string;
}

export interface OpeningHoursData {
  schedule: ScheduleDay[];
  brunchHours: string;
  weekendBookingNotice: string;
  specialHolidays: SpecialHoliday[];
}

export interface MenuCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  h1: string;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  description: string;
  tags?: string[];
  image?: string;
  isAvailable?: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  src: string;
}

export interface PageSeo {
  title: string;
  description: string;
  keywords: string;
}

export interface CmsData {
  restaurant: RestaurantInfo;
  openingHours: OpeningHoursData;
  sections: {
    hero: {
      eyebrow: string;
      title: string;
      subtitle: string;
      ctaPrimaryText: string;
      ctaSecondaryText: string;
      badge: string;
      videoBackground?: {
        enabled: boolean;
        youtubeId: string;
        videoUrl: string;
        startTime: number;
        endTime: number;
        posterImage: string;
      };
    };
    intro: {
      eyebrow: string;
      title: string;
      body: string;
      features: { title: string; desc: string }[];
    };
    brunch: {
      title: string;
      hours: string;
      description: string;
      priceNote: string;
    };
    selskaber: {
      title: string;
      lead: string;
      description: string;
      capacities: { indoor: string; terrace: string };
      perks: string[];
    };
    boardGames: {
      title: string;
      subtitle: string;
      description: string;
      ctaText: string;
    };
    takeaway: {
      title: string;
      description: string;
      orderPhone: string;
      pickupAddress: string;
    };
  };
  menuCategories: MenuCategory[];
  menuItems: MenuItem[];
  gallery: GalleryItem[];
  seo: Record<string, PageSeo>;
}

export function getCmsData(): CmsData {
  return cmsData as unknown as CmsData;
}


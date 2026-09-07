import React from 'react';
import { CmsData } from '@/lib/cms';

interface RestaurantJsonLdProps {
  cms: CmsData;
}

export default function RestaurantJsonLd({ cms }: RestaurantJsonLdProps) {
  const { restaurant, openingHours } = cms;

  const openingHoursSpecification = openingHours.schedule.map((slot) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: slot.daysOfWeek,
    opens: slot.open,
    closes: slot.close,
  }));

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: restaurant.name,
    legalName: restaurant.legalName,
    description: restaurant.description,
    url: restaurant.websiteUrl,
    telephone: restaurant.phoneInternational,
    email: restaurant.email,
    image: 'https://cafeemil.dk/wp-content/uploads/2024/12/332323.jpg',
    logo: 'https://cafeemil.dk/wp-content/uploads/2024/12/cafeemil-logo.png',
    address: {
      '@type': 'PostalAddress',
      streetAddress: restaurant.streetAddress,
      postalCode: restaurant.postalCode,
      addressLocality: restaurant.city,
      addressCountry: restaurant.countryCode,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: restaurant.coordinates.lat,
      longitude: restaurant.coordinates.lng,
    },
    hasMap: restaurant.googleMapsUrl,
    servesCuisine: restaurant.servesCuisine,
    priceRange: restaurant.priceRange,
    acceptsReservations: 'True',
    menu: `${restaurant.websiteUrl}/menu`,
    sameAs: [
      restaurant.socialLinks.facebook,
      restaurant.socialLinks.instagram,
    ].filter(Boolean),
    openingHoursSpecification: openingHoursSpecification,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}


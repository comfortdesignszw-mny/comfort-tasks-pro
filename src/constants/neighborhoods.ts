export interface CustomPlace {
  id: string;
  name: string;
  city?: string;
  createdAt: number;
}

export interface CityGroup {
  city: string;
  suburbs: string[];
}

export const MAJOR_CITIES: string[] = [
  'Harare',
  'Bulawayo',
  'Masvingo',
  'Gweru',
  'Mutare',
  'Chitungwiza',
  'Victoria Falls',
  'Kwekwe',
  'Kadoma',
  'Marondera',
  'Chinhoyi',
  'Zvishavane',
  'Bindura',
  'Hwange',
  'Beitbridge',
  'Kariba',
  'Rusape',
  'Chegutu',
  'Shurugwi',
  'Gwanda',
  'Norton',
  'Ruwa'
];

export const ZIMBABWE_CITIES_DATA: CityGroup[] = [
  {
    city: 'Harare',
    suburbs: [
      'CBD / Central',
      'Avondale',
      'Borrowdale',
      'Eastlea',
      'Belgravia',
      'Mount Pleasant',
      'Highlands',
      'Avenues',
      'Mabelreign',
      'Greendale',
      'Westgate',
      'Braeside',
      'Waterfalls',
      'Hatfield',
      'Kuwadzana',
      'Glen View',
      'Warren Park',
      'Mabvuku',
      'Tafara',
      'Highfield',
      'Southerton',
      'Msasa',
      'Newlands',
      'Vainona',
      'Glen Lorne',
      'Chisipite',
      'Pomona',
      'Marlborough',
      'Sunridge',
      'Sunningdale',
      'Norton',
      'Ruwa'
    ]
  },
  {
    city: 'Bulawayo',
    suburbs: [
      'CBD / Central',
      'Kumalo',
      'Hillside',
      'Suburbs',
      'Bradfield',
      'Matsheumhlope',
      'Burnside',
      'Ascot',
      'Belmont',
      'Cowdray Park',
      'Nkulumane',
      'Luveve',
      'Magwegwe',
      'Pumula',
      'Lobengula',
      'Khumalo',
      'Famona',
      'Newton West',
      'Tshabalala',
      'Emganwini',
      'Morningside',
      'Woodlands'
    ]
  },
  {
    city: 'Mutare',
    suburbs: [
      'CBD / Central',
      'Murambi',
      'Chikanga',
      'Dangamvura',
      'Morningside',
      'Fairbridge Park',
      'Palmerstone',
      'Yeovil',
      'Sakubva',
      'Florida',
      'Greenside'
    ]
  },
  {
    city: 'Gweru',
    suburbs: [
      'CBD / Central',
      'Mkoba',
      'Southdowns',
      'Lundi Park',
      'Nashville',
      'Athlone',
      'Windsor Park',
      'Senga',
      'Daylesford'
    ]
  },
  {
    city: 'Masvingo',
    suburbs: [
      'CBD / Central',
      'Mucheke',
      'Rujeko',
      'Rhodene',
      'Target Kopje',
      'Eastvale'
    ]
  },
  {
    city: 'Chitungwiza',
    suburbs: [
      'Seke',
      "St Mary's",
      'Zengeza',
      'Unit A-O'
    ]
  },
  {
    city: 'Victoria Falls',
    suburbs: [
      'CBD / Central',
      'Chinotimba',
      'Mkhosana',
      'Low Density'
    ]
  },
  {
    city: 'Kwekwe',
    suburbs: [
      'CBD / Central',
      'Mbizo',
      'Redcliff',
      'Amaveni',
      'Chicago'
    ]
  },
  {
    city: 'Kadoma',
    suburbs: [
      'CBD / Central',
      'Rimuka',
      'Eiffel Flats',
      'Cam & Motor'
    ]
  },
  {
    city: 'Marondera',
    suburbs: [
      'CBD / Central',
      'Dombotombo',
      'Nyameni',
      'Cherutombo'
    ]
  },
  {
    city: 'Chinhoyi',
    suburbs: [
      'CBD / Central',
      'Orange Grove',
      'Chikonohono',
      'Brundish'
    ]
  },
  {
    city: 'Zvishavane',
    suburbs: [
      'CBD / Central',
      'Mandava',
      'Makwasha',
      'Highlands'
    ]
  },
  {
    city: 'Bindura',
    suburbs: [
      'CBD / Central',
      'Chiwaridzo',
      'Aerodrome',
      'Chipadze'
    ]
  },
  {
    city: 'Hwange',
    suburbs: [
      'Colliery',
      'Baobab',
      'Empumalanga',
      'Lwendulu'
    ]
  },
  {
    city: 'Beitbridge',
    suburbs: [
      'CBD / Central',
      'Dulibadzimu',
      'Medium Density'
    ]
  },
  {
    city: 'Kariba',
    suburbs: [
      'Heights',
      'Nyamhunga',
      'Mahombekombe'
    ]
  },
  {
    city: 'Rusape',
    suburbs: [
      'CBD / Central',
      'Vengere',
      'Tsanzaguru'
    ]
  }
];

// Flat list for basic select inputs and backward compatibility
export const POPULAR_HOODS: string[] = [
  'All Hoods',
  // Major Cities First
  ...MAJOR_CITIES,
  // Key Harare Suburbs
  'Avondale',
  'Borrowdale',
  'CBD / Central',
  'Belgravia',
  'Eastlea',
  'Mount Pleasant',
  'Highlands',
  'Avenues',
  'Mabelreign',
  'Greendale',
  'Westgate',
  'Braeside',
  'Waterfalls',
  // Bulawayo Suburbs
  'Kumalo',
  'Hillside',
  'Suburbs',
  'Bradfield',
  // Mutare Suburbs
  'Murambi',
  'Chikanga',
  'Dangamvura',
  // Gweru Suburbs
  'Mkoba',
  'Southdowns',
  // Masvingo Suburbs
  'Mucheke',
  'Rhodene',
  // International / Global Fallbacks
  'Downtown',
  'Midtown',
  'Brooklyn',
  'Queens'
];

const CUSTOM_PLACES_KEY = 'comfort_custom_locations_v1';

/**
 * Loads custom places from localStorage
 */
export function getCustomPlaces(): CustomPlace[] {
  try {
    const raw = localStorage.getItem(CUSTOM_PLACES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Saves custom places list to localStorage and emits an event for reactive sync
 */
export function saveCustomPlaces(places: CustomPlace[]): void {
  try {
    localStorage.setItem(CUSTOM_PLACES_KEY, JSON.stringify(places));
    window.dispatchEvent(new CustomEvent('custom-places-updated', { detail: places }));
  } catch (err) {
    console.error('Failed to save custom places:', err);
  }
}

/**
 * Adds a new custom location
 */
export function addCustomPlace(name: string, city?: string): CustomPlace {
  const cleanName = name.trim();
  const places = getCustomPlaces();
  const existing = places.find(p => p.name.toLowerCase() === cleanName.toLowerCase());
  if (existing) {
    return existing;
  }

  const newPlace: CustomPlace = {
    id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    name: cleanName,
    city: city?.trim() || undefined,
    createdAt: Date.now()
  };

  const updated = [newPlace, ...places];
  saveCustomPlaces(updated);
  return newPlace;
}

/**
 * Edits an existing custom location
 */
export function editCustomPlace(id: string, newName: string, newCity?: string): boolean {
  const places = getCustomPlaces();
  const index = places.findIndex(p => p.id === id);
  if (index === -1) return false;

  places[index] = {
    ...places[index],
    name: newName.trim(),
    city: newCity?.trim() || undefined
  };

  saveCustomPlaces(places);
  return true;
}

/**
 * Deletes a custom location
 */
export function deleteCustomPlace(id: string): void {
  const places = getCustomPlaces().filter(p => p.id !== id);
  saveCustomPlaces(places);
}

/**
 * Helper to determine if a service/task location matches the selected location filter.
 * Supports:
 * - Direct matches ("Avondale" === "Avondale")
 * - Major City selection matching all suburbs in that city
 *   (e.g., selecting "Harare" matches services in "Avondale", "Borrowdale", "Harare - Eastlea", etc.)
 * - Suburb selection matching parent city or specific area
 * - Custom place matching
 */
export function isServiceInLocation(
  serviceLocation: string | undefined | null,
  selectedLocation: string | undefined | null
): boolean {
  if (!selectedLocation || selectedLocation === 'All Hoods' || selectedLocation === 'All Locations') {
    return true;
  }
  if (!serviceLocation) {
    return false;
  }

  const sLoc = serviceLocation.toLowerCase().trim();
  const selLoc = selectedLocation.toLowerCase().trim();

  // 1. Exact or partial substring match
  if (sLoc === selLoc || sLoc.includes(selLoc) || selLoc.includes(sLoc)) {
    return true;
  }

  // 2. Check if selectedLocation is a Major City (e.g. "Harare", "Bulawayo", "Mutare", etc.)
  const cityGroup = ZIMBABWE_CITIES_DATA.find(
    (g) => g.city.toLowerCase() === selLoc
  );

  if (cityGroup) {
    // If service location mentions the city directly (e.g., "Harare", "Harare, Zimbabwe")
    if (sLoc.includes(cityGroup.city.toLowerCase())) {
      return true;
    }
    // If service location is one of the suburbs of this city
    const matchesSuburb = cityGroup.suburbs.some((suburb) => {
      const subLower = suburb.toLowerCase();
      return sLoc.includes(subLower) || subLower.includes(sLoc);
    });
    if (matchesSuburb) {
      return true;
    }
  }

  // 3. Check if serviceLocation belongs to a city matching selectedLocation
  for (const group of ZIMBABWE_CITIES_DATA) {
    const isSuburbInGroup = group.suburbs.some((suburb) => {
      const subLower = suburb.toLowerCase();
      return selLoc.includes(subLower) || subLower.includes(selLoc);
    });
    if (isSuburbInGroup && sLoc.includes(group.city.toLowerCase())) {
      return true;
    }
  }

  // 4. Check custom places
  const customPlaces = getCustomPlaces();
  const customMatch = customPlaces.find(
    (p) => p.name.toLowerCase() === selLoc || p.name.toLowerCase() === sLoc
  );
  if (customMatch) {
    if (customMatch.city && (sLoc.includes(customMatch.city.toLowerCase()) || selLoc.includes(customMatch.city.toLowerCase()))) {
      return true;
    }
  }

  return false;
}

export const formatWhatsAppLink = (rawPhone: string, message: string): string => {
  // Clean phone number: keep only digits
  let cleaned = rawPhone.replace(/\D/g, '');
  
  // If starts with 0 (e.g. 077... or 071...), convert to international if possible or default to standard
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    // default to Zimbabwe code +263 or generic if 10 digits starting with 0
    cleaned = '263' + cleaned.substring(1);
  }
  
  // If still empty or very short, use placeholder
  if (!cleaned || cleaned.length < 5) {
    cleaned = '1234567890';
  }
  
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleaned}?text=${encoded}`;
};

import type { Category } from '../types';

// Cache pour stocker les données des API
const apiCache: {
  countries?: string[];
  cities?: string[];
  animals?: string[];
  jobs?: string[];
  fruits?: string[];
  celebrities?: string[];
  brands?: string[];
  sports?: string[];
} = {};

// Fonction pour normaliser les chaînes de caractères (retirer les accents, mettre en minuscule)
const normalizeString = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

// Fonction pour vérifier si une réponse commence par une lettre donnée
const startsWithLetter = (answer: string, letter: string): boolean => {
  const normalizedAnswer = normalizeString(answer);
  const normalizedLetter = normalizeString(letter);
  return normalizedAnswer.startsWith(normalizedLetter);
};

// Fonction pour récupérer les pays depuis l'API REST Countries
const fetchCountries = async (): Promise<string[]> => {
  if (apiCache.countries) {
    return apiCache.countries;
  }

  try {
    const response = await fetch('https://restcountries.com/v3.1/all');
    const data = await response.json();
    const countries = data.map((country: any) => {
      const names = [
        country.name.common,
        country.name.official,
        ...(country.altSpellings || []),
        ...(country.translations?.fra?.common ? [country.translations.fra.common] : []),
        ...(country.translations?.fra?.official ? [country.translations.fra.official] : [])
      ];
      return names.map(normalizeString);
    }).flat();
    
    apiCache.countries = [...new Set(countries)];
    return apiCache.countries;
  } catch (error) {
    console.error('Erreur lors de la récupération des pays:', error);
    return [];
  }
};

// Fonction pour récupérer les villes depuis l'API OpenDataSoft
const fetchCities = async (): Promise<string[]> => {
  if (apiCache.cities) {
    return apiCache.cities;
  }

  try {
    const response = await fetch('https://public.opendatasoft.com/api/records/1.0/search/?dataset=geonames-all-cities-with-a-population-1000&q=&rows=10000');
    const data = await response.json();
    const cities = data.records.map((record: any) => normalizeString(record.fields.name));
    
    apiCache.cities = [...new Set(cities)];
    return apiCache.cities;
  } catch (error) {
    console.error('Erreur lors de la récupération des villes:', error);
    return [];
  }
};

// Fonction pour récupérer les fruits depuis l'API Fruityvice
const fetchFruits = async (): Promise<string[]> => {
  if (apiCache.fruits) {
    return apiCache.fruits;
  }

  try {
    const response = await fetch('https://www.fruityvice.com/api/fruit/all');
    const data = await response.json();
    const fruits = data.map((fruit: any) => normalizeString(fruit.name));
    
    // Ajouter des fruits et légumes supplémentaires
    const additionalFruits = [
      'abricot', 'ananas', 'avocat', 'banane', 'cerise', 'citron', 'datte',
      'fraise', 'framboise', 'grenade', 'kiwi', 'mandarine', 'mangue',
      'melon', 'orange', 'pamplemousse', 'papaye', 'peche', 'poire',
      'pomme', 'prune', 'raisin',
      // Légumes
      'artichaut', 'asperge', 'aubergine', 'betterave', 'brocoli', 'carotte',
      'celeri', 'champignon', 'chou', 'concombre', 'courgette', 'epinard',
      'haricot', 'laitue', 'navet', 'oignon', 'poireau', 'poivron',
      'pomme de terre', 'radis', 'salade', 'tomate'
    ].map(normalizeString);
    
    apiCache.fruits = [...new Set([...fruits, ...additionalFruits])];
    return apiCache.fruits;
  } catch (error) {
    console.error('Erreur lors de la récupération des fruits:', error);
    return [];
  }
};

// Base de données étendue pour les sports
const localSports = [
  // Sports collectifs
  'football', 'basketball', 'volleyball', 'handball', 'rugby',
  'hockey', 'baseball', 'cricket', 'water-polo',
  // Sports individuels
  'tennis', 'badminton', 'golf', 'athletisme', 'natation',
  'gymnastique', 'judo', 'karate', 'boxe', 'escrime',
  'cyclisme', 'ski', 'patinage', 'surf', 'plongee',
  // Sports mécaniques
  'formule 1', 'rallye', 'motocross',
  // Sports extrêmes
  'skateboard', 'escalade', 'parachutisme', 'rafting',
  // Sports de raquette
  'squash', 'tennis de table', 'padel',
  // Sports d'hiver
  'snowboard', 'biathlon', 'curling', 'luge'
];

// Base de données étendue pour les métiers
const localJobs = [
  // Santé
  'medecin', 'chirurgien', 'infirmier', 'dentiste', 'pharmacien',
  'kinesitherapeute', 'psychologue', 'veterinaire', 'orthophoniste',
  // Éducation
  'professeur', 'instituteur', 'educateur', 'formateur',
  // Tech
  'developpeur', 'ingenieur', 'architecte', 'designer', 'analyste',
  'programmeur', 'consultant',
  // Commerce
  'vendeur', 'commercial', 'manager', 'directeur', 'comptable',
  'banquier', 'assureur',
  // Artisanat
  'boulanger', 'patissier', 'boucher', 'coiffeur', 'menuisier',
  'plombier', 'electricien', 'mecanicien', 'peintre', 'maçon',
  // Services
  'avocat', 'notaire', 'policier', 'pompier', 'facteur',
  'journaliste', 'photographe', 'cuisinier', 'serveur',
  // Art et culture
  'artiste', 'musicien', 'acteur', 'danseur', 'ecrivain',
  'realisateur', 'producteur',
  // Agriculture
  'agriculteur', 'jardinier', 'viticulteur', 'eleveur', 'apiculteur'
];

// Base de données étendue pour les marques
const localBrands = [
  // Tech
  'apple', 'samsung', 'microsoft', 'google', 'amazon', 'intel',
  'nvidia', 'sony', 'philips', 'lenovo', 'dell', 'hp',
  // Mode
  'nike', 'adidas', 'puma', 'reebok', 'lacoste', 'zara',
  'levis', 'gucci', 'chanel', 'dior', 'hermes', 'vuitton',
  // Automobile
  'renault', 'peugeot', 'citroen', 'volkswagen', 'bmw',
  'mercedes', 'audi', 'toyota', 'honda', 'ford', 'ferrari',
  // Alimentation
  'coca-cola', 'pepsi', 'nestle', 'danone', 'ferrero',
  'kelloggs', 'heinz', 'nutella', 'evian', 'perrier',
  // Divertissement
  'netflix', 'disney', 'nintendo', 'playstation', 'xbox',
  // Autres
  'ikea', 'lego', 'michelin', 'bic', 'loreal', 'gillette'
];

// Base de données pour les animaux
const localAnimals = [
  // Mammifères
  'antilope', 'baleine', 'chat', 'chien', 'dauphin', 'elephant',
  'girafe', 'gorille', 'hippopotame', 'jaguar', 'kangourou', 'lion',
  'loup', 'ours', 'panthere', 'rhinoceros', 'singe', 'tigre', 'zebre',
  // Oiseaux
  'aigle', 'autruche', 'canard', 'colombe', 'faucon', 'hibou',
  'merle', 'moineau', 'perroquet', 'pigeon', 'pingouin',
  // Reptiles
  'anaconda', 'boa', 'caiman', 'cobra', 'crocodile', 'iguane',
  'lezard', 'python', 'tortue', 'vipere',
  // Poissons
  'anchois', 'bar', 'carpe', 'dorade', 'espadon', 'hareng',
  'maquereau', 'requin', 'saumon', 'thon', 'truite',
  // Insectes
  'abeille', 'araignee', 'coccinelle', 'fourmi', 'guepe',
  'libellule', 'papillon', 'scarabee'
];

// Base de données pour les célébrités
const localCelebrities = [
  // Acteurs/Actrices
  'brad pitt', 'leonardo dicaprio', 'tom cruise', 'angelina jolie',
  'julia roberts', 'marion cotillard', 'jean dujardin', 'omar sy',
  // Chanteurs/Chanteuses
  'madonna', 'michael jackson', 'lady gaga', 'beyonce',
  'johnny hallyday', 'edith piaf', 'jacques brel',
  // Sportifs
  'zinedine zidane', 'kylian mbappe', 'roger federer',
  'usain bolt', 'michael jordan', 'cristiano ronaldo',
  // Politiques
  'emmanuel macron', 'barack obama', 'angela merkel',
  // Scientifiques
  'albert einstein', 'marie curie', 'louis pasteur',
  // Artistes
  'pablo picasso', 'vincent van gogh', 'claude monet',
  // Écrivains
  'victor hugo', 'emile zola', 'albert camus'
].map(normalizeString);

// Fonction principale de validation des réponses
export const validateAnswer = async (
  category: Category,
  answer: string,
  letter: string
): Promise<{ isValid: boolean; reason?: string }> => {
  if (!answer.trim()) {
    return { isValid: false, reason: 'Réponse vide' };
  }

  if (!startsWithLetter(answer, letter)) {
    return { isValid: false, reason: `La réponse doit commencer par la lettre ${letter}` };
  }

  const normalizedAnswer = normalizeString(answer);

  switch (category.name) {
    case 'pays':
      const countries = await fetchCountries();
      return {
        isValid: countries.some(country => country === normalizedAnswer),
        reason: countries.length > 0 ? undefined : 'Service de validation indisponible'
      };

    case 'ville':
      const cities = await fetchCities();
      return {
        isValid: cities.some(city => city === normalizedAnswer),
        reason: cities.length > 0 ? undefined : 'Service de validation indisponible'
      };

    case 'animal':
      return {
        isValid: localAnimals.some(animal => normalizeString(animal) === normalizedAnswer)
      };

    case 'fruit':
      const fruits = await fetchFruits();
      return {
        isValid: fruits.some(fruit => fruit === normalizedAnswer),
        reason: fruits.length > 0 ? undefined : 'Service de validation indisponible'
      };

    case 'sport':
      return {
        isValid: localSports.some(sport => normalizeString(sport) === normalizedAnswer)
      };

    case 'metier':
      return {
        isValid: localJobs.some(job => normalizeString(job) === normalizedAnswer)
      };

    case 'marque':
      return {
        isValid: localBrands.some(brand => normalizeString(brand) === normalizedAnswer)
      };

    case 'celebrite':
      return {
        isValid: localCelebrities.some(celebrity => celebrity === normalizedAnswer)
      };

    // Pour les autres catégories (comme "objet"), on vérifie juste si la réponse commence par la bonne lettre
    default:
      return { isValid: true };
  }
};
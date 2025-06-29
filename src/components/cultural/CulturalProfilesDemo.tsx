import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, Users, Calendar, Utensils, Activity, 
  Building, Heart, Globe, Star, Camera, Music,
  Mountain, Waves, TreePine, Sun, Coffee, Gift
} from 'lucide-react';
import Button from '../ui/Button';
import OptimizedImage from '../ui/OptimizedImage';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface CulturalProfile {
  id: string;
  name: string;
  avatar: string;
  location: {
    city: string;
    state: string;
    country: string;
    population: string;
    demographics: string[];
  };
  landmarks: Array<{
    name: string;
    significance: string;
    image?: string;
  }>;
  events: Array<{
    name: string;
    description: string;
    season: string;
  }>;
  cuisine: Array<{
    dish: string;
    description: string;
    specialty: boolean;
  }>;
  activities: string[];
  economy: Array<{
    industry: string;
    description: string;
  }>;
  traditions: Array<{
    name: string;
    description: string;
  }>;
}

const CulturalProfilesDemo: React.FC = () => {
  const { elementRef, isIntersecting } = useIntersectionObserver();
  const [selectedMatch, setSelectedMatch] = useState(0);

  const culturalMatches = [
    {
      american: {
        id: 'john_seattle',
        name: 'John Martinez',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
        location: {
          city: 'Seattle',
          state: 'Washington',
          country: 'United States',
          population: '753,675 (Metro: 4.02M)',
          demographics: [
            '66.3% White',
            '16.9% Asian',
            '7.9% Black/African American',
            '6.6% Hispanic/Latino',
            '0.8% Native American'
          ]
        },
        landmarks: [
          {
            name: 'Space Needle',
            significance: 'Iconic 605-foot tower built for 1962 World\'s Fair, symbol of Seattle\'s innovation and forward-thinking spirit'
          },
          {
            name: 'Pike Place Market',
            significance: 'Historic public market since 1907, birthplace of Starbucks and center of local food culture'
          },
          {
            name: 'Museum of Flight',
            significance: 'World\'s largest private air and space museum, showcasing Seattle\'s aerospace heritage with Boeing'
          }
        ],
        events: [
          {
            name: 'Seattle International Film Festival',
            description: 'Largest film festival in the US, celebrating global cinema and local filmmakers',
            season: 'May-June'
          },
          {
            name: 'Seafair',
            description: 'Summer festival featuring hydroplane races, Blue Angels airshow, and community celebrations',
            season: 'July-August'
          },
          {
            name: 'Bumbershoot',
            description: 'Music and arts festival in Seattle Center featuring diverse performers and local artists',
            season: 'September'
          }
        ],
        cuisine: [
          {
            dish: 'Pacific Northwest Salmon',
            description: 'Fresh wild-caught salmon prepared with local herbs and cedar plank grilling',
            specialty: true
          },
          {
            dish: 'Dungeness Crab',
            description: 'Sweet, delicate crab from Pacific waters, often served with garlic butter',
            specialty: true
          },
          {
            dish: 'Coffee Culture',
            description: 'Artisanal coffee roasting and café culture, birthplace of modern coffee movement',
            specialty: true
          },
          {
            dish: 'Teriyaki',
            description: 'Seattle-style teriyaki with local twist, popular lunch option',
            specialty: false
          }
        ],
        activities: [
          'Hiking in the Cascade Mountains',
          'Kayaking in Puget Sound',
          'Visiting local breweries and coffee shops',
          'Attending live music venues',
          'Exploring farmers markets',
          'Skiing at nearby resorts',
          'Ferry rides to islands',
          'Tech meetups and innovation events'
        ],
        economy: [
          {
            industry: 'Technology',
            description: 'Home to Amazon, Microsoft, and numerous tech startups driving innovation'
          },
          {
            industry: 'Aerospace',
            description: 'Boeing headquarters and major aerospace manufacturing hub'
          },
          {
            industry: 'Maritime Trade',
            description: 'Major Pacific port connecting to Asia and global markets'
          },
          {
            industry: 'Coffee & Food',
            description: 'Starbucks birthplace and thriving culinary scene'
          }
        ],
        traditions: [
          {
            name: 'Coffee Shop Culture',
            description: 'Daily ritual of meeting friends at local coffee shops, discussing everything from tech to arts'
          },
          {
            name: 'Outdoor Recreation',
            description: 'Weekend adventures in nature, from mountain hiking to water sports, regardless of weather'
          },
          {
            name: 'Music Scene Support',
            description: 'Strong tradition of supporting local musicians and attending intimate venue concerts'
          }
        ]
      },
      filipino: {
        id: 'maria_cebu',
        name: 'Maria Santos',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
        location: {
          city: 'Cebu City',
          state: 'Cebu Province',
          country: 'Philippines',
          population: '964,169 (Metro: 2.85M)',
          demographics: [
            '98.9% Filipino',
            '0.8% Chinese Filipino',
            '0.2% Other Asian',
            '0.1% Other ethnicities',
            'Languages: Cebuano, Filipino, English'
          ]
        },
        landmarks: [
          {
            name: 'Magellan\'s Cross',
            significance: 'Historic cross planted by Ferdinand Magellan in 1521, marking the arrival of Christianity in the Philippines'
          },
          {
            name: 'Basilica del Santo Niño',
            significance: 'Oldest Roman Catholic church in the Philippines, housing the revered Santo Niño de Cebu statue'
          },
          {
            name: 'Fort San Pedro',
            significance: 'Triangular military defense structure built by Spanish conquistadors, smallest fort in the Philippines'
          }
        ],
        events: [
          {
            name: 'Sinulog Festival',
            description: 'Grand festival honoring Santo Niño with colorful street dancing, parades, and cultural performances',
            season: 'January'
          },
          {
            name: 'Kadaugan sa Mactan',
            description: 'Reenactment of the Battle of Mactan celebrating Lapu-Lapu\'s victory over Magellan',
            season: 'April'
          },
          {
            name: 'Gabii sa Kabilin',
            description: 'Night of Heritage - museums and cultural sites open late with special programs',
            season: 'May'
          }
        ],
        cuisine: [
          {
            dish: 'Lechon Cebu',
            description: 'World-famous roasted pig with crispy skin and tender meat, seasoned with local herbs',
            specialty: true
          },
          {
            dish: 'Sutukil',
            description: 'Fresh seafood prepared three ways: sugba (grilled), tula (soup), kilaw (ceviche)',
            specialty: true
          },
          {
            dish: 'Puso (Hanging Rice)',
            description: 'Rice cooked in woven coconut leaves, traditional accompaniment to grilled foods',
            specialty: true
          },
          {
            dish: 'Torta',
            description: 'Cebuano-style meatloaf with ground pork and vegetables',
            specialty: false
          }
        ],
        activities: [
          'Island hopping to nearby beaches',
          'Visiting historical churches and sites',
          'Shopping at local markets and malls',
          'Attending family gatherings and celebrations',
          'Participating in community fiestas',
          'Learning traditional dances',
          'Exploring mountain trails and waterfalls',
          'Enjoying karaoke with friends and family'
        ],
        economy: [
          {
            industry: 'Business Process Outsourcing',
            description: 'Major call center and IT services hub serving international clients'
          },
          {
            industry: 'Tourism',
            description: 'Gateway to beautiful islands, beaches, and cultural attractions'
          },
          {
            industry: 'Manufacturing',
            description: 'Furniture, fashion accessories, and food processing industries'
          },
          {
            industry: 'Shipping & Logistics',
            description: 'Major port city connecting Visayas and Mindanao regions'
          }
        ],
        traditions: [
          {
            name: 'Bayanihan Spirit',
            description: 'Community cooperation and helping neighbors, especially during celebrations and challenges'
          },
          {
            name: 'Respect for Elders',
            description: 'Pagmano (blessing gesture) and using "po" and "opo" when speaking to elders'
          },
          {
            name: 'Fiesta Celebrations',
            description: 'Annual barangay fiestas with street dancing, food sharing, and community bonding'
          }
        ]
      }
    },
    {
      american: {
        id: 'david_austin',
        name: 'David Chen',
        avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg',
        location: {
          city: 'Austin',
          state: 'Texas',
          country: 'United States',
          population: '978,908 (Metro: 2.35M)',
          demographics: [
            '48.3% White',
            '33.9% Hispanic/Latino',
            '7.8% Asian',
            '7.6% Black/African American',
            '0.9% Native American'
          ]
        },
        landmarks: [
          {
            name: 'State Capitol Building',
            significance: 'Taller than US Capitol, symbol of Texas pride and political heritage since 1888'
          },
          {
            name: 'South by Southwest (SXSW) Venues',
            significance: 'Multiple venues hosting world\'s premier music, film, and interactive festival'
          },
          {
            name: 'Zilker Park',
            significance: '350-acre park hosting Austin City Limits and serving as the city\'s recreational heart'
          }
        ],
        events: [
          {
            name: 'South by Southwest (SXSW)',
            description: 'Massive music, film, and tech festival bringing global artists and innovators to Austin',
            season: 'March'
          },
          {
            name: 'Austin City Limits Music Festival',
            description: 'Two-weekend music festival in Zilker Park featuring diverse genres and local food',
            season: 'October'
          },
          {
            name: 'Eeyore\'s Birthday Party',
            description: 'Annual spring celebration in Pease Park with live music, food, and community spirit',
            season: 'April'
          }
        ],
        cuisine: [
          {
            dish: 'BBQ Brisket',
            description: 'Slow-smoked beef brisket with dry rub, served with pickles and white bread',
            specialty: true
          },
          {
            dish: 'Breakfast Tacos',
            description: 'Austin staple with eggs, cheese, and various fillings on fresh tortillas',
            specialty: true
          },
          {
            dish: 'Food Truck Cuisine',
            description: 'Diverse mobile food scene from Korean BBQ to gourmet donuts',
            specialty: true
          },
          {
            dish: 'Queso',
            description: 'Melted cheese dip served with tortilla chips, Austin obsession',
            specialty: false
          }
        ],
        activities: [
          'Live music venue hopping',
          'Food truck exploration',
          'Kayaking on Lady Bird Lake',
          'Hiking and biking trails',
          'Attending tech meetups',
          'Swimming at Barton Springs Pool',
          'Exploring local breweries',
          'Participating in community festivals'
        ],
        economy: [
          {
            industry: 'Technology',
            description: 'Major tech hub with companies like Dell, IBM, and numerous startups'
          },
          {
            industry: 'Music & Entertainment',
            description: 'Live music capital with thriving entertainment industry'
          },
          {
            industry: 'Education',
            description: 'University of Texas at Austin driving research and innovation'
          },
          {
            industry: 'Government',
            description: 'Texas state government and related services'
          }
        ],
        traditions: [
          {
            name: 'Keep Austin Weird',
            description: 'Celebrating local businesses, artists, and unique culture over chain stores'
          },
          {
            name: 'Live Music Every Night',
            description: 'Supporting local musicians and attending shows at venues from dive bars to amphitheaters'
          },
          {
            name: 'Outdoor Living',
            description: 'Year-round outdoor activities and festivals taking advantage of mild climate'
          }
        ]
      },
      filipino: {
        id: 'ana_manila',
        name: 'Ana Rodriguez',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
        location: {
          city: 'Manila',
          state: 'Metro Manila',
          country: 'Philippines',
          population: '1.78M (Metro: 13.48M)',
          demographics: [
            '99.1% Filipino',
            '0.6% Chinese Filipino',
            '0.2% Other Asian',
            '0.1% Other ethnicities',
            'Languages: Filipino, English, various regional languages'
          ]
        },
        landmarks: [
          {
            name: 'Intramuros',
            significance: 'Historic walled city from Spanish colonial period, showcasing 400+ years of Philippine history'
          },
          {
            name: 'Rizal Park',
            significance: 'National park honoring Dr. José Rizal, site of his execution and symbol of Philippine independence'
          },
          {
            name: 'Manila Cathedral',
            significance: 'Premier cathedral of the Philippines, rebuilt multiple times, center of Catholic faith'
          }
        ],
        events: [
          {
            name: 'Feast of the Black Nazarene',
            description: 'Massive religious procession with millions of devotees seeking blessings and miracles',
            season: 'January'
          },
          {
            name: 'Manila Film Festival',
            description: 'Celebration of Filipino cinema showcasing local and international films',
            season: 'December'
          },
          {
            name: 'Flores de Mayo',
            description: 'Month-long celebration honoring the Virgin Mary with parades and cultural presentations',
            season: 'May'
          }
        ],
        cuisine: [
          {
            dish: 'Adobo',
            description: 'National dish of pork or chicken braised in vinegar, soy sauce, and spices',
            specialty: true
          },
          {
            dish: 'Halo-halo',
            description: 'Shaved ice dessert with mixed beans, fruits, ube, and leche flan',
            specialty: true
          },
          {
            dish: 'Sisig',
            description: 'Sizzling dish of chopped pig\'s head and liver, seasoned with calamansi and chili',
            specialty: true
          },
          {
            dish: 'Lumpia',
            description: 'Filipino spring rolls with various fillings, served fresh or fried',
            specialty: false
          }
        ],
        activities: [
          'Exploring historical sites and museums',
          'Shopping in bustling markets and malls',
          'Attending family reunions and celebrations',
          'Participating in religious processions',
          'Enjoying street food tours',
          'Visiting art galleries and cultural centers',
          'Taking weekend trips to nearby provinces',
          'Singing karaoke with friends and family'
        ],
        economy: [
          {
            industry: 'Financial Services',
            description: 'Banking and financial center of the Philippines with major institutions'
          },
          {
            industry: 'Business Process Outsourcing',
            description: 'Major hub for call centers, IT services, and back-office operations'
          },
          {
            industry: 'Government',
            description: 'National capital with government offices and diplomatic missions'
          },
          {
            industry: 'Trade & Commerce',
            description: 'Major port and commercial center for domestic and international trade'
          }
        ],
        traditions: [
          {
            name: 'Mano Po Tradition',
            description: 'Showing respect to elders by taking their hand and placing it on your forehead'
          },
          {
            name: 'Kapamilya Culture',
            description: 'Extended family gatherings for special occasions, treating close friends as family'
          },
          {
            name: 'Pasalip Tradition',
            description: 'Bringing gifts or food when visiting someone\'s home as a sign of respect'
          }
        ]
      }
    }
  ];

  const currentMatch = culturalMatches[selectedMatch];

  const renderCulturalSection = (profile: CulturalProfile, isAmerican: boolean) => (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${isAmerican ? 'border-l-4 border-blue-500' : 'border-l-4 border-red-500'}`}>
      {/* Profile Header */}
      <div className="flex items-center space-x-4 mb-6">
        <OptimizedImage
          src={profile.avatar}
          alt={profile.name}
          className="w-16 h-16 rounded-full"
          width={64}
          height={64}
        />
        <div>
          <h3 className="text-xl font-bold text-gray-900">{profile.name}</h3>
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{profile.location.city}, {profile.location.state}</span>
          </div>
          <div className="text-sm text-gray-500">{profile.location.country}</div>
        </div>
      </div>

      {/* Location Demographics */}
      <div className="mb-6">
        <div className="flex items-center mb-3">
          <Users className="w-5 h-5 text-blue-600 mr-2" />
          <h4 className="font-semibold text-gray-900">Population & Demographics</h4>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="font-medium text-gray-900 mb-2">Population: {profile.location.population}</p>
          <div className="space-y-1">
            {profile.location.demographics.map((demo, index) => (
              <div key={index} className="text-sm text-gray-600">• {demo}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Historical Landmarks */}
      <div className="mb-6">
        <div className="flex items-center mb-3">
          <Mountain className="w-5 h-5 text-purple-600 mr-2" />
          <h4 className="font-semibold text-gray-900">Historical Landmarks</h4>
        </div>
        <div className="space-y-3">
          {profile.landmarks.map((landmark, index) => (
            <div key={index} className="bg-purple-50 p-3 rounded-lg">
              <h5 className="font-medium text-purple-900 mb-1">{landmark.name}</h5>
              <p className="text-sm text-purple-700">{landmark.significance}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cultural Events */}
      <div className="mb-6">
        <div className="flex items-center mb-3">
          <Calendar className="w-5 h-5 text-green-600 mr-2" />
          <h4 className="font-semibold text-gray-900">Cultural Events & Festivals</h4>
        </div>
        <div className="space-y-3">
          {profile.events.map((event, index) => (
            <div key={index} className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <h5 className="font-medium text-green-900">{event.name}</h5>
                <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                  {event.season}
                </span>
              </div>
              <p className="text-sm text-green-700">{event.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Regional Cuisine */}
      <div className="mb-6">
        <div className="flex items-center mb-3">
          <Utensils className="w-5 h-5 text-orange-600 mr-2" />
          <h4 className="font-semibold text-gray-900">Regional Cuisine</h4>
        </div>
        <div className="space-y-2">
          {profile.cuisine.map((dish, index) => (
            <div key={index} className={`p-3 rounded-lg ${dish.specialty ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-1">
                <h5 className={`font-medium ${dish.specialty ? 'text-orange-900' : 'text-gray-900'}`}>
                  {dish.dish}
                </h5>
                {dish.specialty && (
                  <Star className="w-4 h-4 text-orange-500 fill-current" />
                )}
              </div>
              <p className={`text-sm ${dish.specialty ? 'text-orange-700' : 'text-gray-600'}`}>
                {dish.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Activities */}
      <div className="mb-6">
        <div className="flex items-center mb-3">
          <Activity className="w-5 h-5 text-pink-600 mr-2" />
          <h4 className="font-semibold text-gray-900">Common Activities & Pastimes</h4>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {profile.activities.map((activity, index) => (
            <div key={index} className="flex items-center bg-pink-50 p-2 rounded-lg">
              <Heart className="w-3 h-3 text-pink-500 mr-2 flex-shrink-0" />
              <span className="text-sm text-pink-700">{activity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Economic Highlights */}
      <div className="mb-6">
        <div className="flex items-center mb-3">
          <Building className="w-5 h-5 text-indigo-600 mr-2" />
          <h4 className="font-semibold text-gray-900">Major Industries & Economy</h4>
        </div>
        <div className="space-y-3">
          {profile.economy.map((industry, index) => (
            <div key={index} className="bg-indigo-50 p-3 rounded-lg">
              <h5 className="font-medium text-indigo-900 mb-1">{industry.industry}</h5>
              <p className="text-sm text-indigo-700">{industry.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Local Traditions */}
      <div>
        <div className="flex items-center mb-3">
          <Gift className="w-5 h-5 text-yellow-600 mr-2" />
          <h4 className="font-semibold text-gray-900">Notable Local Traditions</h4>
        </div>
        <div className="space-y-3">
          {profile.traditions.map((tradition, index) => (
            <div key={index} className="bg-yellow-50 p-3 rounded-lg">
              <h5 className="font-medium text-yellow-900 mb-1">{tradition.name}</h5>
              <p className="text-sm text-yellow-700">{tradition.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <section ref={elementRef} className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex p-3 bg-blue-100 rounded-full mb-6">
            <Globe className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Cultural Conversation Profiles
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Discover each other's local culture, traditions, and community life. 
            Learn about your partner's hometown to spark meaningful conversations and deeper connections.
          </p>
        </motion.div>

        {/* Match Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <div className="bg-white p-2 rounded-lg shadow-lg">
            {culturalMatches.map((match, index) => (
              <button
                key={index}
                onClick={() => setSelectedMatch(index)}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  selectedMatch === index
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {match.american.name} & {match.filipino.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Cultural Profiles Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
        >
          {/* American Partner Profile */}
          <div>
            <div className="flex items-center mb-6">
              <div className="w-8 h-5 bg-blue-600 rounded mr-3"></div>
              <h3 className="text-2xl font-bold text-gray-900">American Partner</h3>
            </div>
            {renderCulturalSection(currentMatch.american, true)}
          </div>

          {/* Filipino Partner Profile */}
          <div>
            <div className="flex items-center mb-6">
              <div className="w-8 h-5 bg-red-600 rounded mr-3"></div>
              <h3 className="text-2xl font-bold text-gray-900">Filipino Partner</h3>
            </div>
            {renderCulturalSection(currentMatch.filipino, false)}
          </div>
        </motion.div>

        {/* Conversation Starters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-green-100 rounded-full mb-4">
              <Coffee className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Conversation Starters Based on Your Profiles
            </h3>
            <p className="text-gray-600">
              Use these cultural insights to start meaningful conversations about your communities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Utensils,
                title: 'Food & Cuisine',
                questions: [
                  'What\'s your favorite local dish to cook for someone special?',
                  'Which festival food would you most want me to try?',
                  'How do food traditions bring your family together?'
                ]
              },
              {
                icon: Calendar,
                title: 'Festivals & Celebrations',
                questions: [
                  'What\'s the most exciting festival in your area?',
                  'How does your community celebrate special occasions?',
                  'Which local event would you love to experience together?'
                ]
              },
              {
                icon: Mountain,
                title: 'Places & Landmarks',
                questions: [
                  'What local spot holds the most meaning for you?',
                  'Where would you take me on my first visit?',
                  'What\'s the story behind your favorite landmark?'
                ]
              },
              {
                icon: Heart,
                title: 'Traditions & Values',
                questions: [
                  'What family tradition means the most to you?',
                  'How do you show respect in your culture?',
                  'What values from your community do you cherish?'
                ]
              },
              {
                icon: Activity,
                title: 'Daily Life & Activities',
                questions: [
                  'What does a typical weekend look like for you?',
                  'What activities bring your community together?',
                  'How do you like to spend time with friends and family?'
                ]
              },
              {
                icon: Music,
                title: 'Arts & Entertainment',
                questions: [
                  'What music or arts scene is your area known for?',
                  'What cultural performances would you recommend?',
                  'How does creativity express itself in your community?'
                ]
              }
            ].map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <category.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">{category.title}</h4>
                </div>
                <div className="space-y-2">
                  {category.questions.map((question, qIndex) => (
                    <div key={qIndex} className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100">
                      "{question}"
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="text-center mt-12"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Start Your Cultural Journey Together
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Use these cultural insights to build deeper connections and understanding. 
              Every conversation is an opportunity to learn and grow together.
            </p>
            <Button
              variant="outline"
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <Heart className="w-5 h-5 mr-2" />
              Explore More Matches
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CulturalProfilesDemo;
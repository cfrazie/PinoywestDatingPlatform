import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, Globe, MapPin, Star, 
  Building, Heart, Gift, Sun, Moon, AlertCircle
} from 'lucide-react';
import Button from '../ui/Button';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface Holiday {
  id: string;
  name: string;
  date: string;
  culture: 'american' | 'filipino';
  duration: string;
  businessClosure: 'full' | 'partial' | 'none';
  description: string;
  significance: string;
  localTime?: string;
  partnerTime?: string;
}

interface TimeZone {
  name: string;
  abbreviation: string;
  offset: number;
  dstStart?: string;
  dstEnd?: string;
  dstOffset?: number;
}

const CulturalCalendar: React.FC = () => {
  const { elementRef, isIntersecting } = useIntersectionObserver();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [americanLocation, setAmericanLocation] = useState('Seattle, WA');
  const [filipinoLocation, setFilipinoLocation] = useState('Manila, Philippines');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Time zone configurations
  const timeZones: Record<string, TimeZone> = {
    'Seattle, WA': {
      name: 'Pacific Standard Time',
      abbreviation: 'PST/PDT',
      offset: -8,
      dstStart: '2024-03-10',
      dstEnd: '2024-11-03',
      dstOffset: -7
    },
    'New York, NY': {
      name: 'Eastern Standard Time',
      abbreviation: 'EST/EDT',
      offset: -5,
      dstStart: '2024-03-10',
      dstEnd: '2024-11-03',
      dstOffset: -4
    },
    'Austin, TX': {
      name: 'Central Standard Time',
      abbreviation: 'CST/CDT',
      offset: -6,
      dstStart: '2024-03-10',
      dstEnd: '2024-11-03',
      dstOffset: -5
    },
    'Manila, Philippines': {
      name: 'Philippine Standard Time',
      abbreviation: 'PST',
      offset: 8
    },
    'Cebu City, Philippines': {
      name: 'Philippine Standard Time',
      abbreviation: 'PST',
      offset: 8
    }
  };

  // Holiday data for 2024
  const holidays: Holiday[] = [
    // January
    {
      id: 'new-year-us',
      name: 'New Year\'s Day',
      date: '2024-01-01',
      culture: 'american',
      duration: '1 day',
      businessClosure: 'full',
      description: 'Federal holiday celebrating the beginning of the new year',
      significance: 'Time for resolutions, fresh starts, and family gatherings'
    },
    {
      id: 'new-year-ph',
      name: 'New Year\'s Day',
      date: '2024-01-01',
      culture: 'filipino',
      duration: '1 day',
      businessClosure: 'full',
      description: 'National holiday welcoming the new year with family reunions',
      significance: 'Celebrated with fireworks, family gatherings, and traditional foods'
    },
    {
      id: 'sinulog',
      name: 'Sinulog Festival',
      date: '2024-01-21',
      culture: 'filipino',
      duration: '1 week',
      businessClosure: 'partial',
      description: 'Grand festival in Cebu honoring Santo Niño',
      significance: 'Colorful street dancing, parades, and religious devotion'
    },
    {
      id: 'mlk-day',
      name: 'Martin Luther King Jr. Day',
      date: '2024-01-15',
      culture: 'american',
      duration: '1 day',
      businessClosure: 'partial',
      description: 'Federal holiday honoring civil rights leader',
      significance: 'Day of service and reflection on equality and justice'
    },

    // February
    {
      id: 'valentines-us',
      name: 'Valentine\'s Day',
      date: '2024-02-14',
      culture: 'american',
      duration: '1 day',
      businessClosure: 'none',
      description: 'Day of love and romance with gifts and dates',
      significance: 'Expressing love through cards, flowers, and romantic gestures'
    },
    {
      id: 'valentines-ph',
      name: 'Valentine\'s Day',
      date: '2024-02-14',
      culture: 'filipino',
      duration: '1 day',
      businessClosure: 'none',
      description: 'Celebration of love with family and romantic partners',
      significance: 'Gift-giving, special meals, and romantic celebrations'
    },
    {
      id: 'presidents-day',
      name: 'Presidents\' Day',
      date: '2024-02-19',
      culture: 'american',
      duration: '1 day',
      businessClosure: 'partial',
      description: 'Federal holiday honoring U.S. presidents',
      significance: 'Celebrating American leadership and democracy'
    },

    // March
    {
      id: 'womens-day-ph',
      name: 'International Women\'s Day',
      date: '2024-03-08',
      culture: 'filipino',
      duration: '1 day',
      businessClosure: 'none',
      description: 'Celebrating women\'s achievements and rights',
      significance: 'Honoring women\'s contributions to society and family'
    },

    // April
    {
      id: 'araw-ng-kagitingan',
      name: 'Araw ng Kagitingan (Day of Valor)',
      date: '2024-04-09',
      culture: 'filipino',
      duration: '1 day',
      businessClosure: 'full',
      description: 'National holiday commemorating WWII heroes',
      significance: 'Honoring Filipino and American soldiers who fought in WWII'
    },
    {
      id: 'maundy-thursday-ph',
      name: 'Maundy Thursday',
      date: '2024-03-28',
      culture: 'filipino',
      duration: '1 day',
      businessClosure: 'full',
      description: 'Holy Week observance before Easter',
      significance: 'Religious reflection and family time'
    },
    {
      id: 'good-friday-ph',
      name: 'Good Friday',
      date: '2024-03-29',
      culture: 'filipino',
      duration: '1 day',
      businessClosure: 'full',
      description: 'Solemn religious observance',
      significance: 'Prayer, fasting, and religious processions'
    },
    {
      id: 'easter-us',
      name: 'Easter Sunday',
      date: '2024-03-31',
      culture: 'american',
      duration: '1 day',
      businessClosure: 'partial',
      description: 'Christian celebration of resurrection',
      significance: 'Family gatherings, egg hunts, and religious services'
    },

    // May
    {
      id: 'labor-day-ph',
      name: 'Labor Day',
      date: '2024-05-01',
      culture: 'filipino',
      duration: '1 day',
      businessClosure: 'full',
      description: 'International Workers\' Day celebration',
      significance: 'Honoring workers\' rights and contributions'
    },
    {
      id: 'memorial-day',
      name: 'Memorial Day',
      date: '2024-05-27',
      culture: 'american',
      duration: '1 day',
      businessClosure: 'partial',
      description: 'Honoring fallen military service members',
      significance: 'Remembrance, parades, and family gatherings'
    },

    // June
    {
      id: 'independence-day-ph',
      name: 'Independence Day',
      date: '2024-06-12',
      culture: 'filipino',
      duration: '1 day',
      businessClosure: 'full',
      description: 'Philippine Independence from Spain (1898)',
      significance: 'Flag ceremonies, parades, and patriotic celebrations'
    },
    {
      id: 'fathers-day-us',
      name: 'Father\'s Day',
      date: '2024-06-16',
      culture: 'american',
      duration: '1 day',
      businessClosure: 'none',
      description: 'Honoring fathers and father figures',
      significance: 'Family time, gifts, and appreciation for fathers'
    },

    // July
    {
      id: 'independence-day-us',
      name: 'Independence Day',
      date: '2024-07-04',
      culture: 'american',
      duration: '1 day',
      businessClosure: 'full',
      description: 'American Independence from Britain (1776)',
      significance: 'Fireworks, BBQs, parades, and patriotic celebrations'
    },

    // August
    {
      id: 'ninoy-aquino-day',
      name: 'Ninoy Aquino Day',
      date: '2024-08-21',
      culture: 'filipino',
      duration: '1 day',
      businessClosure: 'full',
      description: 'Commemorating Senator Benigno Aquino Jr.',
      significance: 'Remembering democracy and freedom fighter'
    },
    {
      id: 'national-heroes-day',
      name: 'National Heroes Day',
      date: '2024-08-26',
      culture: 'filipino',
      duration: '1 day',
      businessClosure: 'full',
      description: 'Honoring Filipino heroes and patriots',
      significance: 'Celebrating courage and sacrifice for the nation'
    },

    // September
    {
      id: 'labor-day-us',
      name: 'Labor Day',
      date: '2024-09-02',
      culture: 'american',
      duration: '1 day',
      businessClosure: 'partial',
      description: 'Celebrating American workers and labor movement',
      significance: 'End of summer, back-to-school preparations'
    },

    // October
    {
      id: 'columbus-day',
      name: 'Columbus Day',
      date: '2024-10-14',
      culture: 'american',
      duration: '1 day',
      businessClosure: 'partial',
      description: 'Commemorating Christopher Columbus\'s arrival',
      significance: 'Historical reflection and Italian-American heritage'
    },
    {
      id: 'halloween-us',
      name: 'Halloween',
      date: '2024-10-31',
      culture: 'american',
      duration: '1 day',
      businessClosure: 'none',
      description: 'Costume parties, trick-or-treating, and spooky fun',
      significance: 'Community celebration, creativity, and family fun'
    },

    // November
    {
      id: 'all-saints-day-ph',
      name: 'All Saints\' Day',
      date: '2024-11-01',
      culture: 'filipino',
      duration: '2 days',
      businessClosure: 'full',
      description: 'Honoring deceased family members',
      significance: 'Cemetery visits, prayers, and family reunions'
    },
    {
      id: 'thanksgiving-us',
      name: 'Thanksgiving',
      date: '2024-11-28',
      culture: 'american',
      duration: '1 day',
      businessClosure: 'full',
      description: 'Gratitude celebration with family feast',
      significance: 'Family gatherings, turkey dinner, and giving thanks'
    },
    {
      id: 'bonifacio-day',
      name: 'Bonifacio Day',
      date: '2024-11-30',
      culture: 'filipino',
      duration: '1 day',
      businessClosure: 'full',
      description: 'Honoring revolutionary hero Andres Bonifacio',
      significance: 'Celebrating Filipino nationalism and heroism'
    },

    // December
    {
      id: 'christmas-us',
      name: 'Christmas Day',
      date: '2024-12-25',
      culture: 'american',
      duration: '1 day',
      businessClosure: 'full',
      description: 'Christian celebration of Jesus\' birth',
      significance: 'Family gatherings, gift-giving, and religious observance'
    },
    {
      id: 'christmas-ph',
      name: 'Christmas Day',
      date: '2024-12-25',
      culture: 'filipino',
      duration: '1 day',
      businessClosure: 'full',
      description: 'Major Christian celebration with extended festivities',
      significance: 'Family reunions, Noche Buena, and religious devotion'
    },
    {
      id: 'rizal-day',
      name: 'Rizal Day',
      date: '2024-12-30',
      culture: 'filipino',
      duration: '1 day',
      businessClosure: 'full',
      description: 'Commemorating national hero Dr. José Rizal',
      significance: 'Honoring intellectual and peaceful resistance'
    }
  ];

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Calculate time in different zones
  const calculateTime = (location: string, baseTime: Date = currentTime) => {
    const tz = timeZones[location];
    if (!tz) return baseTime;

    const utc = baseTime.getTime() + (baseTime.getTimezoneOffset() * 60000);
    const isDST = tz.dstStart && tz.dstEnd && 
      baseTime >= new Date(tz.dstStart) && baseTime <= new Date(tz.dstEnd);
    const offset = isDST ? tz.dstOffset : tz.offset;
    
    return new Date(utc + (offset * 3600000));
  };

  // Get holidays for selected month
  const getHolidaysForMonth = (month: number, year: number) => {
    return holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate.getMonth() === month && holidayDate.getFullYear() === year;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Calculate time difference
  const getTimeDifference = () => {
    const americanTZ = timeZones[americanLocation];
    const filipinoTZ = timeZones[filipinoLocation];
    
    if (!americanTZ || !filipinoTZ) return 0;
    
    const now = new Date();
    const isDSTAmerican = americanTZ.dstStart && americanTZ.dstEnd && 
      now >= new Date(americanTZ.dstStart) && now <= new Date(americanTZ.dstEnd);
    
    const americanOffset = isDSTAmerican ? americanTZ.dstOffset : americanTZ.offset;
    const filipinoOffset = filipinoTZ.offset;
    
    return filipinoOffset - americanOffset;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthHolidays = getHolidaysForMonth(selectedMonth, selectedYear);
  const timeDifference = getTimeDifference();
  const americanTime = calculateTime(americanLocation);
  const filipinoTime = calculateTime(filipinoLocation);

  const getBusinessClosureIcon = (closure: string) => {
    switch (closure) {
      case 'full': return <Building className="w-4 h-4 text-red-500" />;
      case 'partial': return <Building className="w-4 h-4 text-yellow-500" />;
      case 'none': return <Building className="w-4 h-4 text-green-500" />;
      default: return <Building className="w-4 h-4 text-gray-400" />;
    }
  };

  const getBusinessClosureText = (closure: string) => {
    switch (closure) {
      case 'full': return 'Most businesses closed';
      case 'partial': return 'Some businesses closed';
      case 'none': return 'Businesses open';
      default: return 'Unknown';
    }
  };

  return (
    <section ref={elementRef} className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex p-3 bg-blue-100 rounded-full mb-6">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Cultural Calendar & Time Zone Comparison
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Navigate holidays, time differences, and cultural celebrations across 
            American and Filipino cultures to plan your relationship milestones.
          </p>
        </motion.div>

        {/* Location & Time Zone Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* American Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                American Partner Location
              </label>
              <select
                value={americanLocation}
                onChange={(e) => setAmericanLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Seattle, WA">Seattle, WA (PST/PDT)</option>
                <option value="New York, NY">New York, NY (EST/EDT)</option>
                <option value="Austin, TX">Austin, TX (CST/CDT)</option>
              </select>
            </div>

            {/* Filipino Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filipino Partner Location
              </label>
              <select
                value={filipinoLocation}
                onChange={(e) => setFilipinoLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Manila, Philippines">Manila, Philippines (PST)</option>
                <option value="Cebu City, Philippines">Cebu City, Philippines (PST)</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Current Time Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Current Time & Working Hours
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* American Time */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                <h4 className="font-semibold text-gray-900">{americanLocation}</h4>
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {americanTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-sm text-gray-600 mb-3">
                {americanTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
              </div>
              <div className="text-xs text-gray-500">
                <div>Business Hours: 9:00 AM - 5:00 PM</div>
                <div>Peak Hours: 10:00 AM - 3:00 PM</div>
              </div>
            </div>

            {/* Time Difference */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Globe className="w-5 h-5 text-purple-600 mr-2" />
                <h4 className="font-semibold text-gray-900">Time Difference</h4>
              </div>
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {Math.abs(timeDifference)} hours
              </div>
              <div className="text-sm text-gray-600 mb-3">
                {timeDifference > 0 ? 'Philippines ahead' : 'America ahead'}
              </div>
              <div className="text-xs text-gray-500">
                <div>Best call times:</div>
                <div>8:00 AM - 10:00 AM (PH)</div>
                <div>7:00 PM - 9:00 PM (US)</div>
              </div>
            </div>

            {/* Filipino Time */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                <h4 className="font-semibold text-gray-900">{filipinoLocation}</h4>
              </div>
              <div className="text-2xl font-bold text-red-600 mb-1">
                {filipinoTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-sm text-gray-600 mb-3">
                {filipinoTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
              </div>
              <div className="text-xs text-gray-500">
                <div>Business Hours: 8:00 AM - 5:00 PM</div>
                <div>Peak Hours: 9:00 AM - 4:00 PM</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Month Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white p-2 rounded-lg shadow-lg">
            <div className="flex items-center space-x-4">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {monthNames.map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Holiday Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-8"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <h3 className="text-2xl font-bold text-center">
              {monthNames[selectedMonth]} {selectedYear} - Cultural Holidays
            </h3>
          </div>

          {monthHolidays.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Major Holidays</h4>
              <p className="text-gray-500">No significant cultural holidays in {monthNames[selectedMonth]} {selectedYear}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Holiday
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Culture
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business Impact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Local Times
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {monthHolidays.map((holiday) => {
                    const holidayDate = new Date(holiday.date);
                    const americanHolidayTime = calculateTime(americanLocation, holidayDate);
                    const filipinoHolidayTime = calculateTime(filipinoLocation, holidayDate);
                    
                    return (
                      <tr key={holiday.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {holidayDate.toLocaleDateString([], { 
                              month: 'short', 
                              day: 'numeric',
                              weekday: 'short'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{holiday.name}</div>
                          <div className="text-sm text-gray-500">{holiday.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded mr-2 ${
                              holiday.culture === 'american' ? 'bg-blue-500' : 'bg-red-500'
                            }`}></div>
                            <span className="text-sm text-gray-900 capitalize">
                              {holiday.culture}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-900">{holiday.duration}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getBusinessClosureIcon(holiday.businessClosure)}
                            <span className="text-sm text-gray-900 ml-1">
                              {getBusinessClosureText(holiday.businessClosure)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center mb-1">
                              <div className="w-2 h-2 bg-blue-500 rounded mr-2"></div>
                              <span>{americanLocation.split(',')[0]}: {americanHolidayTime.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-red-500 rounded mr-2"></div>
                              <span>{filipinoLocation.split(',')[0]}: {filipinoHolidayTime.toLocaleString()}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Legend & Key */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Legend & Symbols</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Culture Colors */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Culture</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                  <span className="text-sm text-gray-700">American</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                  <span className="text-sm text-gray-700">Filipino</span>
                </div>
              </div>
            </div>

            {/* Business Impact */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Business Impact</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Building className="w-4 h-4 text-red-500 mr-2" />
                  <span className="text-sm text-gray-700">Full Closure</span>
                </div>
                <div className="flex items-center">
                  <Building className="w-4 h-4 text-yellow-500 mr-2" />
                  <span className="text-sm text-gray-700">Partial Closure</span>
                </div>
                <div className="flex items-center">
                  <Building className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-sm text-gray-700">Open</span>
                </div>
              </div>
            </div>

            {/* Time Zones */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Time Zones</h4>
              <div className="space-y-2">
                <div className="text-sm text-gray-700">
                  <div className="font-medium">PST/PDT: UTC-8/-7</div>
                  <div>Pacific (Seattle)</div>
                </div>
                <div className="text-sm text-gray-700">
                  <div className="font-medium">PST: UTC+8</div>
                  <div>Philippines</div>
                </div>
              </div>
            </div>

            {/* DST Information */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Daylight Saving</h4>
              <div className="space-y-2">
                <div className="text-sm text-gray-700">
                  <div className="font-medium">US DST 2024:</div>
                  <div>Mar 10 - Nov 3</div>
                </div>
                <div className="text-sm text-gray-700">
                  <div className="font-medium">Philippines:</div>
                  <div>No DST observed</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Time Zone Converter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Best Times to Connect</h3>
            <p className="text-blue-100">
              Optimal calling and messaging windows for both partners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white bg-opacity-20 rounded-lg p-6 text-center">
              <Sun className="w-8 h-8 mx-auto mb-3" />
              <h4 className="font-bold mb-2">Morning Calls</h4>
              <div className="text-sm">
                <div>🇺🇸 7:00 PM - 9:00 PM</div>
                <div>🇵🇭 8:00 AM - 10:00 AM</div>
              </div>
            </div>

            <div className="bg-white bg-opacity-20 rounded-lg p-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-3" />
              <h4 className="font-bold mb-2">Lunch Break</h4>
              <div className="text-sm">
                <div>🇺🇸 9:00 PM - 11:00 PM</div>
                <div>🇵🇭 12:00 PM - 2:00 PM</div>
              </div>
            </div>

            <div className="bg-white bg-opacity-20 rounded-lg p-6 text-center">
              <Moon className="w-8 h-8 mx-auto mb-3" />
              <h4 className="font-bold mb-2">Evening Chat</h4>
              <div className="text-sm">
                <div>🇺🇸 5:00 AM - 7:00 AM</div>
                <div>🇵🇭 6:00 PM - 8:00 PM</div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button
              variant="outline"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <Heart className="w-4 h-4 mr-2" />
              Plan Your Next Call
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CulturalCalendar;
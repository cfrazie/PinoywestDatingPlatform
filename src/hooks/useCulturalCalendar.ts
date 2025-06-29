import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

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

interface TimeZonePreference {
  id: string;
  userId: string;
  location: string;
  timeZone: string;
  abbreviation: string;
  utcOffset: number;
  dstObserved: boolean;
}

export const useCulturalCalendar = (userId?: string) => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [americanLocation, setAmericanLocation] = useState('Seattle, WA');
  const [filipinoLocation, setFilipinoLocation] = useState('Manila, Philippines');
  const [timeZonePreferences, setTimeZonePreferences] = useState<TimeZonePreference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Load holidays from database
  const loadHolidays = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('cultural_holidays')
          .select('*')
          .order('date');

        if (error) throw error;

        // Format holidays to match our interface
        const formattedHolidays: Holiday[] = data.map(holiday => ({
          id: holiday.id,
          name: holiday.name,
          date: holiday.date,
          culture: holiday.culture,
          duration: holiday.duration,
          businessClosure: holiday.business_closure,
          description: holiday.description,
          significance: holiday.significance
        }));

        setHolidays(formattedHolidays);
      } else {
        // Use mock data if Supabase is not available
        // This would be the hardcoded holidays array from the component
        console.log('Using mock holiday data');
      }
    } catch (err) {
      console.error('Error loading holidays:', err);
      setError('Failed to load holiday data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load user time zone preferences
  const loadTimeZonePreferences = useCallback(async () => {
    if (!userId || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('time_zone_preferences')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      if (data && data.length > 0) {
        setTimeZonePreferences(data.map(pref => ({
          id: pref.id,
          userId: pref.user_id,
          location: pref.location,
          timeZone: pref.time_zone,
          abbreviation: pref.abbreviation,
          utcOffset: pref.utc_offset,
          dstObserved: pref.dst_observed
        })));

        // Set default locations if preferences exist
        const americanPref = data.find(pref => pref.location.includes('USA'));
        const filipinoPref = data.find(pref => pref.location.includes('Philippines'));

        if (americanPref) setAmericanLocation(americanPref.location);
        if (filipinoPref) setFilipinoLocation(filipinoPref.location);
      }
    } catch (err) {
      console.error('Error loading time zone preferences:', err);
    }
  }, [userId]);

  // Save time zone preference
  const saveTimeZonePreference = useCallback(async (location: string, isAmerican: boolean) => {
    if (!userId || !supabase) return;

    const tz = timeZones[location];
    if (!tz) return;

    try {
      const { data, error } = await supabase
        .from('time_zone_preferences')
        .upsert({
          user_id: userId,
          location: location,
          time_zone: tz.name,
          abbreviation: tz.abbreviation,
          utc_offset: tz.offset,
          dst_observed: !!tz.dstStart,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id, location'
        })
        .select();

      if (error) throw error;

      // Update local state
      if (isAmerican) {
        setAmericanLocation(location);
      } else {
        setFilipinoLocation(location);
      }

      // Refresh preferences
      await loadTimeZonePreferences();
    } catch (err) {
      console.error('Error saving time zone preference:', err);
    }
  }, [userId, loadTimeZonePreferences]);

  // Get holidays for selected month
  const getHolidaysForMonth = useCallback((month: number, year: number) => {
    return holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate.getMonth() === month && holidayDate.getFullYear() === year;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [holidays]);

  // Calculate time in different zones
  const calculateTime = useCallback((location: string, baseTime: Date = new Date()) => {
    const tz = timeZones[location];
    if (!tz) return baseTime;

    const utc = baseTime.getTime() + (baseTime.getTimezoneOffset() * 60000);
    const isDST = tz.dstStart && tz.dstEnd && 
      baseTime >= new Date(tz.dstStart) && baseTime <= new Date(tz.dstEnd);
    const offset = isDST ? tz.dstOffset : tz.offset;
    
    return new Date(utc + (offset * 3600000));
  }, [timeZones]);

  // Calculate time difference
  const getTimeDifference = useCallback(() => {
    const americanTZ = timeZones[americanLocation];
    const filipinoTZ = timeZones[filipinoLocation];
    
    if (!americanTZ || !filipinoTZ) return 0;
    
    const now = new Date();
    const isDSTAmerican = americanTZ.dstStart && americanTZ.dstEnd && 
      now >= new Date(americanTZ.dstStart) && now <= new Date(americanTZ.dstEnd);
    
    const americanOffset = isDSTAmerican ? americanTZ.dstOffset : americanTZ.offset;
    const filipinoOffset = filipinoTZ.offset;
    
    return filipinoOffset - americanOffset;
  }, [americanLocation, filipinoLocation, timeZones]);

  // Get best times to connect
  const getBestTimesToConnect = useCallback(() => {
    const timeDiff = getTimeDifference();
    
    // Calculate optimal windows based on time difference
    const morningWindow = {
      american: { start: '19:00', end: '21:00' },
      filipino: { start: '08:00', end: '10:00' }
    };
    
    const lunchWindow = {
      american: { start: '21:00', end: '23:00' },
      filipino: { start: '12:00', end: '14:00' }
    };
    
    const eveningWindow = {
      american: { start: '05:00', end: '07:00' },
      filipino: { start: '18:00', end: '20:00' }
    };
    
    return { morningWindow, lunchWindow, eveningWindow };
  }, [getTimeDifference]);

  // Load data on mount
  useEffect(() => {
    loadHolidays();
    if (userId) {
      loadTimeZonePreferences();
    }
  }, [loadHolidays, loadTimeZonePreferences, userId]);

  return {
    holidays,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    americanLocation,
    setAmericanLocation,
    filipinoLocation,
    setFilipinoLocation,
    timeZones,
    isLoading,
    error,
    getHolidaysForMonth,
    calculateTime,
    getTimeDifference,
    getBestTimesToConnect,
    saveTimeZonePreference
  };
};
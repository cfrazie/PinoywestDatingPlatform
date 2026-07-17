import React, { useState, useEffect } from 'react';
import { locationService } from '../../services/locationService';
import type { UserLocation } from '../../types/cultureWall';
import { MapPin, Globe, Briefcase, Home, Plane, Check } from 'lucide-react';

interface LocationSetupProps {
  userId: string;
  onComplete?: () => void;
}

export const LocationSetup: React.FC<LocationSetupProps> = ({ userId, onComplete }) => {
  const [locations, setLocations] = useState<UserLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [detectingIP, setDetectingIP] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isOFW, setIsOFW] = useState(false);

  const [formData, setFormData] = useState({
    location_type: 'current' as 'home' | 'current' | 'work' | 'travel',
    country: '',
    city: '',
    region: '',
    is_ofw: false,
    ofw_host_country: '',
    ofw_occupation: '',
  });

  useEffect(() => {
    loadLocations();
  }, [userId]);

  const loadLocations = async () => {
    setLoading(true);
    try {
      const data = await locationService.getUserLocations(userId);
      setLocations(data);
      setIsOFW(data.some(loc => loc.is_ofw));
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDetectIP = async () => {
    setDetectingIP(true);
    try {
      const result = await locationService.detectLocationFromIP(userId);
      
      if (!result.has_existing_location) {
        // Location was auto-created
        await loadLocations();
      } else {
        // Show detected location to user
        setFormData({
          ...formData,
          country: result.country,
          city: result.city,
          region: result.region,
        });
        setShowAddForm(true);
      }
    } catch (error) {
      console.error('Error detecting location:', error);
      alert('Could not detect location from IP. Please enter manually.');
    } finally {
      setDetectingIP(false);
    }
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await locationService.createLocation({
        user_id: userId,
        location_type: formData.location_type,
        is_primary: locations.length === 0,
        country: formData.country,
        country_code: '', // Would be derived from country
        city: formData.city,
        region: formData.region,
        is_ofw: formData.is_ofw,
        ofw_host_country: formData.is_ofw ? formData.ofw_host_country : undefined,
        ofw_home_country: formData.is_ofw ? 'Philippines' : undefined,
        ofw_occupation: formData.is_ofw ? formData.ofw_occupation : undefined,
        manually_set: true,
        verified: false,
      } as any);

      await loadLocations();
      setShowAddForm(false);
      setFormData({
        location_type: 'current',
        country: '',
        city: '',
        region: '',
        is_ofw: false,
        ofw_host_country: '',
        ofw_occupation: '',
      });
    } catch (error) {
      console.error('Error adding location:', error);
    }
  };

  const handleSetPrimary = async (locationId: string) => {
    try {
      await locationService.setPrimaryLocation(userId, locationId);
      await loadLocations();
    } catch (error) {
      console.error('Error setting primary location:', error);
    }
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home className="w-5 h-5" />;
      case 'work':
        return <Briefcase className="w-5 h-5" />;
      case 'travel':
        return <Plane className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Location Setup</h1>
        <p className="text-gray-600">
          Help us show you relevant cultural insights and connect you with people in your area.
        </p>

        {/* Auto-detect */}
        <div className="mt-6">
          <button
            onClick={handleDetectIP}
            disabled={detectingIP}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition disabled:opacity-50"
          >
            <Globe className="w-5 h-5" />
            {detectingIP ? 'Detecting...' : 'Auto-detect my location'}
          </button>
          <p className="text-sm text-gray-500 mt-2 text-center">
            We'll use your IP address to determine your approximate location
          </p>
        </div>
      </div>

      {/* Current Locations */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {locations.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-bold text-lg text-gray-900 mb-4">Your Locations</h2>
              <div className="space-y-3">
                {locations.map(location => (
                  <div
                    key={location.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getLocationIcon(location.location_type)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {location.city}, {location.country}
                          </h3>
                          {location.is_primary && (
                            <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs font-medium rounded-full">
                              Primary
                            </span>
                          )}
                          {location.is_ofw && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              OFW
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {location.location_type.replace(/\b\w/g, l => l.toUpperCase())}
                          {location.is_ofw && location.ofw_occupation && ` • ${location.ofw_occupation}`}
                        </p>
                      </div>
                    </div>
                    {!location.is_primary && (
                      <button
                        onClick={() => handleSetPrimary(location.id)}
                        className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                      >
                        Set as primary
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Location Form */}
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-pink-600 hover:text-pink-600 transition"
            >
              + Add another location
            </button>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-bold text-lg text-gray-900 mb-4">Add Location</h2>
              <form onSubmit={handleAddLocation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location Type
                  </label>
                  <select
                    value={formData.location_type}
                    onChange={(e) => setFormData({ ...formData, location_type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    required
                  >
                    <option value="home">Home</option>
                    <option value="current">Current</option>
                    <option value="work">Work</option>
                    <option value="travel">Travel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Region/State
                    </label>
                    <input
                      type="text"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>

                {/* OFW Section */}
                <div className="border-t border-gray-200 pt-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_ofw}
                      onChange={(e) => setFormData({ ...formData, is_ofw: e.target.checked })}
                      className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      I'm an OFW (Overseas Filipino Worker)
                    </span>
                  </label>

                  {formData.is_ofw && (
                    <div className="mt-4 space-y-4 pl-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Host Country
                        </label>
                        <input
                          type="text"
                          value={formData.ofw_host_country}
                          onChange={(e) => setFormData({ ...formData, ofw_host_country: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                          placeholder="Country where you work"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Occupation
                        </label>
                        <input
                          type="text"
                          value={formData.ofw_occupation}
                          onChange={(e) => setFormData({ ...formData, ofw_occupation: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                          placeholder="Your job or profession"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
                  >
                    Add Location
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Complete Button */}
      {locations.length > 0 && onComplete && (
        <div className="mt-6">
          <button
            onClick={onComplete}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Check className="w-5 h-5" />
            Complete Setup
          </button>
        </div>
      )}
    </div>
  );
};

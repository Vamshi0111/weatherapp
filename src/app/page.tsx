'use client';
import { useState, useEffect, JSX } from 'react';
import { Poppins } from 'next/font/google';
import Skeleton from 'react-loading-skeleton';

const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
    const data = await res.json();
    return data.address?.city || data.address?.town || data.address?.village || data.address?.state || 'Unknown location';
  } catch (err) {
    console.error("Reverse geocoding error:", err);
    return 'Unknown location';
  }
};


type City = {
  name: string;
  country: string;
  lat?: string;
  lng?: string;
};

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins'
});

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;


const checkIfDaytime = (sunrise: number, sunset: number): boolean => {
  const now = Date.now() / 1000;
  console.log(`Now: ${now}, Sunrise: ${sunrise}, Sunset: ${sunset}`);
  return now >= sunrise && now < sunset;
};

const getWeatherDescription = (
  temp: number,
  weatherMain: string,
  windSpeed: number,
  isDaytime: boolean
): string => {
  console.log(`Temp: ${temp}, weather: ${weatherMain}, windspeed: ${windSpeed}, Daytime: ${isDaytime}`);
  const weather = weatherMain.toLowerCase();

  if (weather.includes('rain')) {
    if (temp > 30) return 'Hot and stormy with heavy rain';
    if (temp < 20) return 'Cold and rainy with strong winds';
    return 'Stormy with heavy rain';
  }

  if (weather.includes('cloud')) {
    if (temp > 25) return isDaytime ? 'Warm and cloudy' : 'Mild and cloudy night';
    if (temp < 15) return isDaytime ? 'Cool and cloudy' : 'Chilly and overcast night';
    return isDaytime ? 'Cloudy day' : 'Cloudy evening';
  }

  if (weather.includes('clear')) {
    if (isDaytime) {
      if (temp > 40) return 'Extremely hot and sunny';
      if (temp > 30) return 'Hot and sunny';
      if (temp > 20) return 'Sunny with a gentle breeze';
      return 'Clear skies with pleasant temperature';
    } else {
      if (temp > 25) return 'Clear and warm night';
      if (temp > 15) return 'Clear night with gentle breeze';
      return 'Clear and cool night';
    }
  }

  if (weather.includes('snow')) {
    return 'Snowy and freezing – bundle up!';
  }

  if (temp >= 18 && windSpeed > 6) return 'Cool wind blowing';
  if (temp >= 10 && temp < 18) return 'Pleasant and cool';
  if (temp < 10) return 'Cold weather – wear something warm';

  return 'Typical day with mild conditions';

};

const temp = 27;
const weatherMain = 'Clear';
const windSpeed = 5;

const sunrise = 1618300000;
const sunset = 1618340000;

const isDaytime = checkIfDaytime(sunrise, sunset);

const weatherDescription = getWeatherDescription(temp, weatherMain, windSpeed, isDaytime);

// console.log(weatherDescription);


export default function Home() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [is24Hour, setIs24Hour] = useState(false);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [weatherDescription, setWeatherDescription] = useState<string | null>(null);
  const [tempMin, setTempMin] = useState<number | null>(null);
  const [tempMax, setTempMax] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [personal, setPersonal] = useState<number | null>(null);



  useEffect(() => {
    async function fetchWeather() {
      try {

        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=London&appid=${API_KEY}&units=metric`);
        console.log("Response Status:", res.status);
        const data = await res.json();

        const description = data.weather?.[0]?.description ?? 'No information';
        setWeatherDescription(description);
      } catch (error) {
        console.error('Error fetching weather:', error);
        setWeatherDescription('Failed to fetch weather');
      }
    }

    fetchWeather();
  }, []);


  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      if (is24Hour) {
        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        setTime(formattedTime);
      } else {
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        const formattedTime = `${formattedHours}:${formattedMinutes} ${ampm}`;
        setTime(formattedTime);
      }

      const formattedDate = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      setDate(formattedDate);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [is24Hour]);

  const toggleTimeFormat = () => setIs24Hour((prev) => !prev);


  useEffect(() => {
    const stored = localStorage.getItem('favourites');
    if (stored) setFavourites(JSON.parse(stored));
  }, []);

  const addToFavourites = (city: string) => {
    if (!favourites.includes(city)) {
      const updated = [...favourites, city];
      setFavourites(updated);
      localStorage.setItem('favourites', JSON.stringify(updated));
    }
  };

  const fetchWeather = async () => {
    if (!city.trim()) {
      alert('Please enter a city name.');
      return;
    }
    setLoading(true);
    setWeather(null);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
      );
      const data = await response.json();

      if (data.cod === 200) {
        setWeather(data);
        setHumidity(data.main.humidity);

        localStorage.setItem('weather', JSON.stringify(data));

        const tempMin = data.main.temp_min;
        const tempMax = data.main.temp_max;
        console.log(`Low: ${tempMin}°C, High: ${tempMax}°C, Humidity: ${data.main.humidity}, Windspeed: ${data.wind.speed.toFixed(2)}`);
        const personal = setPersonal(data.wind.speed);

        setWeather(data);
        setTempMin(data.main.temp_min);
        setTempMax(data.main.temp_max);

        const { sunrise, sunset } = data.sys;
        const isDay = checkIfDaytime(sunrise, sunset);

        const description = getWeatherDescription(data.main.temp, data.weather[0].main, data.wind.speed, isDay);
        setWeatherDescription(description);
      } else {
        alert(data.message);

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            fetchWeatherByCoords(latitude, longitude);
          },
          (err) => {
            console.error("Geolocation error (fallback):", err);
            alert("Failed to retrieve your location.");
          }
        );
      }
    } catch (error) {
      console.error(error);
      alert("Failed to fetch weather data");
    }
    setLoading(false);
  };


  // Fetching locations by co-ordinates
  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    setLoading(true);
    setWeather(null);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );
      const data = await response.json();
      if (data.cod === 200) {
        setWeather(data);
        setHumidity(data.main.humidity);

        localStorage.setItem('weather', JSON.stringify(data));

        const tempMin = data.main.temp_min;
        const tempMax = data.main.temp_max;
        console.log(`Low: ${tempMin}°C, High: ${tempMax}°C, Humidity: ${data.main.humidity}, Windspeed: ${data.wind.speed}`);
        const personal = setPersonal(data.wind.speed);

        setTempMin(data.main.temp_min);
        setTempMax(data.main.temp_max);

        const { sunrise, sunset } = data.sys;
        const isDay = checkIfDaytime(sunrise, sunset);

        const locationName = await reverseGeocode(lat, lon);
        setCity(locationName);
        setCity('');

        const description = getWeatherDescription(
          data.main.temp,
          data.weather[0].main,
          data.wind.speed,
          isDay
        );
        setWeatherDescription(description);
        console.log("This is :", description)
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to fetch weather by location.');
    }
    setLoading(false);
  };



  // Used for current location by GPS
  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    let intervalId: NodeJS.Timeout;

    const getLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;

          if (!latitude && !longitude) {
            console.warn("Invalid coordinates received. Waiting for GPS.");
            return;
          }

          clearInterval(intervalId);
          fetchWeatherByCoords(latitude, longitude);
        },
        (err) => {
          console.error("Error getting location:", err);

          let message = "Failed to retrieve your location.";
          switch (err.code) {
            case err.PERMISSION_DENIED:
              message = "Location permission denied. Please allow location access in your browser settings.";
              break;
            case err.POSITION_UNAVAILABLE:
              message = "Location unavailable. Please ensure your device's GPS/location services are turned ON.";
              break;
            case err.TIMEOUT:
              message = "Request timed out. Try again in an area with better GPS signal.";
              break;
          }

          alert(message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    };

    navigator.permissions?.query({ name: 'geolocation' as PermissionName })
      .then((result) => {
        if (result.state === 'granted' || result.state === 'prompt') {
          getLocation();
          intervalId = setInterval(getLocation, 3000);
        } else if (result.state === 'denied') {
          alert("Location access is blocked. Please allow it in your browser settings.");
        }
      })
      .catch(() => {
        getLocation();
        intervalId = setInterval(getLocation, 3000);
      });

    return () => {
      clearInterval(intervalId);
    };
  }, []);


  useEffect(() => {
    fetch('/cities.json')
      .then((res) => res.json())
      .then((data: City[]) => setCities(data))
      .catch((err) => console.error('Failed to load cities.json', err));
  }, []);


  useEffect(() => {
    console.log("Suggestions updated:", suggestions);
  }, [suggestions]);

  return (
    <div className="flex flex-col bg-white w-full h-screen">
      <nav className="flex justify-between items-center h-12 w-full lg:14 px-2 lg:px-3 pr-1 ">
        <div className="flex gap-x-3 items-center">
          <img src="/cloud.png" alt="cloudimage" className="h-6 w-6 sm:h-8 sm:w-8" />
          <p className={`text-black font-medium text-md sm:text-lg ${poppins.className}`}>
            Climate check
          </p>
        </div>
        <div className={`flex items-center gap-5 text-black cursor-pointer ${poppins.className}`}>
          <div className="flex lg:flex sm:flex items-center gap-2 px-4 text-sm hidden sm:block lg:block">
            <>
              {loading ? (
                <Skeleton width="80%" height={30} />
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Search for a city..."
                    value={city}
                    autoComplete="off"
                    onChange={(e) => {
                      const value = e.target.value;
                      const isValid = /^[a-zA-Z\s]*$/.test(value);
                      if (isValid) {
                        const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
                        setCity(capitalized);

                        if (capitalized.length > 0) {
                          const filtered = cities.filter((c) =>
                            c.name.toLowerCase().startsWith(capitalized.toLowerCase())
                          );
                          setSuggestions(filtered.slice(0, 10));
                        } else {
                          setSuggestions([]);
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        fetchWeather();
                        setCity('');
                        setSuggestions([]);
                      }
                    }}
                    className={`border border-gray-500 rounded-lg px-3 py-1 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 ${poppins.className}`}
                  />

                  {suggestions.length > 0 && (
                    <ul className="absolute top-11 left-220 lg:w-60 lg:left-220 md:left-94 md:w-45 bg-white border border-gray-300 z-50 shadow-lg rounded-md">
                      {suggestions.map((suggestion, idx) => (
                        <li
                          key={idx}
                          onClick={() => {
                            setCity(suggestion.name);
                            setSuggestions([]);
                            fetchWeather();
                            setCity('')
                          }}
                          className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                        >
                          {suggestion.name}, {suggestion.country}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}

              {loading ? (
                <Skeleton width={80} height={30} />
              ) : (
                <button
                  onClick={() => {
                    fetchWeather();
                    setCity('');
                  }}
                  className={`bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-all text-xs ${poppins.className}`}
                >
                  Search
                </button>
              )}
            </>
          </div>
          <div className='flex flex-col items-end gap-1'>
            <div className='flex justify-between w-full'>
              <img src="/star.png" alt="favourites" className='h-4 sm:h-6 lg:h-4 flex sm:block block' />
              <p className="text-xs flex justify-end hidden lg:flex" onClick={toggleTimeFormat}>{time}</p>
            </div>
            <p className="text-[10px] text-sm text-lg">{date}</p>
          </div>
        </div>
      </nav>
      <div className='flex bg-blue-300 flex-col w-full h-screen'>
        <div className='relative flex sm:bg-red-00 lg:h-60 flex-col lg:mt-0 pr-2 sm:flex-row items:end sm:justify-between justify-start lg:items-start overflow-hidden'>
          <div className='bg-green-00 flex lg:w-[85%] sm:flex lg:h-70 lg:flex hidden sm:flex items-center px-2'>
            {loading ? (
              <Skeleton height={200} />
            ) : weather ? (
              <p className={`text-black lg:text-7xl sm:text-5xl flex flex-wrap ${poppins.className}`}>
                {weatherDescription}
              </p>
            ) : null}
          </div>
          <div className="flex relative w-full bg-red-00 lg:hidden sm:hidden items-center justify-end gap-2 pl-[140px] text-sm py-2">
            <>
              {loading ? (
                <Skeleton width="80%" height={30} />
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Search for a city..."
                    value={city}
                    autoComplete="off"
                    onChange={(e) => {
                      const value = e.target.value;
                      const isValid = /^[a-zA-Z\s]*$/.test(value);
                      if (isValid) {
                        const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
                        setCity(capitalized);

                        if (capitalized.length > 0) {
                          const filtered = cities.filter((c) =>
                            c.name.toLowerCase().startsWith(capitalized.toLowerCase())
                          );
                          setSuggestions(filtered.slice(0, 10));
                        } else {
                          setSuggestions([]);
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        fetchWeather();
                        setCity('');
                        setSuggestions([]);
                      }
                    }}
                    className={`border border-gray-500 text-black rounded-lg px-3 py-1 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 ${poppins.className}`}
                  />

                  {suggestions.length > 0 && (
                    <ul className={`absolute bg-white text-black top-11 h-auto left-35 lg:w-60 lg:left-220 md:left-94 md:w-45 border border-gray-300 z-50 shadow-lg rounded-md ${poppins.className}`}>
                      {suggestions.map((suggestion, idx) => (
                        <li
                          key={idx}
                          onClick={() => {
                            setCity(suggestion.name);
                            setSuggestions([]);
                            fetchWeather();
                            setCity('')
                          }}
                          className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                        >
                          {suggestion.name}, {suggestion.country}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}

              {loading ? (
                <Skeleton width={80} height={30} />
              ) : (
                <button
                  onClick={() => {
                    fetchWeather();
                    setCity('');
                  }}
                  className={`bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-all text-xs ${poppins.className}`}
                >
                  Search
                </button>
              )}
            </>
          </div>
          <div className='flex flex-col bg-blue-00 items-end justify-center'>
            <div className='flex w-30 bg-red-00 h-auto sm:w-40 lg:h-30 lg:w-50 mt-5 sm:mt-7 justify-center items-center'>
              {weather && (
                <p className={`text-6xl sm:text-7xl lg:text-9xl font-normal text-black ${poppins.className}`}>
                  {Math.round(weather.main.temp)}°
                </p>
              )}
            </div>
            <p className={`text-black text-[10px] sm:text-sm ${poppins.className}`}>
              {weather?.name && weather?.sys?.country
                ? `- ${weather.name}, ${weather.sys.country}`
                : ""}
            </p>
            <div className='lg:mt-1 sm:mt-1 text-end'>
              {loading ? (
                <Skeleton height={30} width={40} />
              ) : (
                <p className={`text-black text-[6px] lg:text-[10px] sm:text-[8px] ${poppins.className}`}>
                  Humidity: {humidity}%
                  <br />
                  WindSpeed: {personal} Km
                </p>
              )}
            </div>
          </div>
          {loading ? (
            <Skeleton height={20} width={40} />
          ) : (
            <div className='bg-green-00 flex px-2 py-3 sm:hidden lg:hidden justify-end items-center ml-2'>
            <p className={`bg-red-00 text-black text-5xl ${poppins.className}`}>
              {weatherDescription}
            </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

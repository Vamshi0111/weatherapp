'use client';
import { useState, useEffect, useRef } from 'react'; // ADDED: Import useRef
import { Poppins } from 'next/font/google';
import Skeleton from 'react-loading-skeleton';
import { FaHeart } from "react-icons/fa6";

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

const getWeatherImage = (description: string, isDaytime: boolean): string => {
  const lowerDescription = description.toLowerCase();

  if (isDaytime) {
    if (lowerDescription.includes('sunny') || lowerDescription.includes('clear skies with pleasant temperature')) {
      return '/images/sunny_day.jpg';
    }
    else if (lowerDescription.includes('cloudy') || lowerDescription.includes('overcast') || lowerDescription.includes('cloudy day') || lowerDescription.includes('warm and cloudy') || lowerDescription.includes('cool and cloudy')) {
      return '/images/cloudy_day.jpg';
    }
    if (lowerDescription.includes('rain') || lowerDescription.includes('stormy') || lowerDescription.includes('hot and stormy') || lowerDescription.includes('stormy with heavy rain')) {
      return '/images/rainy_day.jpg';
    }
    if (lowerDescription.includes('snow') || lowerDescription.includes('snowy and freezing')) {
      return '/images/snowy_day.jpg';
    }
    if (lowerDescription.includes('cold')) {
      return '/images/cold.jpg';
    }
    if (lowerDescription.includes('hot')) {
      return '/images/hot.jpg';
    }
    if (lowerDescription.includes('cool wind blowing') || lowerDescription.includes('pleasant and cool') || lowerDescription.includes('typical day with mild conditions')) {
      return '/images/sunny_day.jpg';
    }
  }
  else {
    if (lowerDescription.includes('clear night') || lowerDescription.includes('clear and warm night') || lowerDescription.includes('clear night with gentle breeze') || lowerDescription.includes('clear and cool night')) {
      return '/images/clear_night.jpg';
    }
    if (lowerDescription.includes('cloudy night') || lowerDescription.includes('overcast night') || lowerDescription.includes('mild and cloudy night') || lowerDescription.includes('chilly and overcast night') || lowerDescription.includes('cloudy evening')) {
      return '/images/cloudy_night.jpg';
    }
    if (lowerDescription.includes('rain') || lowerDescription.includes('stormy') || lowerDescription.includes('cold and rainy')) {
      return '/images/rainy_day.jpg';
    }
    if (lowerDescription.includes('snow') || lowerDescription.includes('snowy and freezing')) {
      return '/images/snowy_night.jpg';
    }
    if (lowerDescription.includes('cold weather')) {
      return '/images/snowy_night.jpg';
    }
  }
  if (isDaytime) {
    return '/images/sunny_day.jpg';
  } else {
    return '/images/default_night.jpg';
  }
}

const getImageBrightnessCategory = (imagePath: string): 'light' | 'dark' => {
  if (
    imagePath.includes('sunny_day.jpg') ||
    imagePath.includes('cloudy_day.jpg') ||
    imagePath.includes('cold.jpg') ||
    imagePath.includes('hot.jpg')
  ) {
    return 'light';
  }
  if (
    imagePath.includes('clear_night.jpg') ||
    imagePath.includes('cloudy_night.jpg') ||
    imagePath.includes('rainy_night.jpg') ||
    imagePath.includes('snowy_night.jpg') ||
    imagePath.includes('rainy_day.jpg')
  ) {
    return 'dark';
  }
  return 'light';
}


const temp = 27;
const weatherMain = 'Clear';
const windSpeed = 5;

const sunrise = 1618300000;
const sunset = 1618340000;

const isDaytime = checkIfDaytime(sunrise, sunset);

const weatherDescription = getWeatherDescription(temp, weatherMain, windSpeed, isDaytime);


export default function Home() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [is24Hour, setIs24Hour] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [weatherDescription, setWeatherDescription] = useState<string | null>(null);
  const [tempMin, setTempMin] = useState<number | null>(null);
  const [tempMax, setTempMax] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [personal, setPersonal] = useState<number | null>(null);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDaytime, setIsDaytime] = useState<boolean>(true);
  const [weatherImage, setWeatherImage] = useState<string>('/images/sunny_day.jpg');
  const [textColorClass, setTextColorClass] = useState<string>('text-black');

  // ADDED: Create a ref for the search container (input + suggestions)
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchWeatherForInitialLoad() {
      try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=London&appid=${API_KEY}&units=metric`);
        console.log("Response Status:", res.status);
        const data = await res.json();

        if (data.cod === 200) {
          const { sunrise, sunset } = data.sys;
          const isDay = checkIfDaytime(sunrise, sunset);
          setIsDaytime(isDay);

          const description = getWeatherDescription(data.main.temp, data.weather[0].main, data.wind.speed, isDay);
          setWeatherDescription(description);
          const newImagePath = getWeatherImage(description, isDay);
          setWeatherImage(newImagePath);
          const brightnessCategory = getImageBrightnessCategory(newImagePath);
          setTextColorClass(brightnessCategory === 'dark' ? 'text-white' : 'text-black');
        } else {
          setWeatherDescription('No information');
          const defaultImagePath = '/images/sunny_day.jpg';
          setWeatherImage(defaultImagePath);
          setTextColorClass(getImageBrightnessCategory(defaultImagePath) === 'dark' ? 'text-white' : 'text-black');
        }
      } catch (error) {
        console.error('Error fetching weather:', error);
        setWeatherDescription('Failed to fetch weather');
        const defaultImagePath = '/images/sunny_day.jpg';
        setWeatherImage(defaultImagePath);
        setTextColorClass(getImageBrightnessCategory(defaultImagePath) === 'dark' ? 'text-white' : 'text-black');
      }
    }

    fetchWeatherForInitialLoad();
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
        setIsDaytime(isDay);

        const description = getWeatherDescription(data.main.temp, data.weather[0].main, data.wind.speed, isDay);
        setWeatherDescription(description);
        const newImagePath = getWeatherImage(description, isDay);
        setWeatherImage(newImagePath);
        const brightnessCategory = getImageBrightnessCategory(newImagePath);
        setTextColorClass(brightnessCategory === 'dark' ? 'text-white' : 'text-black')
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
            const defaultImagePath = '/images/sunny_day.jpg';
            setWeatherImage(defaultImagePath);
            setTextColorClass(getImageBrightnessCategory(defaultImagePath) === 'dark' ? 'text-white' : 'text-black');
          }
        );
      }
    } catch (error) {
      console.error(error);
      alert("Failed to fetch weather data");
      const defaultImagePath = '/images/sunny_day.jpg';
      setWeatherImage(defaultImagePath);
      setTextColorClass(getImageBrightnessCategory(defaultImagePath) === 'dark' ? 'text-white' : 'text-black');
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
        setIsDaytime(isDay);

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
        const newImagePath = getWeatherImage(description, isDay);
        setWeatherImage(newImagePath);
        console.log("This is :", description)
        const brightnessCategory = getImageBrightnessCategory(newImagePath);
        setTextColorClass(brightnessCategory === 'dark' ? 'text-white' : 'text-black');
      } else {
        alert(data.message);
        const defaultImagePath = '/images/sunny_day.jpg';
        setWeatherImage(defaultImagePath);
        setTextColorClass(getImageBrightnessCategory(defaultImagePath) === 'dark' ? 'text-white' : 'text-black');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to fetch weather by location.');
      const defaultImagePath = '/images/sunny_day.jpg';
      setWeatherImage(defaultImagePath);
      setTextColorClass(getImageBrightnessCategory(defaultImagePath) === 'dark' ? 'text-white' : 'text-black');
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


  // favourites added now
  useEffect(() => {
    const saved = localStorage.getItem("favorites");
    if (saved) {
      setFavourites(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("favourites", JSON.stringify(favourites));
  }, [favourites]);

  const addToFavourites = (city: string) => {
    if (!favourites.includes(city)) {
      const updated = [...favourites, city];
      setFavourites(updated);
      localStorage.setItem('favourites', JSON.stringify(updated));
    }
  };

  // ADDED: New useEffect for handling clicks outside the search container
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchContainerRef]);


  return (
    <div className="flex flex-col bg-white w-full h-screen">
      <nav className="flex justify-between items-center h-12 w-full lg:14 px-2 lg:px-3 pr-1">
        <div className="flex gap-x-3 items-center">
          <img src="/cloud.png" alt="cloudimage" className="h-6 w-6 sm:h-8 sm:w-8" />
          <p className={`text-black font-medium text-md sm:text-lg ${poppins.className}`}>
            Climate check
          </p>
        </div>
        <div className={`flex items-center gap-5 text-black cursor-pointer ${poppins.className}`}>
          {/* ADDED: Apply ref here for larger screens */}
          <div className="flex lg:flex sm:flex items-center gap-2 px-4 text-sm hidden sm:block lg:block" ref={searchContainerRef}>
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
                    // ADDED: onFocus handler to show suggestions when input is focused
                    onFocus={() => {
                      if (city.length > 0) {
                        const filtered = cities.filter((c) =>
                          c.name.toLowerCase().startsWith(city.toLowerCase())
                        );
                        setSuggestions(filtered.slice(0, 10));
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
                    <ul className="absolute left-220 lg:w-auto lg:left-220 md:left-94 md:h-auto md:top-[42px] md:w-auto bg-white border border-gray-300 z-50 shadow-lg rounded-md">
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
                    setSuggestions([]);
                  }}
                  className={`bg-blue-500 cursor-pointer text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-all text-xs ${poppins.className}`}
                >
                  Search
                </button>
              )}
            </>
          </div>
          <div className='flex flex-col items-end gap-1'>
            <div className='flex justify-between w-full cursor-pointer'>
              {loading ? (
                <Skeleton className='h-5 w-10 rounded-full' />
              ) : (
                <button className='cursor-pointer'>
                  <FaHeart />
                </button>
              )}
              <p className="text-xs flex justify-end lg:flex" onClick={toggleTimeFormat}>{time}</p>
            </div>
            <p className="text-[10px] text-sm text-lg">{date}</p>
          </div>
        </div>
      </nav>
      <div className='flex bg-blue-300 flex-col w-full h-screen bg-cover bg-center bg-no-repeat' style={{ backgroundImage: `url(${weatherImage} )` }}>
        <div className='relative flex sm:bg-red-00 lg:h-60 flex-col lg:mt-0 pr-2 sm:flex-col lg:flex-row items:end sm:justify-between justify-start lg:items-start overflow-hidden'>
          <div className='bg-green-00 flex lg:w-[85%] sm:hidden lg:h-70 lg:flex hidden sm:flex items-center px-2'>
            {loading ? (
              <Skeleton height={200} />
            ) : weather ? (
              <>
                <p className={`${textColorClass} lg:text-7xl sm:text-5xl flex flex-wrap ${poppins.className}`}>
                  {weatherDescription}
                </p>
              </>
            ) : null}
          </div>
          {/* ADDED: Apply ref here for smaller screens */}
          <div className="flex relative w-full bg-red-00 lg:hidden sm:hidden items-center justify-end gap-2 pl-[140px] text-sm py-2" ref={searchContainerRef}>
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
                    // ADDED: onFocus handler to show suggestions when input is focused
                    onFocus={() => {
                      if (city.length > 0) {
                        const filtered = cities.filter((c) =>
                          c.name.toLowerCase().startsWith(city.toLowerCase())
                        );
                        setSuggestions(filtered.slice(0, 10));
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        fetchWeather();
                        setCity('');
                        setSuggestions([]);
                      }
                    }}
                    className={`border border-gray-500 text-black bg-white rounded-lg px-3 py-1 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 ${poppins.className}`}
                  />

                  {suggestions.length > 0 && (
                    <ul className={`absolute bg-white text-black top-11 h-auto left-[140px] border border-gray-300 z-50 shadow-lg rounded-md ${poppins.className}`}>
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
                    setSuggestions([]);
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
                <p className={`text-6xl sm:text-7xl lg:text-9xl font-normal text-black ${textColorClass} ${poppins.className}`}>
                  {Math.round(weather.main.temp)}°
                </p>
              )}
            </div>
            <p className={`${textColorClass} text-[10px] sm:text-sm ${poppins.className}`}>
              {weather?.name && weather?.sys?.country
                ? `- ${weather.name}, ${weather.sys.country}`
                : ""}
            </p>
            <div className='lg:mt-1 sm:mt-1 text-end'>
              {loading ? (
                <>
                  <Skeleton height="30px" width="100px" />
                </>
              ) : (
                <p className={`${textColorClass} text-[6px] lg:text-[10px] sm:text-[8px] ${poppins.className}`}>
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
            <div className='bg-green-00 flex py-3 sm:flex lg:hidden justify-end items-center ml-2 sm:mt-20 sm:justify-start'>
              <p className={`bg-red-00 text-black sm:text-7xl text-5xl ${textColorClass} ${poppins.className}`}>

                {weatherDescription}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
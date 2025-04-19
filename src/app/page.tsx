'use client';
import { useState } from 'react';

export default function Home() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async () => {
    if (!city) return;
    setLoading(true);
    setWeather(null);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}`
      );
      const data = await response.json();

      if (data.cod === 200) {
        setWeather(data);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to fetch weather data");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 to-purple-500 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-6">Weather App</h1>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Enter city name"
          className="p-3 rounded text-black"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button
          onClick={fetchWeather}
          className="bg-white text-blue-600 px-4 py-3 rounded font-semibold"
        >
          {loading ? 'Loading...' : 'Get Weather'}
        </button>
      </div>

      {weather && (
        <div className="mt-10 bg-white text-blue-800 rounded-lg shadow-lg p-6 w-full max-w-md text-center">
          <h2 className="text-2xl font-bold">{weather.name}, {weather.sys.country}</h2>
          <p className="text-lg">{weather.weather[0].description}</p>
          <p className="text-4xl font-bold">{weather.main.temp}°C</p>
          <p>Humidity: {weather.main.humidity}%</p>
          <p>Wind: {weather.wind.speed} m/s</p>
        </div>
      )}
    </div>
  );
}

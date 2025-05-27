'use client';

import { JSX, useEffect, useState } from "react";

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

const getWeatherDescription = (
  temp: number,
  weatherMain: string,
  windSpeed: number
): string => {
  if (weatherMain.toLowerCase().includes('rain')) {
    if (temp > 30) return 'Hot and stormy with heavy rain';
    if (temp < 20) return 'Cold and rainy with strong winds';
    return 'Stormy with heavy rain';
  }

  if (weatherMain.toLowerCase().includes('cloud')) {
    if (temp > 25) return 'Warm and cloudy';
    if (temp < 15) return 'Cool and cloudy';
    return 'Cloudy day';
  }

  if (weatherMain.toLowerCase().includes('clear')) {
    if (temp > 40) return 'Extremely hot and sunny';
    if (temp > 30) return 'Hot and sunny';
    if (temp > 20) return 'Sunny with a gentle breeze';
    return 'Clear skies with pleasant temperature';
  }

  if (weatherMain.toLowerCase().includes('snow')) {
    return 'Snowy and freezing – bundle up!';
  }

  if (temp >= 18 && windSpeed > 6) return 'Cool wind blowing';
  if (temp >= 10 && temp < 18) return 'Pleasant and cool';
  if (temp < 10) return 'Cold weather – wear something warm';

  return 'Typical day with mild conditions';
};

const WeatherDescription = (): JSX.Element => {
  const [description, setDescription] = useState('Fetching weather...');

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
          );
          const data = await res.json();

          const temp = data.main.temp;
          const weatherMain = data.weather[0].main;
          const wind = data.wind.speed;

          const desc = getWeatherDescription(temp, weatherMain, wind);
          setDescription(desc);
        } catch (err) {
          setDescription('Error fetching weather data.');
        }
      },
      () => {
        setDescription('Location access denied.');
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return <div className="text-lg font-semibold mt-2">{description}</div>;
};

export default WeatherDescription;

const weatherApikey = process.env.NEXT_PUBLIC_WEATHER_API_KEY

export const getWeatherData = async (city: string) => {
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApikey}&units=metric`
    );

    const data = await response.json();
    return data.weather[0].main;
}


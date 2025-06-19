// In searchcity.tsx
import { useState } from 'react';
import { Poppins } from 'next/font/google';

// Define the 'City' type if not defined already
interface City {
    name: string;
    country: string;
    main: { temp: number };
    weather: [{ description: string }];
}

const poppins = Poppins({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-poppins'
});

interface SearchCityProps {
    onSelect: (city: City) => void;  // onSelect prop passed from parent
}

const SearchCity = ({ onSelect }: SearchCityProps) => {
    const [city, setCity] = useState('');
    const [weatherSuggestions, setWeatherSuggestions] = useState<City[]>([]);

    const handleSearch = async () => {
        if (city) {
            const res = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}`
            );
            const data = await res.json();
            onSelect(data);  // Call onSelect to pass selected city data back to parent
        }
    };

    const handleCityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value;
        setCity(query);

        if (query.length > 2) {
            // Optionally fetch city suggestions if needed
            // Example of fetching suggestions
            // const suggestions = await fetchCitySuggestions(query);
            // setWeatherSuggestions(suggestions);
        }
    };

    return (
        <div className='flex bg-red-00 lg:flex sm:flex items-center gap-2 px-4 text-sm hidden sm:block lg:block'>
            <input
                type="text"
                value={city}
                onChange={handleCityChange}
                placeholder="Enter city"
                className={`border border-gray-500 rounded-lg px-3 py-1 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 ${poppins.className}`}
            />
            <button className='bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-all text-xs ${poppins.className'
                onClick={handleSearch}>Search</button>

            {weatherSuggestions.length > 0 && (
                <ul>
                    {weatherSuggestions.map((suggestion, index) => (
                        <li key={index} onClick={() => onSelect(suggestion)}>
                            {suggestion.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchCity;

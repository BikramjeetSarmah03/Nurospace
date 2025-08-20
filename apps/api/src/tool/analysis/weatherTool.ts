// Tool: Get current weather for a city (requires API key)
import fetch from "node-fetch";

/**
 * Fetches current weather for a given city using OpenWeatherMap API.
 * @param city The city name (e.g., 'London')
 * @param apiKey Your OpenWeatherMap API key
 * @returns Weather description and temperature in Celsius
 */
export async function getCurrentWeather(city: string, apiKey: string) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch weather");
  const data = await res.json();
  return {
    description: data.weather?.[0]?.description || "No description",
    temperature: data.main?.temp || null,
    city: data.name || city,
  };
}


import { useEffect, useState } from 'react'
import {
  Search,
  MapPin,
  Sun,
  Cloud,
  CloudRain,
  CloudSun,
  Wind,
  Droplets
} from 'lucide-react'

function App() {
  const [city, setCity] = useState('Ilorin')
  const [search, setSearch] = useState('')
  const [weather, setWeather] = useState(null)
  const [place, setPlace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Get weather information from Open-Meteo
  async function getWeather(cityName) {
    try {
      setLoading(true)
      setError('')

      // Search for the city
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=en&format=json`
      )

      const geoData = await geoResponse.json()

      if (!geoData.results) {
        throw new Error('City not found. Try another city.')
      }

      const location = geoData.results[0]

      // Get the weather using the city coordinates
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&forecast_days=7`
      )

      if (!response.ok) {
        throw new Error('Could not get weather information.')
      }

      const data = await response.json()

      setWeather(data)
      setPlace(location)
      setCity(location.name)

    } catch (err) {
      setError(err.message)
      setWeather(null)
    } finally {
      setLoading(false)
    }
  }

  // Load weather when the app opens
  useEffect(() => {
    getWeather('Ilorin')
  }, [])

  // Search for another city
  function handleSearch(e) {
    e.preventDefault()

    if (search.trim() !== '') {
      getWeather(search.trim())
      setSearch('')
    }
  }

  // Get a weather icon
  function getWeatherIcon(code) {
    if (code === 0) return <Sun size={28} color="orange" />

    if (code === 1 || code === 2) {
      return <CloudSun size={28} color="orange" />
    }

    if (code === 3) return <Cloud size={28} color="gray" />

    if (code >= 51 && code <= 82) {
      return <CloudRain size={28} color="blue" />
    }

    if (code >= 95) {
      return <CloudRain size={28} color="blue" />
    }

    return <Cloud size={28} color="gray" />
  }

  const current = weather?.current
  const hourly = weather?.hourly
  const daily = weather?.daily

  // Get the next 8 hours
  const nextHours = hourly && current
    ? hourly.time
        .map((time, index) => ({ time, index }))
        .filter(item => item.time >= current.time)
        .slice(0, 8)
    : []

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">

      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">

          <div>
            <h1 className="text-3xl font-bold text-blue-600">
              Weatherly
            </h1>
            <p className="text-gray-500">
              Check the weather in your city
            </p>
          </div>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="flex bg-white p-2 rounded-lg shadow-sm w-full sm:w-80"
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Enter city name"
              className="w-full outline-none px-2 text-gray-700"
            />

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
            >
              <Search size={20} />
            </button>
          </form>

        </header>

        {/* Error message */}
        {error && (
          <p className="bg-red-100 text-red-600 p-3 rounded-lg mb-5">
            {error}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <p className="text-center text-gray-500 py-10">
            Loading weather...
          </p>
        )}

        {/* Weather information */}
        {!loading && current && (
          <>

            {/* Current weather */}
            <section className="bg-white rounded-xl shadow-sm p-6 mb-6">

              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={18} />
                <h2 className="text-xl font-semibold">
                  {place?.name}, {place?.country}
                </h2>
              </div>

              <p className="text-gray-400 mt-2">
                {new Date(current.time).toDateString()}
              </p>

              <div className="flex items-center gap-6 mt-6">

                <div className="text-6xl font-bold text-gray-800">
                  {Math.round(current.temperature_2m)}°
                </div>

                <div>
                  {getWeatherIcon(current.weather_code)}

                  <p className="text-gray-600 mt-2">
                    Feels like {Math.round(current.apparent_temperature)}°
                  </p>
                </div>

              </div>

              <hr className="my-6" />

              {/* Weather details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">

                <div>
                  <Droplets className="text-blue-500 mb-2" />
                  <p className="text-gray-500 text-sm">Humidity</p>
                  <p className="font-semibold text-gray-800">
                    {current.relative_humidity_2m}%
                  </p>
                </div>

                <div>
                  <Wind className="text-blue-500 mb-2" />
                  <p className="text-gray-500 text-sm">Wind Speed</p>
                  <p className="font-semibold text-gray-800">
                    {current.wind_speed_10m} km/h
                  </p>
                </div>

                <div>
                  <Sun className="text-orange-400 mb-2" />
                  <p className="text-gray-500 text-sm">Weather Code</p>
                  <p className="font-semibold text-gray-800">
                    {current.weather_code}
                  </p>
                </div>

              </div>

            </section>

            {/* Hourly forecast */}
            <section className="bg-white rounded-xl shadow-sm p-6 mb-6">

              <h2 className="text-xl font-bold text-gray-800 mb-5">
                Today's Forecast
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">

                {nextHours.map(({ time, index }) => (

                  <div
                    key={time}
                    className="text-center bg-slate-50 rounded-lg p-3"
                  >

                    <p className="text-sm text-gray-500">
                      {new Date(time).toLocaleTimeString([], {
                        hour: 'numeric'
                      })}
                    </p>

                    <div className="flex justify-center my-3">
                      <CloudSun size={25} className="text-orange-400" />
                    </div>

                    <p className="font-bold text-gray-800">
                      {Math.round(hourly.temperature_2m[index])}°
                    </p>

                    <p className="text-xs text-blue-500 mt-1">
                      {hourly.precipitation_probability[index] ?? 0}% rain
                    </p>

                  </div>

                ))}

              </div>

            </section>

            {/* 7 day forecast */}
            <section className="bg-white rounded-xl shadow-sm p-6 mb-6">

              <h2 className="text-xl font-bold text-gray-800 mb-5">
                7-Day Forecast
              </h2>

              <div className="space-y-4">

                {daily.time.map((date, index) => (

                  <div
                    key={date}
                    className="flex justify-between items-center border-b pb-3"
                  >

                    <p className="text-gray-600 w-1/3">
                      {new Date(date + 'T12:00:00').toLocaleDateString(
                        'en',
                        { weekday: 'long' }
                      )}
                    </p>

                    <div className="flex justify-center w-1/3">
                      {getWeatherIcon(daily.weather_code[index])}
                    </div>

                    <p className="font-semibold text-gray-800">
                      {Math.round(daily.temperature_2m_max[index])}°
                      <span className="text-gray-400 ml-2">
                        {Math.round(daily.temperature_2m_min[index])}°
                      </span>
                    </p>

                  </div>

                ))}

              </div>

            </section>

            {/* Sunrise and sunset */}
            <section className="grid sm:grid-cols-2 gap-5 mb-6">

              <div className="bg-white rounded-xl shadow-sm p-5">
                <p className="text-gray-500">Sunrise</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-2">
                  {new Date(daily.sunrise[0]).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </h3>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-5">
                <p className="text-gray-500">Sunset</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-2">
                  {new Date(daily.sunset[0]).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </h3>
              </div>

            </section>

          </>
        )}

        <footer className="text-center text-gray-400 text-sm py-5">
          Weatherly App
        </footer>

      </div>
    </div>
  )
}

export default App;

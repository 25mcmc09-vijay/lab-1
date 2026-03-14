import { useState, useEffect } from 'react'

const API_KEY = import.meta.env.VITE_WEATHERAPI_KEY || 'e398c202c0f7421cb59115009230410'

function App() {
  const [city, setCity] = useState("Indore")
  const [searchInput, setSearchInput] = useState('')
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchWeather = async (cityName) => {
    if (!API_KEY) {
      setError('API key missing. Set VITE_WEATHERAPI_KEY in .env')
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(cityName)}&days=5`
      const res = await fetch(url)
      const data = await res.json()
      if (!res.ok) {
        if (data.error?.code === 1006) {
          throw new Error(`City "${cityName}" not found. Try another name.`)
        }
        throw new Error(data.error?.message || 'Something went wrong.')
      }
      setWeather({ current: data.current, location: data.location })
      setForecast(data.forecast)
    } catch (err) {
      setWeather(null)
      setForecast(null)
      setError(err.message || 'Could not fetch weather. Try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeather(city)
  }, [city])

  const handleSearch = (e) => {
    e.preventDefault()
    const trimmed = searchInput.trim()
    if (trimmed) {
      setCity(trimmed)
      setSearchInput('')
    }
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const formatDate = (str) => {
    const d = new Date(str)
    return dayNames[d.getDay()] + ' ' + str.slice(5)
  }

  const forecastDays = forecast?.forecastday?.slice(0, 5) ?? []

  return (
    <div className="page">
      <header className="top">
        <h1>Weather</h1>
        <form className="search" onSubmit={handleSearch}>
          <input
            type="text"
            className="city-input"
            placeholder="City name"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="search-button">Search</button>
        </form>
      </header>

      {loading && <div className="loading">Loading...</div>}

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && !error && weather && (
        <>
          <section className="today">
            <h2>{weather.location?.name}, {weather.location?.country}</h2>
            <div className="today-row">
              <div className="temperature">
                <span className="temperature-number">{Math.round(weather.current.temp_c)}</span>
                <span className="temperature-unit">°C</span>
              </div>
              <div className="condition">
                <img
                  src={`https:${weather.current.condition.icon}`}
                  alt=""
                  className="condition-icon"
                />
                <span className="condition-text">{weather.current.condition.text}</span>
              </div>
            </div>
            <ul className="details">
              <li><strong>Humidity</strong> {weather.current.humidity}%</li>
              <li><strong>Feels like</strong> {Math.round(weather.current.feelslike_c)}°C</li>
              <li><strong>Wind</strong> {weather.current.wind_kph} km/h</li>
              <li><strong>Pressure</strong> {weather.current.pressure_mb} mb</li>
            </ul>
          </section>

          {forecastDays.length > 0 && (
            <section className="next-days">
              <h3>Next 5 days</h3>
              <div className="days">
                {forecastDays.map((d) => (
                  <div key={d.date} className="day">
                    <div className="day-date">{formatDate(d.date)}</div>
                    <img
                      src={`https:${d.day.condition.icon}`}
                      alt=""
                      className="day-icon"
                    />
                    <div className="day-temp">{d.day.avgtemp_c.toFixed(0)}°C</div>
                    <div className="day-condition">{d.day.condition.text}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

export default App

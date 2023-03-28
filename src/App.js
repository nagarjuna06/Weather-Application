import { useEffect, useState } from 'react'
import { IoSearch } from 'react-icons/io5'
import { BiWater, BiWind } from 'react-icons/bi'
import { apiKey, ApiStatusConstants } from './config'
import notFoundImage from './images/404.png'
import { weatherImages } from './config'
import { cities } from './citynames'

import './App.css'
import { findRenderedComponentWithType } from 'react-dom/test-utils'

const App = () => {
  const getLocation = localStorage.getItem('location');
  let location;
  if (getLocation !== null) {
    location = getLocation
  }
  else {
    location = 'tirupati'
  }


  const [search, setSearch] = useState(location);
  const [apiStatus, setApiStatus] = useState('');
  const [containerHeight, setContainerHeight] = useState(90)
  const [weatherData, setWeatherData] = useState([]);
  const [btnText, setBtnText] = useState('save location');
  const [required, setRequried] = useState(false);
  const [cityNames, setCityNames] = useState([]);
  useEffect(() => {
    setTimeout(sendToApi, 400)
  }, [])


  const sendToApi = async (cityName) => {
    if (cityName === undefined) {
      cityName = search
      if (cityName === '') {
        setRequried(true)
        return
      }
    }
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${apiKey}`)
    const response = await res.json()
    if (res.status === 404) {
      setApiStatus(ApiStatusConstants.failure)
      setContainerHeight(400)
    }
    else {
      setContainerHeight(600);
      setApiStatus(ApiStatusConstants.success);
      setWeatherData(response);
      if (location === response.name) {
        setBtnText('saved')
      }
      else {
        setBtnText('save location')
      }
    }
  }
  const saveLocation = () => {
    localStorage.setItem('location', weatherData.name)
    setBtnText('saved')
  }
  const notFound = () => {
    return (
      <div className="not-found fade-in">
        <img src={notFoundImage} alt="notfound" />
        <p>Oops! Invalid Location:</p>
      </div>
    )
  }
  const getWeather = () => {
    const mood = weatherData.weather[0].main
    const temp = parseInt(weatherData.main.temp)
    const description = weatherData.weather[0].description
    const Humidity = weatherData.main.humidity
    const windSpeed = parseInt(weatherData.wind.speed)
    const locationName = weatherData.name
    return (
      <>
        <div className='content fade-in'>
          <h2>{locationName.toUpperCase()}</h2>
          <p>{new Date().toDateString()}</p>
        </div>
        <div className='result'>
          <div className="weather-container fade-in">
            <img src={weatherImages[mood]} alt={mood} />
            <h1>{`${temp} °C`}</h1>
            <p className="description">{description}</p>
          </div>

          <div className="weather-data">
            <div className='sub-container fade-in'>
              <BiWater className='icon' />
              <div className="text">
                <span>{Humidity}%</span>
                <p>Humidity</p>
              </div>
            </div>
            <div className='sub-container fade-in'>
              <BiWind className='icon' />
              <div className="text">
                <span>{windSpeed}Km/h</span>
                <p>Wind Speed</p>
              </div>
            </div>
            <button className='save-btn fade-in' onClick={saveLocation}>{btnText}</button>
          </div>
        </div>
      </>
    )

  }
  const inputValue = (e) => {
    const input = e.target.value
    if (input === '') {
      setCityNames([])
    }
    else {
      const filterNames = cities.filter(each => each.toLocaleLowerCase().includes(input.toLocaleLowerCase()))
      setCityNames(filterNames)
    }
    setRequried(false)
    setApiStatus(ApiStatusConstants.search)
    setContainerHeight(600)
    setSearch(input)
  }
  const searchCity = city => {
    setSearch(city)
    sendToApi(city)
  }
  const SearchList = () => {
    let count = 0;
    return (
      <div className='city-name-list'>
        {cityNames.map(each => {
          count++;
          return (<li className='city-name' key={count} onClick={() => searchCity(each)}>{each}</li>
          )
        }
        )}
      </div>
    )
  }
  const inputFocus = e => {
    e.target.value = ''
  }
  const result = () => {
    switch (apiStatus) {
      case ApiStatusConstants.initial: return null
      case ApiStatusConstants.success: return getWeather()
      case ApiStatusConstants.failure: return notFound()
      case ApiStatusConstants.search: return SearchList()
      default: return null
    }
  }
  return (
    <div className="bg-container">
      <div className='weather-app'
        style={{ height: `${containerHeight}px` }}>
        <div className='search-bar'>
          <img src={weatherImages.compass} className='location-icon' alt='location-icon' />
          <input className='input'
            onFocus={inputFocus}
            value={search}
            onChange={inputValue}
            onKeyDown={e => e.key === 'Enter' && sendToApi()}
            placeholder='Enter Your Location' />
          <IoSearch className='icon search-icon' onClick={() => sendToApi()} />
        </div>
        {required && <div className='error'>
          <p>*Requried</p>
        </div>}
        {result()}
      </div>
    </div>
  )
}
export default App
import logo from './logo.svg';
import './App.css';
import React, {useState, useEffect} from "react";

// require('dotenv').config();
const OW_API_KEY="fa3239392b965440e0b799fb5fe5fc36"

function App() {
  const [place, setPlace] = useState();
  const [listPlaces, setListPlaces] = useState([]);
  const [listPlacesHTML, setListPlacesHTML] = useState();
  const [selectedPlace, setSelectedPlace] = useState();
  const [currentData, setCurrentData] = useState();
  const [forecast, setForecast] = useState();

  let regionNames = new Intl.DisplayNames(['en'], {type: 'region'});

  useEffect(() => {
    setListPlacesHTML(listPlaces.map((place, index) => ListItem(place,index)));
  }, [listPlaces]);

  useEffect(() => {
    if (selectedPlace) {
      fetchWeather();
    }
  }, [selectedPlace]);
  useEffect(() => {
    console.log(currentData);
    console.log(forecast);
  }, [forecast]);

  function ListItem(place, index) {
    let classBtn;
    if (selectedPlace) {
      classBtn="list-group-item list-group-item-action active"
    } else{
      classBtn="list-group-item list-group-item-action"
    }
    return (
        <button key={index} className={classBtn} onClick={(e) => onPlaceSelect(place)}>
          <div className="align-items-center">
            <label className="form-check-label ms-1" >{place["name"]}, {regionNames.of(place["country"])}</label>
          </div>
        </button>
    );
  }

  function onPlaceSelect(place, index){
    setSelectedPlace(place);
    setListPlaces([place])

    // fetchWeather()
  }

  const fetchCity = async () => {
    try {
      const url=`http://api.openweathermap.org/geo/1.0/direct?q=${place},en}&limit=5&appid=${OW_API_KEY}`
      const response = await fetch(url);
      const jsonData = await response.json();
      if (jsonData.length ===0) {
        alert("Location not found")
      } else{
        setListPlaces(jsonData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchWeather = async () => {
    try {
      let url=`https://api.openweathermap.org/data/2.5/weather?lat=${selectedPlace["lat"]}&lon=${selectedPlace["lon"]}&units=metric&appid=${OW_API_KEY}`
      let response = await fetch(url);
      let jsonData = await response.json();
      setCurrentData(jsonData);

      url=`https://api.openweathermap.org/data/2.5/forecast?lat=${selectedPlace["lat"]}&lon=${selectedPlace["lon"]}&units=metric&appid=${OW_API_KEY}`
      response = await fetch(url);
      jsonData = await response.json();
      setForecast(jsonData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  function OnSubmit(e) {
    e.preventDefault();
    // setPlace(e.target.value);
    setSelectedPlace();
    fetchCity()
  }

  function onInputChange(e) {
    setPlace(e.target.value);
  }


  return (
      <>
        {/*input*/}
        <h1 className="d-flex justify-content-center pt-2">Weather</h1>
        <div className="mt-n1">
          <div className="d-flex justify-content-center">
            <form className="row g-3" onSubmit={(e) => OnSubmit(e)}>
              <input
                  className="col-auto form-control"
                  placeholder='Where are you interested in?'
                  id=""
                  type="text"
                  value={place}
                  onChange={(e) => onInputChange(e)}
              />
              <button
                  type="submit"
                  className="btn btn-primary mb-3"
              >
                <span className="ml-3">Get Weather</span>
              </button>
            </form>
          </div>
        </div>
        {/*ListOfChoices*/}
        <div className="mt-1 container">
          <div className="row justify-content-center ">
            <div className="col-md-8">
              <ul className="list-group">{listPlacesHTML}</ul>
            </div>
          </div>
        </div>
      </>
  );
}

export default App;

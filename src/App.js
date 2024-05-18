import logo from './logo.svg';
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import './App.css';
import React, {useState, useEffect} from "react";
import {Line} from "react-chartjs-2";

Chart.register(CategoryScale);

// require('dotenv').config();
const OW_API_KEY="fa3239392b965440e0b799fb5fe5fc36"

function App() {
  const [place, setPlace] = useState();
  const [listPlaces, setListPlaces] = useState([]);
  const [listPlacesHTML, setListPlacesHTML] = useState();
  const [selectedPlace, setSelectedPlace] = useState();
  const [currentData, setCurrentData] = useState();
  const [forecast, setForecast] = useState();
  const [rain, setRain] = useState();
  const [snow, setSnow] = useState();
  const [chartData, setChartData] = useState()
  const [chartRange, setChartRange] = useState([0,39]);
  const [chartType, setChartType] = useState("Temperature");

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
    if(forecast) {
      processChart()
    }
  }, [forecast, chartType]);

  function ListItem(place, index) {
    let classBtn;
    if (selectedPlace) {
      classBtn="list-group-item list-group-item-action active"
    } else {
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
      setForecast(jsonData["list"]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  function OnSubmit(e) {
    e.preventDefault();
    setRain();
    setCurrentData();
    setForecast();
    setSnow();
    setChartData();
    // setPlace(e.target.value);
    setSelectedPlace();
    fetchCity()
  }

  function onInputChange(e) {
    setPlace(e.target.value);
  }

  function ProcessData(){
    if (currentData) {
      if(!currentData["rain"]){
        setRain(0)
      } else{
        setRain(currentData["rain"]["1h"])
      } if(!currentData["snow"]) {
        setSnow(0)
      } else {
        setSnow(currentData["snow"]["1h"])
      }
      return (<>
        <div className="card mb-3 mx-5 text-bg-secondary" >
          <div className="row g-0">
            <div className="col-md-4 ms-5 mt-5">
              <h1 className="display-1">{currentData["main"]["temp"]}ºC</h1>
            </div>
            <div className="col">
              <div className="card-body">
                <h5 className="card-title">{selectedPlace["name"]}, {regionNames.of(selectedPlace["country"])} {convertToTime(currentData["dt"] + currentData["timezone"])}.</h5>
                {/*<h5 className="card-title text-end">{selectedPlace["name"]}, {regionNames.of(selectedPlace["country"])}.</h5>*/}
                <p className="card-text">{currentData["weather"]["0"]["description"]}</p>
                {/*<p className="card-text">{currentData["weather"]["0"]["main"]}</p>*/}
                {/*1st row*/}
                <div className="row">
                  <div className="col-md-3">
                    {/*<p className="card-text"><small className="text-body-secondary">Feels like: {currentData["main"]["feels_like"]}ºC</small></p>*/}
                    <p>Feels like: {currentData["main"]["feels_like"]}ºC</p>
                  </div>
                  <div className="col-md-3">
                    <p>Humidity: {currentData["main"]["humidity"]}%</p>
                  </div>
                  <div className="col-md-3">
                    <p>Wind: {currentData["wind"]["speed"]}km/h</p>
                  </div>
                  <div className="col-md-3">
                    <p>Cloudiness: {currentData["clouds"]["all"]}%</p>
                  </div>
                </div>
                {/*2nd row*/}
                <div className="row">
                  <div className="col-md-3">
                    {/*<p className="card-text"><small className="text-body-secondary">Feels like: {currentData["main"]["feels_like"]}ºC</small></p>*/}
                    <p>Sunrise: {convertToTime(currentData["sys"]["sunrise"] + currentData["timezone"])}</p>
                  </div>
                  <div className="col-md-3">
                    <p>Sunset: {convertToTime(currentData["sys"]["sunset"] + currentData["timezone"])}</p>
                  </div>
                  <div className="col-md-3">
                    <p>Rain: {rain}mm</p>
                  </div>
                  <div className="col-md-3">
                    <p>Snow: {snow}mm</p>
                  </div>
                </div>
                <p className="card-text"><small className="text-body-secondary">Last
                  updated {getMinutes(currentData["dt"])} mins ago</small></p>
              </div>
            </div>
            {/*<div className="col-md-4">*/}
            {/*  <img src="..." className="img-fluid rounded-start" alt="..."/>*/}
            {/*</div>*/}

          </div>
        </div>
      </>);
    } else {
      return <></>
    }
  }

  function processChart() {
    let color;
    if (chartType === "Temperature") {
      color = "gold"
    } else if (chartType === "Clouds") {
      color = "black"
    } else if (chartType === "Rain") {
      color = "blue"
    } else if (chartType === "Humidity") {
      color = "blue"
    } else if (chartType === "Wind") {
      color = "black"
    }


    setChartData({
      labels: forecast.slice(chartRange[0], chartRange[1]).map((data) => convertToChartTime(data['dt'] + currentData["timezone"])),
      datasets: [
        {
          label: "",
          data: forecast.slice(chartRange[0], chartRange[1]).map((data) => getWindOrCloudOrTemp(data)),
          backgroundColor: [
            "#ecf0f1",
          ],
          borderColor: color,
          borderWidth: 2
        }
      ]
    })
  }

  function getWindOrCloudOrTemp(item) {
    if (chartType === "Temperature") {
      return item["main"]["temp"];
    } else if (chartType === "Clouds") {
      return item["clouds"]["all"];
    } else if (chartType === "Rain") {
      if (!item["rain"]) {
        return 0;
      } else {
        return item["rain"]["3h"];
      }
    } else if (chartType === "Humidity") {
      return item["main"]["humidity"];
    } else if (chartType === "Wind") {
      return item["wind"]["speed"];
    }
  }

  function LineChart() {
    if (chartData) {
      return (
          <div className="chart-container mx-2 mb-5">
            <h2 style={{textAlign: "center"}}>{chartType}</h2>
            <Line
                data={chartData}
                options={{
                  plugins: {
                    title: {
                      display: true,
                      text: `${chartType} for the next 5 days in ${selectedPlace["name"]}, ${regionNames.of(selectedPlace["country"])}.`
                    },
                    legend: {
                      display: false
                    }
                  }
                }}
            />
          </div>
      );
    } else {
      return <></>
    }
  }


  function convertToTime(epoch) {
    const date = new Date(epoch * 1000);
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    hours = hours.toString().padStart(2, '0');

    const timeString = `${hours}:${minutes}:${seconds} ${ampm}`;
    return timeString;
  }

  function convertToChartTime(epoch) {
    const date = new Date(epoch * 1000);
    let hours = date.getUTCHours();
    // const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    // const seconds = date.getUTCSeconds().toString().padStart(2, '0');

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    hours = hours.toString().padStart(2, '0');

    const timeString = `${hours} ${ampm}`;
    return timeString;
  }

  function getMinutes(epoch){
    const now = new Date;
    const minutes = Math.floor((now-(epoch*1000)) / (1000 * 60));
    return minutes
  }

  function Buttons(){
    if (chartData) {
      return (<div className="btn-group d-flex justify-content-center mx-2 mb-2" role="group"
                   aria-label="Basic radio toggle button group">
                <input type="radio" className="btn-check" name="btnradio" id="btnradio1" autoComplete="off" checked={chartType==="Temperature"}/>
                <label className="btn btn-outline-primary" htmlFor="btnradio1"
                       onClick={() => (setChartType("Temperature"))}>Temperature</label>

                <input type="radio" className="btn-check" name="btnradio" id="btnradio2" autoComplete="off" checked={chartType==="Rain"}/>
                <label className="btn btn-outline-primary" htmlFor="btnradio2"
                       onClick={() => (setChartType("Rain"))}>Rain</label>

                <input type="radio" className="btn-check" name="btnradio" id="btnradio3" autoComplete="off" checked={chartType==="Wind"}/>
                <label className="btn btn-outline-primary" htmlFor="btnradio3"
                       onClick={() => (setChartType("Wind"))}>Wind</label>
                <input type="radio" className="btn-check" name="btnradio" id="btnradio4" autoComplete="off" checked={chartType==="Humidity"}/>
                <label className="btn btn-outline-primary" htmlFor="btnradio4"
                       onClick={() => (setChartType("Humidity"))}>Humidity</label>
                <input type="radio" className="btn-check" name="btnradio" id="btnradio5" autoComplete="off" checked={chartType==="Clouds"}
                       onClick={() => (setChartType("Clouds"))}/>
                <label className="btn btn-outline-primary" htmlFor="btnradio5">Clouds</label>
              </div>);
    } else{
      return <></>;
    }
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
                <ul className="list-group mb-2">{listPlacesHTML}</ul>
              </div>
            </div>
          </div>
          {/*Info*/}
          <ProcessData/>
          <Buttons/>
          <LineChart/>
          {/*testing*/}
        </>
    );
  }

  export default App;

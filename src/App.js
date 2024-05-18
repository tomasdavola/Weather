import logo from './logo.svg';
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import LineChart from "./components/LineChart";
import { Data } from "./utils/Data";
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
  const [chartColor, setChartColor] = useState("gold");

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
                <p> {currentData["weather"]["0"]["description"]}</p>
                <p> {currentData["main"]["temp"]}º</p>
                <p>Feels like: {currentData["main"]["feels_like"]}º</p>
                <p>Humidity: {currentData["main"]["humidity"]}%</p>
                <p>Wind: {currentData["wind"]["speed"]}km/h</p>
                <p>Sunrise: {convertToTime(currentData["sys"]["sunrise"] + currentData["timezone"])}</p>
                <p>Sunset: {convertToTime(currentData["sys"]["sunset"] + currentData["timezone"])}</p>
                <p>Rain: {rain}mm</p>
                <p>Snow: {snow}mm</p>
                <p>Cloudiness: {currentData["clouds"]["all"]}%</p>
      </>);
    } else {
        return <></>
      }
    }

  function processChart(){
    let color;
    if (chartType==="Temperature"){
      color = "gold"
    } else if (chartType==="Clouds"){
      color = "black"
    } else if (chartType==="Rain"){
      color = "blue"
    } else if (chartType==="Humidity"){
      color = "blue"
    } else if (chartType==="Wind"){
      color = "black"
    }


    setChartData({
      labels: forecast.slice(chartRange[0], chartRange[1]).map((data) => convertToChartTime(data['dt']+ currentData["timezone"])),
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

  function getWindOrCloudOrTemp(item){
    if (chartType==="Temperature"){
      return item["main"]["temp"];
    } else if (chartType==="Clouds"){
        return item["clouds"]["all"];
    } else if (chartType==="Rain"){
        if(!item["rain"]){
          return 0;
        } else {
          return item["rain"]["3h"];
        }
    } else if (chartType==="Humidity"){
        return item["main"]["humidity"];
    } else if (chartType==="Wind"){
      return item["wind"]["speed"];
    }
  }

  function LineChart() {
    if (chartData) {
      return (
          <div className="chart-container">
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
    }
    else {
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
        <hr/>
        {/*Info*/}
        <ProcessData/>
        <div className="btn-group" role="group" aria-label="Basic radio toggle button group">
          <input type="radio" className="btn-check" name="btnradio" id="btnradio1" autoComplete="off"/>
          <label className="btn btn-outline-primary" htmlFor="btnradio1"
                 onClick={() => (setChartType("Temperature"))}>Temperature</label>

          <input type="radio" className="btn-check" name="btnradio" id="btnradio2" autoComplete="off"/>
          <label className="btn btn-outline-primary" htmlFor="btnradio2"
                 onClick={() => (setChartType("Rain"))}>Rain</label>

          <input type="radio" className="btn-check" name="btnradio" id="btnradio3" autoComplete="off"/>
          <label className="btn btn-outline-primary" htmlFor="btnradio3"
                 onClick={() => (setChartType("Wind"))}>Wind</label>
          <input type="radio" className="btn-check" name="btnradio" id="btnradio4" autoComplete="off"/>
          <label className="btn btn-outline-primary" htmlFor="btnradio4"
                 onClick={() => (setChartType("Humidity"))}>Humidity</label>

          <input type="radio" className="btn-check" name="btnradio" id="btnradio5" autoComplete="off"
                 onClick={() => (setChartType("Clouds"))}/>
          <label className="btn btn-outline-primary" htmlFor="btnradio5">Clouds</label>
        </div>
        <LineChart/>
      </>
  );
}

export default App;

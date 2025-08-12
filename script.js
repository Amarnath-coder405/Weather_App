const apikey ="#";
const weatherApiUrl = "#";
const forecastApiUrl = "#";
const searchBox=document.querySelector(".search input");
const searchBtn=document.querySelector(".search button");
const locationBtn = document.getElementById("locationBtn");
const weatherIcon=document.querySelector(".weather-icon");
const celsiusBtn=document.querySelector(".celsius-btn");
const fahrenheitBtn=document.querySelector(".fahrenheit-btn");
const forecastContainer=document.getElementById("forecast");
let currentUnit="celsius";
let currentData=null;

//Check weather for a city
async function checkWeather(city) {
  try {
    const weatherResponse = await fetch(weatherApiUrl + city + `&appid=${apikey}`);
    
    if (weatherResponse.status == 404){
      throw new Error("City not found");
    }

    const weatherData = await weatherResponse.json();

    //Fetch forecast data
    const forecastResponse = await fetch(forecastApiUrl + city + `&appid=${apikey}`);
    const forecastData =await forecastResponse.json();
    
    currentData = {
      weather: weatherData,
      forecast:forecastData
    };

    updateWeatherDisplay();
    document.querySelector(".weather").style.display = "block";
    document.querySelector(".error").style.display="none";
  } catch(error){
    document.querySelector(".error").style.display = "block";
    document.querySelector(".weather").style.display="none";
    console.error("Error fetching weather data:", error);
  }
}
//update weather display based on current unit
function updateWeatherDisplay() {
  if (!currentData) return;
  const weatherData = currentData.weather;
  const forecastData = currentData.forecast;

  document.querySelector(".city").innerHTML = "Delhi";

  if (currentUnit === "celsius"){
    document.querySelector(".temp").innerHTML=Math.round(weatherData.main.temp) + "C";
    document.querySelector(".wind").innerHTML=weatherData.wind.speed + "km/h";
  } else{
    const tempF = (weatherData.main.temp * 9/5) + 32;
    const windMph = weatherData.wind.speed * 0.621371;
    document.querySelector(".temp").innerHTML= Math.round(tempF) + "F";
    document.querySelector(".wind").innerHTML=windMph.toFixed(1) + "mph";
  }

  document.querySelector(".humidity").innerHTML = weatherData.main.humidity + "%";

  //update weather icon
  const weatherMain = weatherData.weather[0].main;
  if (weatherMain === "Clouds"){
    weatherIcon.src = "weather.png";
  } else if (weatherMain === "Clear"){
    weatherIcon.src = "clear.png";
  } else if (weatherMain === "Rain") {
    weatherIcon.src = "rain.png";
  } else if (weatherMain === "Drizzle") {
    weatherIcon.src = "drizzle.png";
  } else if (weatherMain === "Mist") {
    weatherIcon.src = "mist.png";
  } else if (weatherMain === "Snow") {
    weatherIcon.src = "snow.png";
  }

  //Update forecast
  updateForecastDisplay(forecastData);
}

//Update 5-day forecast display
function updateForecastDisplay(forecastData) {
  forecastContainer.innerHTML="";

  //Get unique days (API returns data every 3 hours, we take one per day)
  const dailyForecasts = [];
  const datesAdded = new Set();

  forecastData.list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if (!datesAdded.has(date) && dailyForecasts.length < 5) {
      datesAdded.add(date);
      dailyForecasts.push(item);
    }
  });

  dailyForecasts.forEach(day=>{
    const date = new Date(day.dt * 1000);
    const dayName = date.toLocaleDateString("en-US", {weekday: "short"});

    const temp = currentUnit === "celsius"
      ? Math.round(day.main.temp) + "C"
      : Math.round((day.main.temp * 9/5)+32) + "F";

    const forecastDay = document.createElement("div");
    forecastDay.className = "forecast-day";
    forecastDay.innerHTML =`
      <p>${dayName}</p>
      <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}">
      <p>${temp}</p>
    `;

    forecastContainer.appendChild(forecastDay);
  });
}

// GET weather by geolocation
function getWeatherByLocation() {
  if (navigator.geolocation){
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const weatherResponse = await fetch(
             `https://api.openweathermap.org/data/2.5/weather?units=metric&lat=${lat}&lon=${lon}&appid=${apikey}`
          );
          const weatherData = await fetch(
               `https://api.openweathermap.org/data/2.5/forecast?units=metric&lat=${lat}&lon=${lon}&appid=${apikey}`
          );
          const forecastData = await forecastResponse.json();

          currentData={
            weather:weatherData,
            forecast:forecastData
          };

          updateWeatherDisplay();
          document.querySelector(".weather").style.display = "block";
          document.querySelector(".error").style.display = "none";
          searchBox.value = weatherData.name;
        } catch (error) {
          document.querySelector(".error").innerHTML="Error getting location data. Please try searching manually.";
          document.querySelector(".error").style.display="block";
          document.querySelector(".weather").style.display="none";
          console.error("Error fetching weather data:", error);
        }
      },
      (error) =>{
        console.error("Geolocation error:", error);
        document.querySelector(".error").innerHTML="Geolocation blocked. Please enable it or search manually.";
        document.querySelector(".error").style.display="block";
      }
    );
  } else {
    document.querySelector(".error").innerHTML="Geolocation is not supported by your browser.";
    document.querySelector(".error").style.display = "block";
  }
}

// Event Listeners
searchBtn.addEventListener("click", () => {
  if (searchBox.value.trim() !== ""){
    checkWeather(searchBox.value);
  }
});

searchBox.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && searchBox.value.trim() !== ""){
    checkWeather(searchBox.value);
  }
});

locationBtn.addEventListener("click", () => {
  getWeatherByLocation();
});

celsiusBtn.addEventListener("click", () =>{
  if (currentUnit !== "celsius"){
    currentUnit = "celsius";
    celsiusBtn.classList.add("active");
    fahrenheitBtn.classList.remove("active");
    updateWeatherDisplay();
  }
});

fahrenheitBtn.addEventListener("click", () => {
  if (currentUnit !== "fahrenheit") {
    currentUnit = "fahrenheit";
    fahrenheitBtn.classList.add("active");
    celsiusBtn.classList.remove("active");
    updateWeatherDisplay();
  }
});

const toggleBtn = document.getElementById('modeToggleBtn');
const body = document.body;

let isDarkMode = false;

const lightBg = "";
const darkBg = "url('https://th.bing.com/th/id/R.0fece75e3b87cf28268724e960462c71?rik=K8Li0QvmFpvzBw&riu=http%3a%2f%2fgetwallpapers.com%2fwallpaper%2ffull%2f0%2f2%2f3%2f673465.jpg&ehk=9DQAh1LPw5Ir67y9XBd5%2bbg7MAZp0aRvihdD1%2bZQEe8%3d&risl=&pid=ImgRaw&r=0')";

toggleBtn.addEventListener('click', () => {
  isDarkMode = !isDarkMode;

  if (isDarkMode){
    body.style.backgroundImage = darkBg;
    toggleBtn.textContent = '☀️'; // Change to sun icon
  } else {
    body.style.backgroundImage = lightBg;
    toggleBtn.textContent = '🌙'; // Change to moon icon
  }
});


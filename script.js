document.addEventListener("DOMContentLoaded", function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        currentLocationDataFetch(position);
      },
      (err) => {
        console.log(err);
      }
    );
  }
  // input field and button for input location
  let cityInput = document.getElementById("city-input");
  let searchButton = document.getElementById("search-button");

  // current location button
  let currentLocation = document.getElementById("current-location");

  // current weather report card
  let cityName = document.getElementById("city-name");
  let temp = document.getElementById("temperature");
  let windSpeed = document.getElementById("wind-speed");
  let humidity = document.getElementById("humidity");
  let weatherStatusImg = document.getElementById("weather-status-img");
  let weatherStatus = document.getElementById("weather-status");
  let weatherSummary = document.getElementById("weather-summary");

  // daily weather update container
  let weeklyCardContainer = document.getElementById("weekly-cards");

  // API ket Open Weather Application
  let api_key = "c8c540bb57f17a4117c17416ba3ea340";

  // function for fetching data from open weather API
  async function fetchData(city) {
    let data = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_key}`
    );
    let newData = await data.json();
    return newData;
  }

  // function for fetching daily weather report

  async function fetchDailyReport(city) {
    // api call for getting latitude and longitude for city
    let locationData = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${api_key}`
    );
    let coordinates = await locationData.json();
    let lat = coordinates[0].lat;
    let lon = coordinates[0].lon;

    //api call getting current data

    let data = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=current,minutesly,hourly,alerts&appid=${api_key}`
    );
    let newData = await data.json();
    return newData;
  }

  // Event listener for searching data for input city and dispalying the relevent data
  searchButton.addEventListener("click", async function () {
    let cityInputValue = cityInput.value.trim().toLowerCase();
    let cityData = await fetchDailyReport(cityInputValue);

    inputValueInMainCard(cityData.daily[0], cityInputValue);
    weeklyCardContainer.innerHTML = "";
    dailyCardUpdate(cityData);
  });

  // function for setting the image for the status of current weather

  function setWeatherStatusImage(status) {
    let fileName = "";

    if (status === 800) {
      fileName = "clearSky";
    } else if (status > 800) {
      fileName = "scatteredClouds";
    } else if (status >= 200 && status < 300) {
      fileName = "thunderstorm";
    } else if (status >= 300 && status < 311) {
      fileName = "showerRain";
    } else if (status >= 311 && status < 400) {
      fileName = "rain";
    } else if (status >= 600 && status < 700) {
      fileName = "snow";
    } else if (status >= 700 && status < 800) {
      fileName = "scatteredClouds";
    } else {
      fileName = "clearSky";
    }
    return fileName;
  }

  // function for inputing values to the main card

  function inputValueInMainCard(cityData, city) {
    // for inputing data in the main card

    //   for date and city name
    let date = new Date(cityData.dt * 1000);
    cityName.innerText = `${city.toUpperCase()} (${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()})`;

    //   for temperature
    let tempInK = cityData.temp.day;
    temp.innerText = `Temperature: ${(tempInK - 273.15).toFixed(2)}°C/${(
      1.8 * (tempInK - 273.15) +
      32
    ).toFixed(2)}°F`;

    //   for humidity
    humidity.innerText = `Humidity: ${cityData.humidity}%`;

    // for Wind Speed
    windSpeed.innerText = `Wind Speed: ${cityData.wind_speed} m/s`;

    // for weather status
    weatherStatus.innerHTML = `${cityData.weather[0].description
      .trim()
      .toLowerCase()}`;

    weatherSummary.innerText = `${cityData.summary}`;

    let weatherStatusValue = cityData.weather[0].id;
    weatherStatusImg.src = `./animated/${setWeatherStatusImage(
      weatherStatusValue
    )}.svg`;
    weatherStatusImg.alt = `${cityData.weather[0].description}`;
  }

  // function for updating daily forcast cards
  async function dailyCardUpdate(cityData) {
    let dailydataArray = await cityData.daily;
    for (let i = 1; i <= 5; i++) {
      let currentDate = dailydataArray[i];
      let div = document.createElement("div");
      div.classList.add("card-style");
      //   for date and city name
      let date = new Date(currentDate.dt * 1000);

      //   for temperature
      let tempInK = currentDate.temp.day;

      // for image
      let weatherStatusValue = currentDate.weather[0].id;

      div.innerHTML = `<h3 class="text-lg font-extrabold">(${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()})</h3>
          <img src=./animated/${setWeatherStatusImage(
            weatherStatusValue
          )}.svg alt="${currentDate.weather[0].description}" class="w-48" />
          <p>Temperature: ${(tempInK - 273.15).toFixed(2)}°C/${(
        1.8 * (tempInK - 273.15) +
        32
      ).toFixed(2)}°F</p>
          <p>Wind Speed: ${currentDate.wind_speed} m/s</p>
          <p>Humidity: ${currentDate.humidity}%</p>`;

      weeklyCardContainer.appendChild(div);
    }
  }

  // Current location button event listener
  currentLocation.addEventListener("click", function () {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function (position) {
          currentLocationDataFetch(position);
        },
        (err) => {
          console.log(err);
        }
      );
    }
  });

  // function for fetching data for current location and inputing the fields
  async function currentLocationDataFetch(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    let getCurrentCity = await fetch(
      `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&appid=${api_key}`
    );
    let currentCity = await getCurrentCity.json();
    let cityName = currentCity[0].name.toLowerCase().trim();
    let cityData = await fetchDailyReport(cityName);

    inputValueInMainCard(cityData.daily[0], cityName);
    weeklyCardContainer.innerHTML = "";
    dailyCardUpdate(cityData);
  }
});

//event listener for requesting current location of the user
document.addEventListener("DOMContentLoaded", async function () {
  // input field and button for input location and error text
  let cityInput = document.getElementById("city-input");
  let searchButton = document.getElementById("search-button");
  let dropdown = document.getElementById("dropdown");
  let dropdownCities = document.getElementById("dropdown_cities");
  let invalidText = document.getElementById("invalid-text");

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

  // API key of Open Weather Application
  let api_key = "c8c540bb57f17a4117c17416ba3ea340";

  //Array for storing recent location in local storage
  let cityNamesList = JSON.parse(localStorage.getItem("cityNamesList")) || [];

  // Function to show dropdown suggestions
  function showDropdown(filteredCities) {
    dropdown.style.display = "block";
    dropdownCities.innerHTML = "";

    // Create list items for each matching city
    filteredCities.forEach((city) => {
      const li = document.createElement("li");
      li.textContent = city;
      li.className = "cursor-pointer p-1 rounded hover:bg-slate-300";

      // On click, set input value and hide dropdown
      li.addEventListener("click", () => {
        cityInput.value = city;
        dropdown.style.display = "none";
        saveCityToLocalStorage(city);
      });

      dropdownCities.appendChild(li);
    });
  }

  // Save city to localStorage if it's not already there
  function saveCityToLocalStorage(city) {
    if (!cityNamesList.includes(city)) {
      cityNamesList.unshift(city); // Add to beginning
      cityNamesList = cityNamesList.slice(0, 5); // Keep max 5 recent
      localStorage.setItem("cityNamesList", JSON.stringify(cityNamesList));
    }
  }

  // Show suggestions when user types
  cityInput.addEventListener("input", () => {
    const inputValue = cityInput.value.trim().toLowerCase();

    // Filter cities based on input
    const filteredCities = cityNamesList.filter((city) =>
      city.toLowerCase().startsWith(inputValue)
    );

    if (filteredCities.length > 0) {
      showDropdown(filteredCities);
    } else {
      dropdown.style.display = "none";
    }
  });

  // Show all recent cities when input is focused
  cityInput.addEventListener("focus", () => {
    if (cityNamesList.length > 0) {
      showDropdown(cityNamesList);
    }
  });

  // Save city when user leaves the input field (optional)
  cityInput.addEventListener("change", () => {
    const city = cityInput.value.trim();
    if (city) {
      saveCityToLocalStorage(city);
    }
  });

  // Hide dropdown when clicking outside the input or dropdown
  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && e.target !== cityInput) {
      dropdown.style.display = "none";
    }
  });

  //for loading weather for current location on load and if current location access is denied setting default location as London
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        currentLocationDataFetch(position);
      },
      async (err) => {
        console.log(err);
        try {
          let cityData = await fetchDailyReport("London");
          inputValueInMainCard(cityData.daily[0], "London");
          weeklyCardContainer.innerHTML = "";
          dailyCardUpdate(cityData);
        } catch (error) {
          console.error("Enable to fetch data for current city: ", error);
        }
      }
    );
  }

  // function for fetching daily weather report

  async function fetchDailyReport(city) {
    // api call for getting latitude and longitude for city
    try {
      let locationData = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${api_key}`
      );
      let coordinates = await locationData.json();
      let lat = coordinates[0].lat;
      let lon = coordinates[0].lon;

      //api call getting current data

      try {
        let data = await fetch(
          `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=current,minutesly,hourly,alerts&appid=${api_key}`
        );
        let newData = await data.json();
        return newData;
      } catch (error) {
        console.error(
          "Error while fetching weather report for the city: ",
          error
        );
      }
    } catch (error) {
      console.error(
        "Error while getting latitude and longitude for the city: ",
        error
      );
    }
  }

  // Event listener for searching data for input city and dispalying the relevent data
  searchButton.addEventListener("click", async function () {
    try {
      let cityInputValue = cityInput.value.trim().toLowerCase();

      if (cityInputValue.length === 0) return;

      let cityData = await fetchDailyReport(cityInputValue);
      if (cityData.cod == 400) {
        searchButton.append(`<div>Enter a Valid City Name</div>`);
        return;
      }
      cityInput.value = "";
      inputValueInMainCard(cityData.daily[0], cityInputValue);
      weeklyCardContainer.innerHTML = "";
      dailyCardUpdate(cityData);
      if (!invalidText.classList.contains("hidden")) {
        invalidText.classList.add("hidden");
      }
    } catch (error) {
      console.error(
        "Error while extraction weather data on searching: ",
        error
      );
      invalidText.classList.remove("hidden");
      cityInput.value = "";
    }
  });

  // function for setting the image for the status of current weather

  function setWeatherStatusImage(status) {
    let fileName = "";

    if (status > 800) {
      fileName = "scatteredClouds";
    } else if (status === 800) {
      fileName = "clearSky";
    } else if (status >= 700 && status < 800) {
      fileName = "scatteredClouds";
    } else if (status >= 600 && status < 700) {
      fileName = "snow";
    } else if (status >= 500 && status < 600) {
      fileName = "rain";
    } else if (status >= 300 && status < 400) {
      fileName = "showerRain";
    } else if (status >= 200 && status < 300) {
      fileName = "thunderstorm";
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
    try {
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

        div.innerHTML = `<h3 class="text-base font-extrabold">(${date.getFullYear()}-${
          date.getMonth() + 1
        }-${date.getDate()})</h3>
            <img src=./animated/${setWeatherStatusImage(
              weatherStatusValue
            )}.svg alt="${
          currentDate.weather[0].description
        }" class="w-48 xl:block hidden" />
        <p class='text-center'>Temperature: ${(tempInK - 273.15).toFixed(
          2
        )}°C/${(1.8 * (tempInK - 273.15) + 32).toFixed(2)}°F</p>
        <p class='text-center'>Wind Speed: ${currentDate.wind_speed} m/s</p>
        <p class='text-center'>Humidity: ${currentDate.humidity}%</p>`;

        weeklyCardContainer.appendChild(div);
      }
    } catch (error) {
      console.error("Error while extraction daily weather data: ", error);
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

    try {
      let getCurrentCity = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&appid=${api_key}`
      );
      let currentCity = await getCurrentCity.json();
      let cityName = currentCity[0].name.toLowerCase().trim();
      let cityData = await fetchDailyReport(cityName);

      inputValueInMainCard(cityData.daily[0], cityName);
      weeklyCardContainer.innerHTML = "";
      dailyCardUpdate(cityData);
    } catch (error) {
      console.error(
        "Error while fetching weather data using Longitude and Latitude: ",
        error
      );
    }
  }
});

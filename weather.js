const storage = (() => {
  function isLocalStorageAvailable() {
    var test = "test";
    try {
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  function setTheme(value) {
    if (isLocalStorageAvailable() === true) {
      localStorage.setItem("theme", value);
    }
  }

  function getTheme() {
    if (isLocalStorageAvailable() === true) {
      return localStorage.getItem("theme") || "light";
    } else {
      return "light";
    }
  }

  function resetTheme() {
    if (isLocalStorageAvailable() === true) {
      localStorage.removeItem("theme");
    }
  }

  function setCity(value) {
    if (isLocalStorageAvailable() === true) {
      localStorage.setItem("city", value);
    }
  }

  function getCity() {
    if (isLocalStorageAvailable() === true) {
      return localStorage.getItem("city") || "Toronto";
    } else {
      return null;
    }
  }

  function getUnit() {
    if (isLocalStorageAvailable() === true) {
      return localStorage.getItem("unit") || "C";
    } else {
      return "C";
    }
  }

  function setUnit(value) {
    if (isLocalStorageAvailable() === true) {
      return localStorage.setItem("unit", value);
    }
  }

  return {
    setTheme,
    getTheme,
    resetTheme,
    setCity,
    getCity,
    setUnit,
    getUnit,
    isLocalStorageAvailable,
  };
})();

const weather = (() => {
  const APIKey = "539bfe61f2ee16d6318e3761ac423178"; // Exposed here but it's a free api key and in this context, there's no other choice

  function fetchWeather(cityName = storage.getCity()) {
    let currentWeather;
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${APIKey}`,
      {
        mode: "cors",
      }
    )
      .then((res) => res.json())
      .then((data) => (currentWeather = data))
      .then(() => {
        processWeather(currentWeather).then((weather) =>
          UI.updateScreen(weather)
        );
      });
  }

  function processWeather(apiInfo) {
    return new Promise((resolve, reject) => {
      if (apiInfo != undefined || apiInfo != null) {
        console.log(apiInfo);
        let ret = {
          city: apiInfo.name,
          weather: apiInfo.weather[0].main,
          desc: apiInfo.weather[0].description,
          temperature: apiInfo.main.temp,
          feelsLike: apiInfo.main.feels_like,
          humidity: apiInfo.main.humidity,
          pressure: apiInfo.main.pressure,
          minTemp: apiInfo.main.temp_min,
          maxTemp: apiInfo.main.temp_max,
        };
        console.log(ret);
        resolve(ret);
      } else {
        reject({
          errMsg: "An error occured: apiInfo was equal to null or undefined",
        });
      }
    });
  }

  return { fetchWeather };
})();

const UI = (() => {
  let currentTheme = storage.getTheme();
  let currUnit = storage.getUnit();
  let temp;
  let minTemp;
  let maxTemp;
  let feelsLike;
  const cityInput = document.querySelector("#cityInput");
  const DOMCityName = document.querySelector(".cityName");
  const DOMTemp = document.querySelector(".temperature");
  const DOMFeelsLike = document.querySelector(".feelsLike");
  const DOMMinTemp = document.querySelector(".minTemp");
  const DOMMaxTemp = document.querySelector(".maxTemp");
  const DOMWeather = document.querySelector(".weather");
  const DOMHumidity = document.querySelector(".humidity");
  const DOMPressure = document.querySelector(".pressure");
  const toggleThemeBtn = document.querySelector(".toggleTheme");
  const aboutBtn = document.querySelector(".about");
  const aboutModal = document.querySelector(".aboutModal");

  cityInput.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
      document.body.style.cursor = "wait";
      getWeather(cityInput.value);
      storage.setCity(cityInput.value);
    }
  });

  DOMTemp.addEventListener("click", updateTemperature);
  toggleThemeBtn.addEventListener("click", changeTheme);
  aboutBtn.addEventListener("click", toggleAboutModal);

  function getWeather(name) {
    weather.fetchWeather(name);
  }

  function convertTemp(temp, unit) {
    //From Kelvin to given unit: celcius or fahrenheit
    if (unit == "C") {
      return Number.parseFloat(temp - 273.15).toFixed(2);
    } else {
      return Number.parseFloat((temp - 273.15) * 1.8 + 32).toFixed(2);
    }
  }

  function updateScreen(weatherObj) {
    DOMCityName.innerText = weatherObj.city;
    DOMTemp.innerText = `${convertTemp(
      weatherObj.temperature,
      currUnit
    )}°${currUnit}`;
    temp = weatherObj.temperature;
    minTemp = weatherObj.minTemp;
    maxTemp = weatherObj.maxTemp;
    feelsLike = weatherObj.feelsLike;
    DOMWeather.innerText = weatherObj.weather;
    document.body.className = "";
    switch (weatherObj.weather) {
      case "Clear":
        document.body.classList.add("clear");
        break;
      case "Snow":
        document.body.classList.add("snow");
        break;
      case "Rain":
        document.body.classList.add("rain");
        break;
      case "Drizzle":
      case "Clouds":
        document.body.classList.add("drizzle");
        break;
      case "Thunderstorm":
        document.body.classList.add("thunderstorm");
        break;
      case "Mist":
      case "Fog":
        document.body.classList.add("mist");
        break;
      case "Sand":
        document.body.classList.add("sand");
        break;
      case "Tornado":
        document.body.classList.add("tornado");
        break;
      default:
        break;
    }
    DOMMinTemp.innerText = `Min. temperature: ${convertTemp(
      weatherObj.minTemp,
      currUnit
    )}°${currUnit}`;
    DOMMaxTemp.innerText = `Max. temperature: ${convertTemp(
      weatherObj.maxTemp,
      currUnit
    )}°${currUnit}`;
    DOMFeelsLike.innerText = `Feels like: ${convertTemp(
      weatherObj.feelsLike,
      currUnit
    )}°${currUnit}`;
    DOMHumidity.innerText = `Humidity: ${weatherObj.humidity}%`;
    DOMPressure.innerText = `Pressure: ${weatherObj.pressure} hPa`;
    document.body.style.cursor = "default";
  }

  function updateTemperature() {
    currUnit = currUnit == "C" ? "F" : "C";
    storage.setUnit(currUnit);
    DOMTemp.innerText = `${convertTemp(temp, currUnit)}°${currUnit}`;
    DOMMinTemp.innerText = `Min. temperature: ${convertTemp(
      minTemp,
      currUnit
    )}°${currUnit}`;
    DOMMaxTemp.innerText = `Max. temperature: ${convertTemp(
      maxTemp,
      currUnit
    )}°${currUnit}`;
    DOMFeelsLike.innerText = `Feels like: ${convertTemp(
      feelsLike,
      currUnit
    )}°${currUnit}`;
  }

  function setTheme() {
    const themableElements = document.querySelectorAll(".themeable");
    const container = document.querySelector("body");
    if (currentTheme == "light") {
      themableElements.forEach((el) => {
        el.classList.remove("dark");
        container.classList.remove("darkBody");
    });
    } else {
      themableElements.forEach((el) => {
        el.classList.add("dark");
        container.classList.add("darkBody");
      });
    }
  }

  function changeTheme() {
    if (currentTheme === "light") {
      currentTheme = "dark";
      storage.setTheme("dark");
    } else if (currentTheme === "dark") {
      currentTheme = "light";
      storage.setTheme("light");
    }
    setTheme();
  }

  function toggleAboutModal() {
    aboutModal.classList.toggle("invisible");
  }

  return { updateScreen, updateTemperature, getWeather, setTheme };
})();

UI.setTheme();
UI.getWeather();

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

  function getLanguage() {
    if (isLocalStorageAvailable() === true) {
        return localStorage.getItem("lang") || "en";
      } else {
        return "en";
      }
  }

  function setLanguage(value) {
    if (isLocalStorageAvailable() === true) {
        return localStorage.setItem("lang", value);
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
    setLanguage,
    getLanguage,
    isLocalStorageAvailable,
  };
})();

const locales = (() => {
  const enLocale = {
    search_box: "Enter location",
    feelsLike: "Feels like:",
    minTemp: "Min. temperature:",
    maxTemp: "Max. temperature:",
    humidity: "Humidity:",
    pressure: "Pressure:",
    weather_clear: "Clear",
    weather_snow: "Snow",
    weather_rain: "Rain",
    weather_drizzle: "Drizzle",
    weather_clouds: "Clouds",
    weather_thunderstorm: "Thunderstorm",
    weather_mist: "Mist",
    weather_fog: "Fog",
    weather_sand: "Sand",
    weather_tornado: "Tornado",
    about_description:
      "This is a weather web app fetching the weather from the OpenWeatherMap API",
    about_font: "Using the Raleway font from Google Fonts",
    about_dev: "Developped by Denis L.",
  };

  const frLocale = {
    search_box: "Rechercher un lieu",
    feelsLike: "Ressenti:",
    minTemp: "Température min.:",
    maxTemp: "Température max.:",
    humidity: "Humidité:",
    pressure: "Pression:",
    weather_clear: "Dégagé",
    weather_snow: "Neige",
    weather_rain: "Pluvieux",
    weather_drizzle: "Bruine",
    weather_clouds: "Nuageux",
    weather_thunderstorm: "Éclairs/Tonnerre",
    weather_mist: "Brume",
    weather_fog: "Brouillard",
    weather_sand: "Tempête de sable",
    weather_tornado: "Tornade",
    about_description:
      "Une application web récupérant la météo depuis l'API d'OpenWeatherMap",
    about_font:
      "La police d'écriture utilisée est Raleway (hébergée sur Google Fonts)",
    about_dev: "Créé par Denis L.",
  };

  function loadLocale(lang) {
    switch (lang) {
      case "en":
        return enLocale;
      case "fr":
        return frLocale;
      default:
        return enLocale;
    }
  }

  return { loadLocale };
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
          UI.setWeatherObject(weather)
        );
      });
  }

  function processWeather(apiInfo) {
    return new Promise((resolve, reject) => {
      if (apiInfo != undefined || apiInfo != null) {
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
  let currentLanguage = storage.getLanguage();
  let localeText = undefined;
  let weatherObj = undefined;
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
  const toggleLanguageBtn = document.querySelector(".toggleLanguage");
  const aboutBtn = document.querySelector(".about");
  const aboutModal = document.querySelector(".aboutModal");
  const descModal = document.querySelector("#modalDesc");
  const fontModal = document.querySelector("#modalFont");
  const devByModal = document.querySelector("#modalDevBy");


  localeText = locales.loadLocale(currentLanguage);

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
  toggleLanguageBtn.addEventListener("click", () => {
    currentLanguage = currentLanguage == "fr" ? "en" : "fr";
    storage.setLanguage(currentLanguage);
    localeText = locales.loadLocale(currentLanguage);
    updateScreen();
  });

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

  function setWeatherObject(newWeatherObj) {
    weatherObj = newWeatherObj;
    updateScreen();
  }

  function updateScreen() {
    cityInput.placeholder = localeText.search_box;
    descModal.innerText = localeText.about_description;
    fontModal.innerText = localeText.about_font;
    devByModal.innerText = localeText.about_dev;
    DOMCityName.innerText = weatherObj.city;
    DOMTemp.innerText = `${convertTemp(weatherObj.temperature, currUnit)}°${currUnit}`;
    document.body.className = "";
    if (currentTheme === "dark") {
      document.body.classList.add("darkBody");
    }
    switch (weatherObj.weather) {
      case "Clear":
        document.body.classList.add("clear");
        DOMWeather.innerText = localeText.weather_clear;
        break;
      case "Snow":
        document.body.classList.add("snow");
        DOMWeather.innerText = localeText.weather_snow;
        break;
      case "Rain":
        document.body.classList.add("rain");
        DOMWeather.innerText = localeText.weather_rain;
        break;
      case "Drizzle":
        document.body.classList.add("drizzle");
        DOMWeather.innerText = localeText.weather_drizzle;
        break;
      case "Clouds":
        document.body.classList.add("drizzle");
        DOMWeather.innerText = localeText.weather_clouds;
        break;
      case "Thunderstorm":
        document.body.classList.add("thunderstorm");
        DOMWeather.innerText = localeText.weather_thunderstorm;
        break;
      case "Mist":
        document.body.classList.add("mist");
        DOMWeather.innerText = localeText.weather_mist;
        break;
      case "Fog":
        document.body.classList.add("mist");
        DOMWeather.innerText = localeText.weather_fog;
        break;
      case "Sand":
        document.body.classList.add("sand");
        DOMWeather.innerText = localeText.weather_sand;
        break;
      case "Tornado":
        document.body.classList.add("tornado");
        DOMWeather.innerText = localeText.weather_tornado;
        break;
      default:
        break;
    }
    DOMMinTemp.innerText = `${localeText.minTemp} ${convertTemp(weatherObj.minTemp, currUnit)}°${currUnit}`;
    DOMMaxTemp.innerText = `${localeText.maxTemp} ${convertTemp(weatherObj.maxTemp, currUnit)}°${currUnit}`;
    DOMFeelsLike.innerText = `${localeText.feelsLike} ${convertTemp(weatherObj.feelsLike, currUnit)}°${currUnit}`;
    DOMHumidity.innerText = `${localeText.humidity} ${weatherObj.humidity}%`;
    DOMPressure.innerText = `${localeText.pressure} ${weatherObj.pressure} hPa`;
    document.body.style.cursor = "default";
  }

  function updateTemperature() {
    currUnit = currUnit == "C" ? "F" : "C";
    storage.setUnit(currUnit);
    DOMTemp.innerText = `${convertTemp(weatherObj.temperature, currUnit)}°${currUnit}`;
    DOMMinTemp.innerText = `${localeText.minTemp} ${convertTemp(weatherObj.minTemp, currUnit)}°${currUnit}`;
    DOMMaxTemp.innerText = `${localeText.maxTemp} ${convertTemp(weatherObj.maxTemp, currUnit)}°${currUnit}`;
    DOMFeelsLike.innerText = `${localeText.feelsLike} ${convertTemp(weatherObj.feelsLike, currUnit)}°${currUnit}`;
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

  return { setWeatherObject, updateTemperature, getWeather, setTheme };
})();

UI.setTheme();
UI.getWeather();

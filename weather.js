const weather = (() => {
    const APIKey = "61d89db53ba4c888e361537f9b4b7787"; // Exposed here but it's a free api key and in this context, there's no other choice

    function fetchWeather(cityName = 'Toronto') {
        let currentWeather;
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${APIKey}`, {
            mode: 'cors'
        })
        .then(res => res.json())
        .then(data => currentWeather = data)
        .then(() => {
            processWeather(currentWeather)
            .then(weather => UI.updateScreen(weather));
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
                    maxTemp: apiInfo.main.temp_max
                };
                console.log(ret);
                resolve(ret);
            }
            else {
                reject({errMsg: 'An error occured: apiInfo was equal to null or undefined'});
            }
        });
    }

    return {fetchWeather};
})();

const UI = (() => {
    let currUnit = 'C';
    let temp;
    let minTemp;
    let maxTemp;
    const cityInput = document.querySelector('#cityInput');
    const DOMTemp = document.querySelector('.temperature');
    const DOMCityName = document.querySelector('.cityName');
    const DOMWeatherIcon = document.querySelector('.weatherIcon');
    const DOMWeather = document.querySelector('.weather');
    const DOMWDescription = document.querySelector('.description');
    const DOMFeelsLike = document.querySelector('.feelsLike');
    const DOMHumidity = document.querySelector('.humidity');
    
    cityInput.addEventListener('keydown', (e) => {
    if (e.key == 'Enter'){
            console.log('Pressed enter');
            getWeather(cityInput.value);
        }
    });

    DOMTemp.addEventListener('click', updateTemperature);

    function getWeather(name) {
        weather.fetchWeather(name);
    }

    function convertTemp(temp, unit) { //From Kelvin to given unit: celcius or fahrenheit
        if (unit == 'C') {
            return Number.parseFloat(temp - 273.15).toFixed(2);
        }
        else {
            return Number.parseFloat((temp - 273.15) * 1.8 + 32).toFixed(2);
        }
    }

    function updateScreen(weatherObj) {
        DOMCityName.innerText = weatherObj.city;
        DOMTemp.innerText = `${convertTemp(weatherObj.temperature, currUnit)}°${currUnit}`;
        temp = weatherObj.temperature;
        DOMWeather.innerText = weatherObj.weather;
        switch (weatherObj.weather) {
            case 'Clear':
                document.body.style.backgroundImage = `url('./res/img/clear_day.jpg')`;
                break;

            case 'Snow':
                document.body.style.backgroundImage = `url('./res/img/snow.jpg')`;
                break;

            case 'Rain':
                document.body.style.backgroundImage = `url('./res/img/rain.jpg')`;
                break;

            case 'Drizzle':
            case 'Clouds':
                document.body.style.backgroundImage = `url('./res/img/cloudy.jpg')`;
                break;

            case 'Thunderstorm':
                document.body.style.backgroundImage = `url('./res/img/thunder.jpg)`;
                break;

            case 'Mist':
            case 'Fog':
                document.body.style.backgroundImage = `url('./res/img/mist.jpg')`;
                break;

            case 'Sand':
                document.body.style.backgroundImage = `url('./res/img/sandstorm.jpg')`;
                break;

            case 'Tornado':
                document.body.style.backgroundImage = `url('./res/img/tornado.jpg')`;
                break;

            default:
                document.body.style.backgroundImage = `url('./res/img/clear_night.jpg')`;
                break;
        }
        DOMWDescription.innerText = weatherObj.desc;
    }

    function updateTemperature() {
        currUnit = (currUnit == 'C') ? 'F' : 'C';
        DOMTemp.innerText = `${convertTemp(temp, currUnit)}°${currUnit}`;
    }

    return {updateScreen, updateTemperature, getWeather};
})();

UI.getWeather();
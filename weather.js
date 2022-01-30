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
    let currentTheme = 'light';
    let currUnit = 'C';
    let temp;
    let minTemp;
    let maxTemp;
    let feelsLike;
    const cityInput = document.querySelector('#cityInput');
    const DOMCityName = document.querySelector('.cityName');
    const DOMTemp = document.querySelector('.temperature');
    const DOMFeelsLike = document.querySelector('.feelsLike');
    const DOMMinTemp = document.querySelector('.minTemp');
    const DOMMaxTemp = document.querySelector('.maxTemp');
    const DOMWeather = document.querySelector('.weather');
    const DOMHumidity = document.querySelector('.humidity');
    const DOMPressure = document.querySelector('.pressure');
    const toggleThemeBtn = document.querySelector('.toggleTheme');
    const aboutBtn = document.querySelector('.about');
    const aboutModal = document.querySelector('.aboutModal');
    
    cityInput.addEventListener('keydown', (e) => {
    if (e.key == 'Enter'){
            console.log('Pressed enter');
            getWeather(cityInput.value);
        }
    });

    DOMTemp.addEventListener('click', updateTemperature);
    toggleThemeBtn.addEventListener('click', changeTheme);
    aboutBtn.addEventListener('click', toggleAboutModal);

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
        minTemp = weatherObj.minTemp;
        maxTemp = weatherObj.maxTemp;
        feelsLike = weatherObj.feelsLike;
        DOMWeather.innerText = weatherObj.weather;
        DOMMinTemp.innerText = `Min. temperature: ${convertTemp(weatherObj.minTemp, currUnit)}°${currUnit}`;
        DOMMaxTemp.innerText = `Max. temperature: ${convertTemp(weatherObj.maxTemp, currUnit)}°${currUnit}`;
        DOMFeelsLike.innerText = `Feels like: ${convertTemp(weatherObj.feelsLike, currUnit)}°${currUnit}`;
        DOMHumidity.innerText = `Humidity: ${weatherObj.humidity}%`;
        DOMPressure.innerText = `Pressure: ${weatherObj.pressure} hPa`;
        
    }

    function updateTemperature() {
        currUnit = (currUnit == 'C') ? 'F' : 'C';
        DOMTemp.innerText = `${convertTemp(temp, currUnit)}°${currUnit}`;
        DOMMinTemp.innerText = `Min. temperature: ${convertTemp(minTemp, currUnit)}°${currUnit}`;
        DOMMaxTemp.innerText = `Max. temperature: ${convertTemp(maxTemp, currUnit)}°${currUnit}`;
        DOMFeelsLike.innerText = `Feels like: ${convertTemp(feelsLike, currUnit)}°${currUnit}`;
        
    }

    function changeTheme() {
        console.log('tapped!')
        const themableElements = document.querySelectorAll('.themeable');
        if (currentTheme == 'light') {
            currentTheme = 'dark';
            themableElements.forEach(el => {
                el.classList.add('dark');
            });
        }
        else {
            currentTheme = 'light';
            themableElements.forEach(el => {
                el.classList.remove('dark');
            });
        }
    }

    function toggleAboutModal() {
        aboutModal.classList.toggle('invisible');
    }

    return {updateScreen, updateTemperature, getWeather};
})();

UI.getWeather();
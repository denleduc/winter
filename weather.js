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
                    humidity: apiInfo.main.humidity
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
    const cityInput = document.querySelector('#cityInput');
    cityInput.addEventListener('keydown', (e) => {
        if (e.key == 'Enter'){
            console.log('Pressed enter');
            getWeather(cityInput.value);
        }
    });

    function getWeather(name) {
        weather.fetchWeather(name);
    }

    function updateScreen(weatherObj) {
        console.log(weatherObj);
    }

    return {updateScreen};
})();
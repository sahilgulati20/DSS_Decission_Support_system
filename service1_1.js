// API configuration
const apiHost = 'api.openweathermap.org'; // OpenWeatherMap API host
const apiKey = '20743b1868d48b41d80c78d2f6c73391'; // Your OpenWeatherMap API key

// Function to get weather and forecast
async function getWeather() {
    const city = document.getElementById("city").value;
    
    if (!city) {
        alert("Please enter a city name");
        return;
    }

    // Constructing the URL for OpenWeatherMap with the city name for both current weather and forecast
    const url = `https://${apiHost}/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`; // Current weather endpoint
    const forecastUrl = `https://${apiHost}/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`; // 5-day/3-hour forecast endpoint

    const options = {
        method: 'GET',
    };

    try {
        // Fetching current weather data
        const response = await fetch(url, options);
        const result = await response.json();

        if (result.cod !== 200) {
            // Display error message if city is not found or other API errors
            document.getElementById("weather-result").innerHTML = `<p>Error: ${result.message}</p>`;
        } else {
            displayWeather(result);
            getForecast(forecastUrl); // Get forecast data
        }
    } catch (error) {
        console.error("Fetch Error: ", error); // Log the error for debugging
        document.getElementById("weather-result").innerHTML = "<p>There was an error fetching the weather data. Please try again later.</p>";
    }
}

// Function to fetch the weather forecast for upcoming days (5 days with 3-hour intervals)
async function getForecast(forecastUrl) {
    const options = {
        method: 'GET',
    };

    try {
        const response = await fetch(forecastUrl, options);
        const forecast = await response.json();

        if (forecast.cod !== '200') {
            document.getElementById("weather-result").innerHTML += `<p>Error fetching forecast: ${forecast.message}</p>`;
        } else {
            displayTomorrowWeather(forecast); // Display tomorrow's weather first
            displayForecast(forecast); // Display upcoming forecast after tomorrow's weather
        }
    } catch (error) {
        console.log("Error fetching forecast:", error);
        document.getElementById("weather-result").innerHTML += `<p>Error fetching forecast. Please try again later.</p>`;
    }
}

// Function to display current weather data
function displayWeather(data) {
    const { name, main, weather, wind } = data;

    // Convert temperature from Kelvin to Celsius
    const tempInCelsius = main.temp;

    const weatherHtml = `
        <h3>Today's weather-:</h3>
        <h2>Weather in ${name}</h2>
        <p><strong>Temperature:</strong> ${tempInCelsius.toFixed(1)}°C</p>
        <p><strong>Condition:</strong> ${weather[0].description}</p>
        <p><strong>Humidity:</strong> ${main.humidity}%</p>
        <p><strong>Wind Speed:</strong> ${wind.speed} m/s</p>
    `;
    
    document.getElementById("weather-result").innerHTML = weatherHtml;

    checkForBadWeather(weather[0].description);
}

// Function to display tomorrow's weather in a separate box
function displayTomorrowWeather(forecast) {
    // Get the weather for the next 8th entry (24 hours from now)
    const tomorrow = forecast.list[8]; // The 9th entry corresponds to tomorrow's weather (for 24 hours)
    const date = new Date(tomorrow.dt * 1000);
    const temp = tomorrow.main.temp; // Already in Celsius
    const description = tomorrow.weather[0].description;

    const tomorrowHtml = `
        <div class="forecast-box">
            <h3>Tomorrow's weather-:</h3>
            <p><strong>Temperature:</strong> ${temp.toFixed(1)}°C</p>
            <p><strong>Condition:</strong> ${description}</p>
        </div>
    `;

    document.getElementById("tomorrow-weather-result").innerHTML = tomorrowHtml;
}

// Function to display the weather forecast for upcoming days (5 days, 3-hour intervals)
function displayForecast(forecast) {
    let forecastHtml = "<h3>Upcoming Forecast-:</h3><div class='forecast-container'>";

    forecast.list.slice(0, 5).forEach((day, index) => {  // Get forecast for the next 5 intervals (1 forecast per day)
        const date = new Date(day.dt * 1000); // Convert Unix timestamp to Date object
        const dayName = `Day ${index + 1}`; // Replace with "Day 1", "Day 2", etc.
        const temp = day.main.temp; // Already in Celsius
        const description = day.weather[0].description;

        forecastHtml += `
            <div class="forecast-box">
                <h4>${dayName}</h4>
                <p><strong>Temperature:</strong> ${temp.toFixed(1)}°C</p>
                <p><strong>Condition:</strong> ${description}</p>
            </div>
        `;
    });

    forecastHtml += "</div>";

    // Now, append the forecast HTML to the upcoming forecast section
    document.getElementById("upcoming-forecast-result").innerHTML = forecastHtml;
}

// Function to check for bad weather conditions
function checkForBadWeather(condition) {
    const badConditions = ["rain", "moderate rain", "storm", "snow", "thunder", "hail", "tornado"];

    if (badConditions.some(badCondition => condition.toLowerCase().includes(badCondition))) {
        sendNotification("Weather Alert", `Bad weather detected: ${condition}`);
    }
}

function sendNotification(title, message) {
    if (Notification.permission === "granted") {
        new Notification(title, {
            body: message,
            icon: ""
        });
    } else {
        document.getElementById("modal-title").textContent = title;
        document.getElementById("modal-message").textContent = message;
        document.getElementById("weatherModal").style.display = "block";
    }
}

document.querySelector(".close").onclick = function() {
    document.getElementById("weatherModal").style.display = "none";
};

window.onclick = function(event) {
    const modal = document.getElementById("weatherModal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

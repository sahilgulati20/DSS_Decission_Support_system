let cropData = [];
let fertilizerData = [];

// Function to load CSV files
function loadCSVFiles() {
    // Load crop data
    Papa.parse("crop_data.csv", {
        download: true,
        header: true,
        complete: function (results) {
            cropData = results.data;
            console.log("Crop Data Loaded:", cropData);
        },
    });

    // Load fertilizer data
    Papa.parse("fertilizer_data.csv", {
        download: true,
        header: true,
        complete: function (results) {
            fertilizerData = results.data;
            console.log("Fertilizer Data Loaded:", fertilizerData);
        },
    });
}

// Call this function on page load
window.onload = loadCSVFiles;

// Function to fetch weather data and display it
function getWeatherData() {
    const location = document.getElementById('location').value;
    const apiKey = '99a02143588521f2c348c6b58b28721a'; // Replace with your OpenWeather API key

    if (!location) {
        alert("Please enter a location.");
        return;
    }

    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=metric&appid=${apiKey}`;

    fetch(weatherApiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.cod !== '200') {
                alert("Location not found. Please check the spelling.");
                return;
            }
            displayWeather(data);
            showPlantingRecommendations(data);
        })
        .catch(error => {
            console.error("Error fetching the weather data: ", error);
            alert("Error fetching weather data. Please try again later.");
        });
}

// Function to display weather data
function displayWeather(data) {
    const forecastSection = document.getElementById('forecast');
    const weatherInfoSection = document.getElementById('weather-info');
    forecastSection.innerHTML = '<ul>';

    // Displaying weather forecast for the next 5 days
    data.list.slice(0, 5).forEach(forecast => {
        const date = new Date(forecast.dt * 1000).toLocaleDateString();
        const temp = forecast.main.temp;
        const condition = forecast.weather[0].description;

        forecastSection.innerHTML += `
            <li>
                <strong>${date}</strong>: ${temp}°C, ${condition}
            </li>
        `;
    });

    forecastSection.innerHTML += '</ul>';
    weatherInfoSection.classList.remove('hidden');
}

// Function to show planting time recommendations based on weather
function showPlantingRecommendations(data) {
    const todayWeather = data.list[0].main.temp;

    // Simple logic to provide planting recommendation based on temperature
    let recommendation = "It is a good time to plant crops.";

    if (todayWeather < 10) {
        recommendation = "It's too cold to plant. Wait for warmer temperatures.";
    } else if (todayWeather > 30) {
        recommendation = "It's too hot for planting. Wait for cooler weather.";
    }

    document.getElementById('planting-info').innerText = recommendation;
    document.getElementById('planting-recommendations').classList.remove('hidden');
}

// Function to get crop recommendations based on soil health and weather
function getCropRecommendations() {
    const soilPH = parseFloat(document.getElementById('soil-ph').value);
    const soilMoisture = parseInt(document.getElementById('soil-moisture').value);
    const soilNitrogen = parseFloat(document.getElementById('nitrogen').value);
    const soilPhosphorus = parseFloat(document.getElementById('phosphorus').value);
    const soilPotassium = parseFloat(document.getElementById('potassium').value);

    let cropRecommendation = "";

    // Crop recommendations based on soil conditions
    if (soilPH < 5.5) {
        cropRecommendation = "Your soil is too acidic. Consider planting acid-tolerant crops.";
    } else if (soilPH > 7.5) {
        cropRecommendation = "Your soil is too alkaline. Consider planting crops that tolerate alkaline soil.";
    } else if (soilMoisture < 30) {
        cropRecommendation = "Soil moisture is low. Consider drought-tolerant crops.";
    } else if (soilMoisture > 70) {
        cropRecommendation = "Soil moisture is high. Consider crops that thrive in wetter conditions.";
    } else {
        cropRecommendation = "Soil conditions are optimal for most crops. You can plant a variety of vegetables, grains, or fruits.";
    }

    // Filter the crop data based on user inputs
    const suitableCrops = cropData.filter(crop => {
        const cropPH = parseFloat(crop.ph);
        const cropHumidity = parseFloat(crop.humidity);

        return (
            cropPH >= soilPH - 1 &&
            cropPH <= soilPH + 1 &&
            cropHumidity >= soilMoisture - 10 &&
            cropHumidity <= soilMoisture + 10
        );
    });

    // Extract crop names and remove duplicates using a Set
    const uniqueCrops = [...new Set(suitableCrops.map(crop => crop.label))];

    cropRecommendation += "\n\nBased on your inputs, these crops are suitable: ";
    
    if (uniqueCrops.length > 0) {
        cropRecommendation += uniqueCrops.join(", ");
    } else {
        cropRecommendation = "No crops found matching your soil conditions.";
    }

    document.getElementById('crop-info').innerText = cropRecommendation;
    document.getElementById('planting-recommendations').classList.remove('hidden');
}

// Function to get fertilizer recommendations for a specific crop
function getFertilizerRecommendation(crop) {
    const recommendation = fertilizerData.find(f => f.Crop.toLowerCase() === crop.toLowerCase());

    if (recommendation) {
        return `Recommended Fertilizer: N=${recommendation.N}, P=${recommendation.P}, K=${recommendation.K}, Suitable pH=${recommendation.pH}`;
    } else {
        return "No fertilizer recommendations available for this crop.";
    }
}

// Example usage for fertilizer recommendations
function displayFertilizerRecommendation() {
    const crop = document.getElementById('crop-select').value; // Assuming you have a dropdown to select crop
    const recommendation = getFertilizerRecommendation(crop);

    document.getElementById('fertilizer-info').innerText = recommendation;
    document.getElementById('fertilizer-recommendations').classList.remove('hidden');
}

// Function to analyze soil based on user input
async function analyzeSoil() {
    // Get input values dynamically from the form
    const ph = parseFloat(document.getElementById("ph").value);
    const nitrogen = parseFloat(document.getElementById("nitrogen").value);
    const phosphorus = parseFloat(document.getElementById("phosphorus").value);
    const potassium = parseFloat(document.getElementById("potassium").value);

    // Validate input values
    if (isNaN(ph) || isNaN(nitrogen) || isNaN(phosphorus) || isNaN(potassium)) {
        alert("Please enter valid numbers for all fields.");
        return;
    }

    // Create the prompt for Gemini API
    const prompt = `
n= ${nitrogen}, p= ${phosphorus}, k= ${potassium} and ph= ${ph} these are the values of nitrogen, phosphorus, potassium, and pH of soil. Is the condition of the soil good? If not, tell us the name of at least 3-4 organic and inorganic materials along with the quantity that should be added to improve the soil condition in a 10-liter pot.

NOTE: I only want the names of the materials and the quantities to add, no further information.

The result should be in the following format:

The soil condition is:

Nitrogen (N):
Phosphorus (P):
Potassium (K):
pH:

To improve the soil:

Organic:
1. [Organic Material Name] - [Quantity]
2. [Organic Material Name] - [Quantity]
3. [Organic Material Name] - [Quantity]

Inorganic:
1. [Inorganic Material Name] - [Quantity]
2. [Inorganic Material Name] - [Quantity]
3. [Inorganic Material Name] - [Quantity]
`;


    // Call Gemini API
    const geminiResponse = await callGeminiAPI(prompt);

    // Parse and display the response in a structured format
    displayStructuredRecommendations(geminiResponse);
}

// Function to call Gemini API
async function callGeminiAPI(prompt) {
    // Add your Gemini API key here
    const GEMINI_API_KEY = "AIzaSyB0fWydMly8EYYPlHr5MzM7nfRWdEO5O_A"; // Replace with your actual Gemini API key

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "An error occurred while fetching recommendations. Please try again later.";
    }
}

// Function to display recommendations in a structured format
function displayStructuredRecommendations(response) {
    // Get the recommendations section and make it visible
    const recommendationsSection = document.getElementById("recommendations-section");
    recommendationsSection.classList.remove("hidden");

    // Clear previous recommendations
    const recommendationsDiv = document.getElementById("recommendations");
    recommendationsDiv.innerHTML = "";

    // Split the response into lines
    const lines = response.split("\n");

    // Create a container for the structured response
    const container = document.createElement("div");

    // Loop through each line and create HTML elements
    lines.forEach(line => {
        // Skip empty lines and disclaimer lines
        if (line.trim() === "" || line.includes("Gemini can make mistakes")) return;

        // Create a paragraph for general text
        if (line.startsWith("The soil condition is:") || line.startsWith("To improve the soil:")) {
            const p = document.createElement("p");
            p.textContent = line;
            p.style.fontWeight = "500";
            p.style.color = "#4CAF50";
            container.appendChild(p);
        }
        // Create a list item for organic and inorganic recommendations
        else if (line.startsWith("•")) {
            const li = document.createElement("li");
            li.textContent = line.replace("•⁠  ⁠", "• "); // Clean up bullet points
            container.appendChild(li);
        }
        // Create a paragraph for other lines (e.g., Nitrogen, Phosphorus, Potassium, pH)
        else {
            const p = document.createElement("p");
            p.textContent = line;
            container.appendChild(p);
        }
    });

    // Append the container to the recommendations div
    recommendationsDiv.appendChild(container);
}
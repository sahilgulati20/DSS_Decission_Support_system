// Firebase Configuration
const firebaseConfig = {
  apiKey: 'AIzaSyACCMGPAaVdR7pfk4HNAoIbF_RYH9KComQ',
  authDomain: 'alert-a5fd7.firebaseapp.com',
  databaseURL: 'https://alert-a5fd7-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'alert-a5fd7',
  storageBucket: 'alert-a5fd7.firebasestorage.app',
  messagingSenderId: '633852762954',
  appId: '1:633852762954:web:d0396d10d4e7afa963ffb3',
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Twilio Configuration
const TWILIO_ACCOUNT_SID = 'ACb380a55aa9d4b6e6829a58fb6aca6a69';
const TWILIO_AUTH_TOKEN = '207fd532fe9dad1d6cfb856187206eff';
const TWILIO_PHONE_NUMBER = '+15109013095';
const DESTINATION_PHONE_NUMBER = '+918791752379';

// Twilio Call Function
async function makeTwilioCall() {
  const callInfo = document.getElementById('call-info');
  if (!callInfo) return console.error('call-info element not found.');

  callInfo.innerText = '📞 Calling the nearest fire station and owner...';

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json`,
      {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: DESTINATION_PHONE_NUMBER,
          From: TWILIO_PHONE_NUMBER,
          Url: 'https://handler.twilio.com/twiml/EH8882745ba5480409d73a7b841847b7c7',
        }),
      }
    );

    if (!response.ok) {
      const errorDetails = await response.text();
      console.error('Error details:', errorDetails);
      callInfo.innerText = `❌ Failed to make a call. Status: ${response.status}`;
    } else {
      callInfo.innerText = '✅ Call initiated successfully!';
    }
  } catch (error) {
    console.error('Error making the Twilio call:', error);
    callInfo.innerText = '❌ An error occurred while trying to make a call.';
  }
}

// Firebase Listener
function setupFirebaseListener() {
  const flameSensorRef = db.ref('flame_sensor');
  flameSensorRef.on('value', (snapshot) => {
    const alert = snapshot.val();
    const alertInfo = document.getElementById('alert-info');
    const coordinatesDiv = document.getElementById('coordinates');

    if (alert?.status === 'Fire Detected') {
      const lat = parseFloat(alert.latitude);
      const lng = parseFloat(alert.longitude);

      map.setView([lat, lng], 13);
      L.marker([lat, lng]).addTo(map).bindPopup(`🔥 Fire Alert! Location: ${alert.location_name}`).openPopup();
      alertInfo.innerText = `🚨 Fire detected at ${alert.location_name}`;
      coordinatesDiv.innerText = `📍 Coordinates: Latitude ${lat.toFixed(6)}, Longitude ${lng.toFixed(6)}`;
      makeTwilioCall();
    } else {
      alertInfo.innerText = '✅ No fire detected.';
      coordinatesDiv.innerText = '';
    }
  });
}

// Initialize Map
const map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

function initApp() {
  setupFirebaseListener();
}
initApp();

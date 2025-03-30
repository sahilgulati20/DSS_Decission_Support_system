import asyncio
import requests
from uagents import Agent, Context, Model
from twilio.rest import Client


FIREBASE_URL = "https://alert-a5fd7-default-rtdb.asia-southeast1.firebasedatabase.app/"


TWILIO_ACCOUNT_SID = "AC3b2826c53d8fd024ea7b833d6431efa7"  
TWILIO_AUTH_TOKEN = "979ec97d15db63dbbbdf1663aa135504"      
TWILIO_PHONE_NUMBER = "+18788676521"                       
USER_PHONE_NUMBER = "+918791752379"                          

class FireAlert(Model):
    status: str
    location_name: str
    latitude: str
    longitude: str


def fetch_firebase_data():
    endpoint = "/flame_sensor.json"
    try:
        response = requests.get(FIREBASE_URL + endpoint)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Failed to fetch data: {response.status_code}")
            return None
    except Exception as e:
        print(f"Error: {e}")
        return None



def make_alert_call(location_name, latitude, longitude):
    client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

    message = (
        f"🔥 Fire detected at {location_name}.\n"
        f"Coordinates: {latitude}, {longitude}.\n"
        "Please take immediate action!"
    )

    call = client.calls.create(
        twiml=f'<Response><Say>{message}</Say></Response>',
        to=USER_PHONE_NUMBER,
        from_=TWILIO_PHONE_NUMBER
    )

    print(f"🚨 Alert call placed! Call SID: {call.sid}")



FireAlertAgent = Agent(
    name="FireAlertAgent",
    port=8006,
    seed="Fire alert agent secret",
    endpoint=["http://127.0.0.1:8006/submit"]
)


previous_status = {"status": None}



async def monitor_firebase(ctx: Context):
    global previous_status

    print("👀 Monitoring Firebase for fire alerts...")

    while True:
        data = fetch_firebase_data()

        if data:
            flame_status = data.get("status", "No Fire")
            location_name = data.get("location_name", "Unknown")
            latitude = data.get("latitude", "Unknown")
            longitude = data.get("longitude", "Unknown")

            
            if flame_status == "Fire Detected" and previous_status["status"] != "Fire Detected":
                print("🔥 Fire detected! Triggering alert...")

                
                make_alert_call(location_name, latitude, longitude)

                
                fire_alert = FireAlert(
                    status=flame_status,
                    location_name=location_name,
                    latitude=latitude,
                    longitude=longitude
                )

                
                await ctx.send("agent1qfl9chycg5uf05qdkqkk4cy6pver6rv9epkkeyvqdkydp45q7l7zx7jspeh", fire_alert)

            
            previous_status["status"] = flame_status

        await asyncio.sleep(5)  



@FireAlertAgent.on_interval(period=5.0)
async def periodic_monitor(ctx: Context):
    await monitor_firebase(ctx)



if __name__ == "__main__":
    FireAlertAgent.run()

import requests
from datetime import datetime, timedelta
from uagents import Agent, Context, Model
class Message(Model):
    message: str
OPENWEATHER_API_KEY = "20743b1868d48b41d80c78d2f6c73391"
BASE_URL = "http://api.openweathermap.org/data/2.5"
def get_today_weather(location):
    try:
        response = requests.get(f"{BASE_URL}/weather", params={
            "q": location,
            "appid": OPENWEATHER_API_KEY,
            "units": "metric"
        })

        if response.status_code == 200:
            data = response.json()
            weather_desc = data["weather"][0]["description"]
            temp = data["main"]["temp"]
            humidity = data["main"]["humidity"]
            wind_speed = data["wind"]["speed"]

            weather_info = (
                f"🌤️ **Today's Weather in {location}:**\n"
                f"- Description: {weather_desc}\n"
                f"- Temperature: {temp}°C\n"
                f"- Humidity: {humidity}%\n"
                f"- Wind Speed: {wind_speed} m/s"
            )
            return weather_info
        else:
            return f"❌ Failed to fetch today's weather for {location}. Error: {response.status_code}"

    except Exception as e:
        return f"⚠️ Error: {str(e)}"
def get_tomorrow_weather(location):
    try:
        response = requests.get(f"{BASE_URL}/forecast", params={
            "q": location,
            "appid": OPENWEATHER_API_KEY,
            "units": "metric"
        })

        if response.status_code == 200:
            data = response.json()

            tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')

            forecast = [
                item for item in data["list"] if item["dt_txt"].startswith(tomorrow)
            ]

            if not forecast:
                return f"❌ No forecast data available for {location} tomorrow."

            forecast_info = f"🌥️ **Tomorrow's Weather in {location}:**\n"
            for item in forecast:
                time = item["dt_txt"].split()[1]
                temp = item["main"]["temp"]
                desc = item["weather"][0]["description"]
                forecast_info += f"- {time}: {temp}°C, {desc}\n"

            return forecast_info

        else:
            return f"❌ Failed to fetch tomorrow's weather for {location}. Error: {response.status_code}"

    except Exception as e:
        return f"⚠️ Error: {str(e)}"

def get_5day_forecast(location):
    try:
        response = requests.get(f"{BASE_URL}/forecast", params={
            "q": location,
            "appid": OPENWEATHER_API_KEY,
            "units": "metric"
        })

        if response.status_code == 200:
            data = response.json()

            forecast_data = {}
            for item in data["list"]:
                date = item["dt_txt"].split()[0]
                time = item["dt_txt"].split()[1]
                temp = item["main"]["temp"]
                desc = item["weather"][0]["description"]

                if date not in forecast_data:
                    forecast_data[date] = []
                forecast_data[date].append(f"{time}: {temp}°C, {desc}")

            forecast_report = f"🌦️ **5-Day Weather Forecast for {location}:**\n"
            for date, weather in forecast_data.items():
                forecast_report += f"\n📅 {date}\n" + "\n".join(weather) + "\n"

            return forecast_report

        else:
            return f"❌ Failed to fetch 5-day forecast for {location}. Error: {response.status_code}"

    except Exception as e:
        return f"⚠️ Error: {str(e)}"

weather_agent = Agent(
    name="WeatherAgent",
    port=8001,
    seed="WeatherAgent secret phrase",
    endpoint=["http://127.0.0.1:8001/submit"]
)


THIRD_AGENT_ADDRESS = "agent1qde6yxgzmnp5v3c5ntkycx3tksqsr59ctam9k3702453dgk4qh9l745ee3m"


@weather_agent.on_message(model=Message)
async def handle_weather_request(ctx: Context, sender: str, msg: Message):
    request = msg.message.strip().lower()


    if "tomorrow" in request:
        location = request.replace("tomorrow", "").strip()
        weather_results = get_tomorrow_weather(location)
    elif "5-day" in request or "forecast" in request:
        location = request.replace("5-day", "").replace("forecast", "").strip()
        weather_results = get_5day_forecast(location)
    else:
        location = request  
        weather_results = get_today_weather(location)

    ctx.logger.info(f"✅ Sending weather data to ThirdAgent for location: {location}")
    
    await ctx.send(THIRD_AGENT_ADDRESS, Message(message=weather_results))


if __name__ == "__main__":
    weather_agent.run()

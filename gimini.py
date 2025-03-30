import google.generativeai as genai
from uagents import Agent, Context, Model
from uagents.setup import fund_agent_if_low

# 🟢 Soil Data Model
class SoilData(Model):
    ph: float
    nitrogen: float
    phosphorus: float
    potassium: float


# 🟢 Soil Analysis Function
def analyze_soil(ph, nitrogen, phosphorus, potassium):
    # Configure Gemini API
    genai.configure(api_key="AIzaSyDp7Ivw3QOZXBrl2yQc4sIPu6QAC20knQI")  # Replace with your actual Gemini API key

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")  # Use the latest model
        response = model.generate_content(
            f"""
            The soil has the following values:
            - pH: {ph}
            - Nitrogen (N): {nitrogen}
            - Phosphorus (P): {phosphorus}
            - Potassium (K): {potassium}

            Is the soil condition good? If not, suggest at least 3-4 organic and inorganic materials along with the quantity 
            required to improve the soil condition in a 10-liter pot.

            FORMAT:
            Soil Condition:
            - Nitrogen (N): 
            - Phosphorus (P): 
            - Potassium (K): 
            - pH: 

            To improve the soil:
            Organic:
            1. [Material Name] - [Quantity]
            2. [Material Name] - [Quantity]
            3. [Material Name] - [Quantity]

            Inorganic:
            1. [Material Name] - [Quantity]
            2. [Material Name] - [Quantity]
            3. [Material Name] - [Quantity]
            """
        )

        return response.text

    except Exception as e:
        return f"Error analyzing soil: {str(e)}"


# 🟢 Soil Analysis Agent Configuration
SoilAgent = Agent(
    name="SoilAgent",
    port=8005,
    seed="SoilAgent secret phrase",
    endpoint="http://127.0.0.1:8005/submit",  # Localhost for local testing
)
fund_agent_if_low(SoilAgent.wallet.address())

# Third Agent Address
THIRD_AGENT_ADDRESS = "agent1qde6yxgzmnp5v3c5ntkycx3tksqsr59ctam9k3702453dgk4qh9l745ee3m"


# 🟢 Handling Incoming Soil Data Messages
@SoilAgent.on_message(model=SoilData)
async def handle_search_prompt(ctx: Context, sender: str, msg: SoilData):
    ctx.logger.info(
        f"Received soil data from {sender}: pH={msg.ph}, N={msg.nitrogen}, P={msg.phosphorus}, K={msg.potassium}"
    )

    # Analyze the soil condition
    soil_report = analyze_soil(
        ph=msg.ph,
        nitrogen=msg.nitrogen,
        phosphorus=msg.phosphorus,
        potassium=msg.potassium,
    )

    # Log the report
    ctx.logger.info(f"Soil Analysis Report: {soil_report}")

    # Forward the message to the third agent
    await ctx.send(
        THIRD_AGENT_ADDRESS,
        SoilData(
            ph=msg.ph,
            nitrogen=msg.nitrogen,
            phosphorus=msg.phosphorus,
            potassium=msg.potassium,
        ),
    )


# 🟢 Run the agent
if __name__ == "__main__":
    SoilAgent.run()
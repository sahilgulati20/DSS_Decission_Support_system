import re
from uagents import Agent, Context, Model
from google import genai
from uagents.setup import fund_agent_if_low
from cosmpy.crypto.address import Address

# Model for the soil data message
class SoilData(Model):
    ph: float
    nitrogen: float
    phosphorus: float
    potassium: float

# Function to analyze soil quality
def analyze_soil(ph, nitrogen, phosphorus, potassium):
    client = genai.Client(api_key="AIzaSyDp7Ivw3QOZXBrl2yQc4sIPu6QAC20knQI")
    
    try:
        model = client.generative_model("gemini-2.0-flash")
        response = model.generate_content(
            contents=[{
                "role": "user",
                "parts": [f"""
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
                """]
            }]
        )
        return response.text

    except Exception as e:
        return f"Error analyzing soil: {str(e)}"

# Soil Analysis Agent
SoilAgent = Agent(
    name="SoilAgent",
    port=8005,
    seed="SoilAgent secret phrase",
    endpoint=["http://127.0.0.1:8001/submit"],
)

# Debug: print the wallet address to verify its format
print("Wallet address:", SoilAgent.wallet.address)

# Attempt to fund the agent if the wallet has a low balance
try:
    # Ensure that the wallet address is valid by directly using it if it's already in the correct format.
    valid_address = Address(SoilAgent.wallet.address)
    fund_agent_if_low(valid_address)
except Exception as e:
    print("Invalid wallet address. Please ensure your wallet is correctly initialized and returns a valid bech32 address.", e)

THIRD_AGENT_ADDRESS = "agent1qde6yxgzmnp5v3c5ntkycx3tksqsr59ctam9k3702453dgk4qh9l745ee3m"

# Handle incoming soil data messages
@SoilAgent.on_message(model=SoilData)
async def handle_soil_analysis(ctx: Context, sender: str, msg: SoilData):
    ctx.logger.info(f"Received soil data from {sender}")
    
    # Perform soil analysis
    result = analyze_soil(msg.ph, msg.nitrogen, msg.phosphorus, msg.potassium)
    
    # Log and send results to the third agent
    ctx.logger.info("Sending soil analysis results to ThirdAgent")
    await ctx.send(THIRD_AGENT_ADDRESS, SoilData(
        ph=msg.ph,
        nitrogen=msg.nitrogen,
        phosphorus=msg.phosphorus,
        potassium=msg.potassium
    ))
    
    # Send the analysis result as a separate message
    await ctx.send(THIRD_AGENT_ADDRESS, result)

if __name__ == "__main__":
    SoilAgent.run()

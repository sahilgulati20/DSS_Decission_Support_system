import google.generativeai as genai
from uagents import Agent, Context, Model
from uagents.setup import fund_agent_if_low
class SoilData(Model):
    ph: float
    nitrogen: float
    phosphorus: float
    potassium: float


def analyze_soil(ph, nitrogen, phosphorus, potassium):
    genai.configure(api_key="AIzaSyDp7Ivw3QOZXBrl2yQc4sIPu6QAC20knQI") 

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
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
soilagent2 = Agent(name="soilagent2",port=8080,seed="soilagent2 secret phrase",endpoint="http://127.0.0.1:8080/submit",)
fund_agent_if_low(soilagent2.wallet.address())
THIRD_AGENT_ADDRESS = "agent1qde6yxgzmnp5v3c5ntkycx3tksqsr59ctam9k3702453dgk4qh9l745ee3m"


@soilagent2.on_message(model=SoilData)
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


    ctx.logger.info(f"Soil Analysis Report: {soil_report}")

    await ctx.send(
        THIRD_AGENT_ADDRESS,
        SoilData(
            ph=msg.ph,
            nitrogen=msg.nitrogen,
            phosphorus=msg.phosphorus,
            potassium=msg.potassium,
        ),
    )

if __name__ == "__main__":
    soilagent2.run()
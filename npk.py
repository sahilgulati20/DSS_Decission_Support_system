from uagents import Agent, Context, Model

class Message(Model):
    ph: float
    nitrogen: float
    phosphorus: float
    potassium: float

RECEIVER_ADDRESS = "agent1qfl9chycg5uf05qdkqkk4cy6pver6rv9epkkeyvqdkydp45q7l7zx7jspeh"

UserInputAgent = Agent(
    name="UserInputAgent",
    port=8004,
    seed="UserInputAgent secret phrase",
    endpoint=["http://127.0.0.1:8004/submit"],
)

print(f"UserInputAgent Address: {UserInputAgent.address}")

async def send_user_data(ctx: Context):
    while True:
        try:
            ph = float(input("Enter pH level: "))
            nitrogen = float(input("Enter Nitrogen level: "))
            phosphorus = float(input("Enter Phosphorus level: "))
            potassium = float(input("Enter Potassium level: "))

            await ctx.send(RECEIVER_ADDRESS, Message(
                ph=ph,
                nitrogen=nitrogen,
                phosphorus=phosphorus,
                potassium=potassium
            ))
        except ValueError:
            print("Invalid input. Please enter valid float values.")

@UserInputAgent.on_event("startup")
async def on_start(ctx: Context):
    await send_user_data(ctx)

if __name__ == "__main__":
    UserInputAgent.run()

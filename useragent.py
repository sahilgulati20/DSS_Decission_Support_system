from uagents import Agent, Context, Model

class Message(Model):
    message: str

RECEIVER_ADDRESS = "agent1qg8j2v3xqk7kjsm4zng6982l92xf7gpldtvzenf4tfp6l6gvmqp57ntn58z"

UserInputAgent = Agent(
    name="UserInputAgent",
    port=8000,
    seed="UserInputAgent secret phrase",
    endpoint=["http://127.0.0.1:8000/submit"],
)

print(f"UserInputAgent Address: {UserInputAgent.address}")

async def send_user_message(ctx: Context):
    while True:
        user_message = input("Enter your location: ")
        await ctx.send(RECEIVER_ADDRESS, Message(message=user_message))

@UserInputAgent.on_event("startup")
async def on_start(ctx: Context):
    await send_user_message(ctx)

if __name__ == "__main__":
    UserInputAgent.run()

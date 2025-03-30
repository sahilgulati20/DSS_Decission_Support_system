from uagents import Agent, Context, Model

class Message(Model):
    message: str

ThirdAgent = Agent(name="ThirdAgent", port=8002, seed="ThirdAgent secret phrase", endpoint=["http://127.0.0.1:8002/submit"],)

@ThirdAgent.on_message(model=Message)
async def handle_data_from_receiver(ctx: Context, sender: str, msg: Message):
    received_data = msg.message
    ctx.logger.info(f"Received data from {sender}: {received_data}")

if __name__ == "__main__":
    ThirdAgent.run()

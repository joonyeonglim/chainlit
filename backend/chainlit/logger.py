import logging
import sys

logging.basicConfig(
    level=logging.INFO,
    stream=sys.stdout,
    format="%(asctime)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

logging.getLogger("socketio").setLevel(logging.ERROR)
logging.getLogger("engineio").setLevel(logging.ERROR)
logging.getLogger("numexpr").setLevel(logging.ERROR)
logging.getLogger("llmchatbot").setLevel(logging.ERROR)

chat_logger = logging.getLogger("llmchatbot.child")
logger = logging.getLogger("chainlit")

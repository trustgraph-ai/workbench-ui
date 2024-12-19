
import logging

from . api import Api

def run():

    logging.basicConfig(
        level=logging.DEBUG,
        format="%(asctime)s %(levelname)s %(message)s"
    )

    logging.info("Starting...")

    a = Api(port=8888, gateway="ws://localhost:8088/")

    a.run()

if __name__ == '__main__':
    run()


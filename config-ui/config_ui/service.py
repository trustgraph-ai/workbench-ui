
import logging

from . api import Api

def run():

    logging.basicConfig(
        level=logging.DEBUG,
        format="%(asctime)s %(levelname)s %(message)s"
    )

    logging.info("Starting...")

    a = Api()

    a.run()

if __name__ == '__main__':
    run()


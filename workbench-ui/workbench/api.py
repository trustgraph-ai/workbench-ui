
import asyncio
import aiohttp
from aiohttp import web
import yaml
import zipfile
from io import BytesIO
import importlib.resources
import json

import logging
logger = logging.getLogger("api")
logger.setLevel(logging.INFO)

class Running:
    def __init__(self): self.running = True
    def get(self): return self.running
    def stop(self): self.running = False

class Api:
    def __init__(self, **config):

        self.port = int(config.get("port", "8888"))
        self.gateway = config.get("gateway", "http://api-gateway:8088")

        if self.gateway[-1] != "/":
            self.gateway += "/"

        self.app = web.Application(middlewares=[])

        self.app.add_routes([web.get("/api/socket", self.socket)])

        self.app.add_routes([web.get("/{tail:.*}", self.everything)])

        self.ui = importlib.resources.files().joinpath("ui")

    def open(self, path):

        if ".." in path:
            raise web.HTTPNotFound()

        if len(path) > 0:
            if path[0] == "/":
                path = path[1:]

        if path == "": path = "index.html"

        try:
            p = self.ui.joinpath(path)
            t = p.read_text()
            return t
        except:
            raise web.HTTPNotFound()

    def open_binary(self, path):

        if ".." in path:
            raise web.HTTPNotFound()

        if len(path) > 0:
            if path[0] == "/":
                path = path[1:]

        if path == "": path = "index.html"

        try:
            p = self.ui.joinpath(path)
            t = p.read_bytes()
            return t
        except:
            raise web.HTTPNotFound()

    async def everything(self, request):

        try:

            if request.path.endswith(".css"):
                t = self.open(request.path)
                return web.Response(
                    text=t, content_type="text/css"
                )

            if request.path.endswith(".png"):
                t = self.open_binary(request.path)
                return web.Response(
                    body=t, content_type="image/png"
                )

            if request.path.endswith(".svg"):
                t = self.open(request.path)
                return web.Response(
                    text=t, content_type="image/svg+xml"
                )

            if request.path.endswith(".js"):
                t = self.open(request.path)
                return web.Response(
                    text=t, content_type="text/javascript"
                )

            if request.path == "/" or request.path.endswith(".html"):
                t = self.open(request.path)
                return web.Response(
                    text=t, content_type="text/html"
                )

            return web.HTTPNotFound()

        except Exception as e:
            logging.error(f"Exception: {e}")
            raise web.HTTPInternalServerError()

    async def socket(self, request):

        ws_server = web.WebSocketResponse()
        await ws_server.prepare(request)

        session = aiohttp.ClientSession()

        url = self.gateway + "api/v1/socket"

        running = Running()

        async with session.ws_connect(url) as ws_client:

            async def wsforward(ws_from, ws_to, running):

                while running.get():

                    try:
                        msg = await ws_from.receive(timeout=1000)
                    except TimeoutError:
                        continue

                    mt = msg.type
                    md = msg.data

                    if mt == aiohttp.WSMsgType.TEXT:
                        await ws_to.send_str(md)
                    elif mt == aiohttp.WSMsgType.BINARY:
                        await ws_to.send_bytes(md)
                    elif mt == aiohttp.WSMsgType.PING:
                        await ws_to.ping()
                    elif mt == aiohttp.WSMsgType.PONG:
                        await ws_to.pong()
                    elif mt == aiohttp.WSMsgType.CLOSE:
                        break
                    else:
                        print("Weird message", mt)
                        break

                running.stop()

            s2c_task = asyncio.create_task(
                wsforward(ws_server, ws_client, running)
            )

            await wsforward(ws_client, ws_server, running)

            running.stop()

            await ws_server.close()
            await ws_client.close()

            await s2c_task

        await session.close()

        return ws_server

    def run(self):

        web.run_app(self.app, port=self.port)


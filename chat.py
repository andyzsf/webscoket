# !/usr/bin/env python
# -*- coding:utf-8 -*-

import logging
import tornado.escape
import tornado.ioloop
import tornado.options
import tornado.web
import tornado.websocket
import os.path
import base64,random,logging,string,time
import uuid

from tornado.options import define, options
define("port", default=8888, help="run on the given port", type=int)


class BaseHandler(tornado.web.RequestHandler):
    def get_current_user(self):
        return self.get_secure_cookie("username")



class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r'/', MainHandler),
            (r'/chat/chatsocket', ChatSocketHandler),
            (r'/chat/login', LoginHandler),
            (r'/chat/logout', LogoutHandler),
            (r'/chat/register', RegisterHandler),
            (r'/chat/verifycode', VerigyCode),
        ]
        settings = {
            "cookie_secret": base64.b64encode(uuid.uuid4().bytes + uuid.uuid4().bytes),
            "template_path": os.path.join(os.path.dirname(__file__), 'templates'),
            "static_path": os.path.join(os.path.dirname(__file__), 'static'),
            "xsrf_cookies": "=True",
            "login_url": "/chat/login",
        }

        tornado.web.Application.__init__(self, handlers, **settings)


class MainHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        self.render("index.html", messages=ChatSocketHandler.cache, user=self.current_user)


class LoginHandler(BaseHandler):
    def get(self):
        self.render('login.html')

    def post(self):
        self.set_secure_cookie("username", self.get_argument("username"))
        #  redis.set(uid, uid)
        self.redirect('/')


class LogoutHandler(BaseHandler):
    def get(self):
        if self.get_secure_cookie("username"):
            self.clear_cookie("username")
            self.redirect('/')


class VerigyCode(BaseHandler):
    pass


class RegisterHandler(BaseHandler):
    def get(self):
        self.render('register.html')


class ChatSocketHandler(tornado.websocket.WebSocketHandler):
    waiters = set()
    cache = []
    cache_size = 200

    def get_compression_options(self):
        return {}

    def open(self, *args, **kwargs):
        ChatSocketHandler.waiters.add(self)

    def on_close(self):
        ChatSocketHandler.waiters.remove(self)

    @classmethod
    def update_cache(cls, chat):
        cls.cache.append(chat)
        if len(cls.cache) > cls.cache_size:
            cls.cache = cls.cache[-cls.cache_size:]

    @classmethod
    def send_updates(cls, chat):
        logging.info("sending message to %d waiters", len(cls.waiters))
        for waiter in cls.waiters:
            try:
                waiter.write_message(chat)
            except:
                logging.error("error sending message", exc_info=True)

    def on_message(self, message):

        logging.info("got message %r", message)
        parsed = tornado.escape.json_decode(message)
        chat = {
            "id": str(uuid.uuid4()),
            "body": parsed["body"],
            "username": parsed["username"]
        }

        chat["html"] = tornado.escape.to_basestring(
            self.render_string("message.html", message=chat)
        )
        ChatSocketHandler.update_cache(chat)
        ChatSocketHandler.send_updates(chat)

        # def check_origin(self, origin):
        # return True


def main():
    tornado.options.parse_command_line()
    app = Application()
    app.listen(options.port)
    tornado.ioloop.IOLoop.current().start()


if __name__ == '__main__':
    main()

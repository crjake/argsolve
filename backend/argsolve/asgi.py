"""
ASGI config for argsolve project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.1/howto/deployment/asgi/
"""
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'argsolve.settings')

from channels.security.websocket import AllowedHostsOriginValidator
from channels.auth import AuthMiddlewareStack
from api.routing import websocket_urlpatterns
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

import sys
sys.path.append('..')


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'argsolve.settings')

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": AllowedHostsOriginValidator(
            AuthMiddlewareStack(URLRouter(websocket_urlpatterns))
        ),
    }
)

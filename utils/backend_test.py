import requests
import json

endpoint = "http://127.0.0.1:8000/api/"

print(requests.get(endpoint).json())

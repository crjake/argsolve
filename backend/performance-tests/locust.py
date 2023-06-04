# from locust import HttpUser, task, between, TaskSet, events
# import requests

# URL = "http://localhost:8000/api"

# class GameRoomTaskSet(TaskSet):
#     ROOM_ID = None

#     @task
#     def random_task_1(self):
#         response = self.client.get("/get-room/" + self.ROOM_ID)
#         if response.status_code == 200:
#             print("Fetch success")

# @events.test_start.add_listener
# def on_test_start(environment, **kwargs):
#     print("A new test is starting")
#     response = requests.post(URL + "/create-room", json={"host": "test", "topic": "Locust"})
#     if response.status_code == 200:
#             print("Game room created")
#             GameRoomTaskSet.ROOM_ID = response.json().get("roomId")
#     else:
#          print("COULDN'T CREATE ROOM")


# class MyUser(HttpUser):
#     wait_time = between(1, 3)
#     tasks = [GameRoomTaskSet]

from locust import HttpUser, task, between, TaskSet, events
import requests

URL = "http://localhost:8000/api"


class GameRoomTaskSet(TaskSet):
    ROOM_ID = None  # Class variable to store the room ID

    @task(5)
    def get_room(self):
        response = self.client.get(f"/get-room/{GameRoomTaskSet.ROOM_ID}")

    # @task(1)
    # def create_room(self):
    #     self.client.get("/get-examples")
    #     self.client.post("/create-room", json={"host": "test", "topic": "Locust"})

    @task(1)
    def get_examples(self):
        self.client.get("/get-examples")

    @task(3)
    def get_rooms(self):
        response = self.client.get("/rooms")


def on_test_start(environment, **kwargs):
    global ROOM_ID  # Declare ROOM_ID as global
    print("A new test is starting")
    response = requests.post(f"{URL}/create-room", json={"host": "test", "topic": "Locust"})
    print("Game room created")
    print(response.json())
    GameRoomTaskSet.ROOM_ID = response.json().get("roomId")


events.test_start.add_listener(on_test_start)  # Register the event listener


class MyUser(HttpUser):
    wait_time = between(1, 3)
    tasks = [GameRoomTaskSet]
    user_count = 0

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        MyUser.user_count += 1
        self.username = f"user_{MyUser.user_count}"  # Assign unique username

    def on_start(self):
        response = self.client.post("/create-user", json={"username": self.username})
        if response.status_code != 201:
            print("Error creating user...")

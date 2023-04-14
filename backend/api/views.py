import json

import jsonpickle
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .argsolve_core import ArgSolve, RoomSerializer

argsolve = ArgSolve()


@api_view(['POST'])
@permission_classes([AllowAny])
def create_user(request):
    username = request.data.get('username')

    # Check if username is already taken
    if username in argsolve.users:
        return Response({'failure': 'Username taken.'}, status=status.HTTP_200_OK)

    # Validate input data
    if not username:
        return Response({'failure': 'Username is required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Create new user
    argsolve.create_user(username)
    return Response({'success': 'User created.'}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def create_room(request):
    # Retrieve data from request body
    host = request.data.get("host")
    topic = request.data.get("topic")

    # Validate input data
    if not all([host, topic]):
        return Response({'failure': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Create new room
    room_id = argsolve.create_room(topic, host)
    return Response({'success': f'Room created with id {room_id}.', 'roomId': room_id}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def get_rooms(request):
    response = Response(data=RoomSerializer(list(argsolve.rooms.values()), many=True).data, status=status.HTTP_200_OK)
    return response


@api_view(['GET'])
def get_room(request):
    # get room id
    pass

from rest_framework import serializers
from .models import Attendance, AttendanceRequest


class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = '__all__'


class AttendanceRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceRequest
        fields = '__all__'
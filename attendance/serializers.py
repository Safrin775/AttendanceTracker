from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Attendance, AttendanceRequest


class UserSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_superuser']


class AttendanceSerializer(serializers.ModelSerializer):
    
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    
    class Meta:
        model = Attendance
        fields = '__all__'
        read_only_fields = ['id', 'user']


class AttendanceRequestSerializer(serializers.ModelSerializer):
    
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = AttendanceRequest
        fields = '__all__'
        read_only_fields = ['id', 'user', 'status']


class AttendanceRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceRequest
        fields = ['request_type', 'leave_type', 'reason', 'from_date', 'to_date']
    
    def validate(self, data):
        
        from datetime import date
        if data['from_date'] < date.today():
            raise serializers.ValidationError("Cannot apply for past dates")
        
        if data['to_date'] < data['from_date']:
            raise serializers.ValidationError("End date cannot be before start date")
        
        return data
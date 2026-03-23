from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.middleware.csrf import get_token  # ADD THIS
from datetime import date, datetime, time
from .models import Attendance, AttendanceRequest
from .serializers import (
    UserSerializer, AttendanceSerializer, 
    AttendanceRequestSerializer, AttendanceRequestCreateSerializer
)


# ============ CSRF ENDPOINT ============
@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf_token(request):
    """Get CSRF token for frontend"""
    csrf_token = get_token(request)
    return Response({'csrfToken': csrf_token})


# ============ AUTHENTICATION VIEWS ============
@api_view(['POST'])
@permission_classes([AllowAny])
def user_login(request):
    """Login user and create session"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {'error': 'Username and password required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(username=username, password=password)
    
    if user:
        login(request, user)  # Creates session
        serializer = UserSerializer(user)
        return Response({
            'success': True,
            'user': serializer.data
        })
    else:
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def user_logout(request):
    """Logout user and destroy session"""
    logout(request)
    return Response({'success': True})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """Get current logged in user"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def user_register(request):
    """Register new user"""
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email', '')
    
    if not username or not password:
        return Response(
            {'error': 'Username and password required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if User.objects.filter(username=username).exists():
        return Response(
            {'error': 'Username already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if email and User.objects.filter(email=email).exists():
        return Response(
            {'error': 'Email already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = User.objects.create_user(
        username=username,
        password=password,
        email=email
    )
    
    serializer = UserSerializer(user)
    return Response({
        'success': True,
        'user': serializer.data
    })


# ============ ATTENDANCE VIEWS ============
class AttendanceViewSet(viewsets.ModelViewSet):
    """ViewSet for Attendance model"""
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter attendance records for current user"""
        return Attendance.objects.filter(user=self.request.user).order_by('-date')
    
    def perform_create(self, serializer):
        """Set the user when creating attendance"""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's attendance record"""
        today = date.today()
        attendance = Attendance.objects.filter(
            user=request.user, 
            date=today
        ).first()
        
        if attendance:
            serializer = self.get_serializer(attendance)
            return Response(serializer.data)
        return Response(
            {'message': 'No attendance record for today'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    @action(detail=False, methods=['post'])
    def mark(self, request):
        """Mark attendance (check-in/check-out)"""
        today = date.today()
        current_time = datetime.now().time()
        
        # Check if user has approved leave/WFH for today
        has_request = AttendanceRequest.objects.filter(
            user=request.user,
            from_date__lte=today,
            to_date__gte=today,
            status='Approved'
        ).exists()
        
        if has_request:
            return Response(
                {'error': 'You have an approved leave/WFH for today. Cannot mark attendance.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create attendance record
        attendance, created = Attendance.objects.get_or_create(
            user=request.user,
            date=today,
            defaults={'status': 'Present'}
        )
        
        # Handle check-in/check-out
        if not attendance.in_time:
            attendance.in_time = current_time
            message = "Check-in recorded successfully"
        elif not attendance.out_time:
            attendance.out_time = current_time
            message = "Check-out recorded successfully"
        else:
            return Response(
                {'error': 'Attendance already completed for today'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        attendance.save()
        serializer = self.get_serializer(attendance)
        return Response({
            'message': message,
            'data': serializer.data
        })


# ============ ATTENDANCE REQUEST VIEWS ============
class AttendanceRequestViewSet(viewsets.ModelViewSet):
    """ViewSet for AttendanceRequest model"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """Use different serializer for create operation"""
        if self.action == 'create':
            return AttendanceRequestCreateSerializer
        return AttendanceRequestSerializer
    
    def get_queryset(self):
        """Filter requests for current user"""
        return AttendanceRequest.objects.filter(user=self.request.user).order_by('-from_date')
    
    def perform_create(self, serializer):
        """Set user and initial status when creating request"""
        serializer.save(user=self.request.user, status='Pending')
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending requests for current user"""
        pending = self.get_queryset().filter(status='Pending')
        serializer = self.get_serializer(pending, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def approved(self, request):
        """Get approved requests for current user"""
        approved = self.get_queryset().filter(status='Approved')
        serializer = self.get_serializer(approved, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def rejected(self, request):
        """Get rejected requests for current user"""
        rejected = self.get_queryset().filter(status='Rejected')
        serializer = self.get_serializer(rejected, many=True)
        return Response(serializer.data)


# ============ ADMIN VIEWS ============
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def run_daily_absent_marking(request):
    """Admin only endpoint to mark absent users"""
    if not request.user.is_staff:
        return Response(
            {'error': 'Permission denied. Admin access required.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    today = date.today()
    current_time = datetime.now().time()
    cutoff_time = time(18, 0)  # 6:00 PM
    
    if current_time < cutoff_time:
        return Response(
            {'error': f'Too early to mark absent. Current time: {current_time}, Required after: {cutoff_time}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    users = User.objects.all()
    marked_absent = []
    skipped_users = []
    
    for user in users:
        exists = Attendance.objects.filter(user=user, date=today).exists()
        
        if not exists:
            has_request = AttendanceRequest.objects.filter(
                user=user,
                from_date__lte=today,
                to_date__gte=today,
                status='Approved'
            ).exists()
            
            if not has_request:
                Attendance.objects.create(
                    user=user,
                    date=today,
                    status="Absent"
                )
                marked_absent.append(user.username)
            else:
                skipped_users.append(user.username)
    
    return Response({
        'success': True,
        'message': f'Marked {len(marked_absent)} users as absent',
        'marked_absent': marked_absent,
        'skipped_with_requests': skipped_users,
        'total_users': users.count()
    })
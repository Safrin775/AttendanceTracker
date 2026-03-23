from django.db import models
from django.contrib.auth.models import User


class Attendance(models.Model):

    STATUS_CHOICES = [
        ('Present', 'Present'),
        ('Leave', 'Leave'),
        ('WFH', 'Work From Home'),
        ('Absent', 'Absent'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()

    in_time = models.TimeField(null=True, blank=True)
    out_time = models.TimeField(null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Present')

    class Meta:
        unique_together = ['user', 'date']
        ordering = ['-date']

    def __str__(self):
        return f"{self.user.username} - {self.date}"


class AttendanceRequest(models.Model):

    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]

    REQUEST_TYPE = [
        ('Leave', 'Leave'),
        ('WFH', 'WFH'),
    ]

    LEAVE_TYPES = [
        ('Sick', 'Sick Leave'),
        ('Casual', 'Casual Leave'),
        ('Emergency', 'Emergency Leave'),
        ('Personal', 'Personal Leave'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    request_type = models.CharField(max_length=10, choices=REQUEST_TYPE)

    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPES, null=True, blank=True)
    reason = models.TextField(null=True, blank=True)

    from_date = models.DateField()
    to_date = models.DateField()

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Pending')

    def __str__(self):
        return f"{self.user.username} - {self.request_type}"
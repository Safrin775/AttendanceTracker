from django.contrib import admin
from datetime import timedelta
from .models import Attendance, AttendanceRequest


class AttendanceRequestAdmin(admin.ModelAdmin):
    list_display = ('user', 'request_type', 'leave_type', 'from_date', 'to_date', 'status')
    list_filter = ('status', 'request_type', 'leave_type')
    search_fields = ('user__username', 'reason')
    actions = ['approve_requests', 'reject_requests']
    
    def approve_requests(self, request, queryset):
        """Bulk approve requests"""
        for obj in queryset:
            if obj.status == 'Pending':
                obj.status = 'Approved'
                obj.save()
                
                # Create attendance records for approved request
                current = obj.from_date
                while current <= obj.to_date:
                    Attendance.objects.get_or_create(
                        user=obj.user,
                        date=current,
                        defaults={"status": obj.request_type}
                    )
                    current += timedelta(days=1)
        
        self.message_user(request, f"{queryset.count()} requests approved.")
    approve_requests.short_description = "Approve selected requests"
    
    def reject_requests(self, request, queryset):
        """Bulk reject requests"""
        for obj in queryset:
            if obj.status == 'Pending':
                obj.status = 'Rejected'
                obj.save()
        
        self.message_user(request, f"{queryset.count()} requests rejected.")
    reject_requests.short_description = "Reject selected requests"
    
    def save_model(self, request, obj, form, change):
        """Handle status changes when saving individual request"""
        previous = None
        
        if change:
            previous = AttendanceRequest.objects.get(pk=obj.pk)
        
        super().save_model(request, obj, form, change)
        
        # Handle approval
        if obj.status == "Approved":
            current = obj.from_date
            while current <= obj.to_date:
                Attendance.objects.get_or_create(
                    user=obj.user,
                    date=current,
                    defaults={"status": obj.request_type}
                )
                current += timedelta(days=1)
        
        # Handle rejection of previously approved request
        if previous and previous.status == "Approved" and obj.status == "Rejected":
            current = obj.from_date
            while current <= obj.to_date:
                Attendance.objects.filter(
                    user=obj.user,
                    date=current,
                    status=obj.request_type
                ).delete()
                current += timedelta(days=1)


admin.site.register(Attendance)
admin.site.register(AttendanceRequest, AttendanceRequestAdmin)
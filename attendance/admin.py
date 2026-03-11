from django.contrib import admin
from datetime import timedelta
from .models import Attendance, AttendanceRequest


class AttendanceRequestAdmin(admin.ModelAdmin):

    list_display = ('user', 'request_type', 'leave_type', 'from_date', 'to_date', 'status')

    def save_model(self, request, obj, form, change):

        previous = None

        if change:
            previous = AttendanceRequest.objects.get(pk=obj.pk)

        super().save_model(request, obj, form, change)

        
        if obj.status == "Approved":

            current = obj.from_date

            while current <= obj.to_date:

                Attendance.objects.get_or_create(
                    user=obj.user,
                    date=current,
                    defaults={"status": obj.request_type}
                )

                current += timedelta(days=1)

        
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
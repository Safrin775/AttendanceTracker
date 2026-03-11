from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.contrib import messages
from datetime import date, datetime
from .models import Attendance, AttendanceRequest


@login_required
def attendance_dashboard(request):

    records = Attendance.objects.filter(user=request.user).order_by('-date')

    today = date.today()

    today_record = Attendance.objects.filter(
        user=request.user,
        date=today
    ).first()

    return render(request, 'attendance/attendance.html', {
        'records': records,
        'today_record': today_record,
        'today': today
    })


@login_required
def mark_attendance(request):

    today = date.today()

    attendance = Attendance.objects.filter(
        user=request.user,
        date=today
    ).first()

    if attendance and attendance.status == "Leave":
        messages.error(request, "You are on Leave today.")
        return redirect('attendance')

    if attendance and attendance.status == "WFH":
        messages.error(request, "WFH applied for today.")
        return redirect('attendance')

    attendance, created = Attendance.objects.get_or_create(
        user=request.user,
        date=today,
        defaults={'status': 'Present'}
    )

    if not attendance.in_time:
        attendance.in_time = datetime.now().time()
        messages.success(request, "Check-in recorded.")

    elif not attendance.out_time:
        attendance.out_time = datetime.now().time()
        messages.success(request, "Check-out recorded.")

    else:
        messages.warning(request, "Attendance already completed today.")

    attendance.save()

    return redirect('attendance')


@login_required
def apply_leave(request):

    if request.method == "POST":

        from_date = request.POST.get("from_date")
        to_date = request.POST.get("to_date")
        leave_type = request.POST.get("leave_type")
        reason = request.POST.get("reason")

        today = date.today()

        if from_date < str(today):
            messages.error(request, "Cannot apply leave for past dates.")
            return redirect("leave")

        if str(today) == from_date:
            if Attendance.objects.filter(user=request.user, date=today).exists():
                messages.error(request, "Attendance already marked today.")
                return redirect("attendance")

        AttendanceRequest.objects.create(
            user=request.user,
            request_type="Leave",
            leave_type=leave_type,
            reason=reason,
            from_date=from_date,
            to_date=to_date,
            status="Pending"
        )

        messages.success(request, "Leave request sent.")
        return redirect("attendance")

    return render(request, "attendance/leave.html", {"today": date.today()})


@login_required
def apply_wfh(request):

    if request.method == "POST":

        from_date = request.POST.get("from_date")
        to_date = request.POST.get("to_date")

        today = date.today()

        if from_date < str(today):
            messages.error(request, "Cannot apply WFH for past dates.")
            return redirect("attendance")

        if str(today) == from_date:
            if Attendance.objects.filter(user=request.user, date=today).exists():
                messages.error(request, "Attendance already marked today.")
                return redirect("wfh")

        AttendanceRequest.objects.create(
            user=request.user,
            request_type="WFH",
            from_date=from_date,
            to_date=to_date,
            status="Pending"
        )

        messages.success(request, "WFH request sent.")
        return redirect("attendance")

    return render(request, "attendance/wfh.html", {"today": date.today()})
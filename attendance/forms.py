from django import forms
from datetime import date

class AttendanceForm(forms.Form):
    date = forms.DateField(
        initial=date.today,
        widget=forms.DateInput(attrs={
            'type': 'date',
            'min': date.today(),
            'max': date.today()
        })
    )

class LeaveForm(forms.Form):
    from_date = forms.DateField(widget=forms.DateInput(attrs={'type':'date'}))
    to_date = forms.DateField(widget=forms.DateInput(attrs={'type':'date'}))

class WFHForm(forms.Form):
    from_date = forms.DateField(widget=forms.DateInput(attrs={'type':'date'}))
    to_date = forms.DateField(widget=forms.DateInput(attrs={'type':'date'}))
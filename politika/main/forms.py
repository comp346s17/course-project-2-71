from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User


class SignUpForm(UserCreationForm):
    first_name = forms.CharField(max_length=30, required=False, help_text='Optional.', widget=forms.TextInput(attrs={'class' : "form-control", 'placeholder' :"First Name"}))
    last_name = forms.CharField(max_length=30, required=False, help_text='Optional.', widget=forms.TextInput(attrs={'class' : "form-control", 'placeholder' :"Last Name"}))
    profile_pic = forms.CharField(required=False, help_text='Optional.')
    about = forms.CharField(widget=forms.Textarea, required=False, help_text='Optional.')

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'profile_pic', 'password1', 'password2', 'about' )
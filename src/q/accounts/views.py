from django.shortcuts import render_to_response, get_object_or_404
from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.template import RequestContext
from django.contrib.auth.decorators import login_required

from django.contrib.auth.models import User
from django.contrib.auth import (authenticate,
                                login as auth_login,
                                logout as auth_logout)

from q.accounts import forms

def view_user_list(request, template_name="accounts/users_list.html"):
    ctx = {}

    users = User.objects.all()

    ctx.update({'users': users})
    return render_to_response(template_name, RequestContext(request, ctx))

@login_required
def view_user(request, template_name="accounts/dashboard.html",  *args, **kwargs):
    ctx = {}

    can_edit = False
    username = kwargs.get('username').lower()
    user = User.objects.get(username=request.user)

    if user.username == request.user.username:
        can_edit = True

    ctx.update({'user': user, 'can_edit':can_edit})
    return render_to_response(template_name, RequestContext(request, ctx))

def login(request, template_name="accounts/login.html"):
    ctx = {}
    messages = []
    if request.user.is_authenticated():
        return HttpResponseRedirect(reverse('index'))

    if request.method == 'POST':
        form = forms.LoginForm(request.POST)
        if form.is_valid():
            try:
                given_username = form.cleaned_data['username']
                given_password = form.cleaned_data['password']
                user = User.objects.get(username=given_username)
                user = authenticate(username=user.username,
                                    password=given_password)

                if user is not None:
                    if user.is_active:
                        auth_login(request, user)
                        return HttpResponseRedirect(reverse('index'))
                    else:
                        messages.append("Your account is currently deactivated.")
                else:
                    messages.append("Invalid account.")

            except User.DoesNotExist:
                pass
    else:
        form = forms.LoginForm()

    ctx.update({'form':form, 'messages':messages})
    return render_to_response(template_name, RequestContext(request, ctx))


def logout(request):

    auth_logout(request)

    return HttpResponseRedirect(reverse('login'))

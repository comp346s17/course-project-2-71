from django.contrib.auth import update_session_auth_hash
from rest_framework import serializers
from main.models import OurUser

class OurUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    confirm_password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = OurUser
        fields = ('id', 'username',
        'first_name', 'last_name', 'password',
        'confirm_password',)

        def create(self, validated_data):
            return OurUser.objects.create(**validated_data)

        def update(self, instance, validated_data):
            instance.username = validated_data.get('username', instance.username)

            instance.save()

            password = validated_data.get('password', None)
            confirm_password = validated_data.get('confirm_password', None)

            if password and confirm_password and password == confirm_password:
                instance.set_password(password)
                instance.save()

            update_session_auth_hash(self.context.get('request'), instance)

            return instance
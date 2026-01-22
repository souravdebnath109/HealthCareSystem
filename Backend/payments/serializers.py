# from rest_framework import serializers
# from .models import Stripe_Payment

# class PaymentSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Stripe_Payment
#         fields = ['id', 'amount', 'currency', 'stripe_payment_id', 'created_at','user_email']



# payments/serializers.py
# payments/serializers.py
# payments/serializers.py
from rest_framework import serializers
from .models import Stripe_Payment

class PaymentSerializer(serializers.ModelSerializer):
    product_names = serializers.SerializerMethodField()

    class Meta:
        model = Stripe_Payment
        fields = [
            "id",
            "amount",
            "currency",
            "stripe_payment_id",
            "created_at",
            "user_email",
            "product_names",
        ]

    def get_product_names(self, obj):
        if not obj.order or not obj.order.items:
            return []
        return [it.get("name") for it in obj.order.items if it.get("name")]

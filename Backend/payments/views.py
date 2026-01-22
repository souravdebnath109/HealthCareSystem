



#   version 2 ---(automatic fillup)


# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status, generics, permissions
# from rest_framework.generics import ListAPIView
# import stripe
# import json
# from django.conf import settings
# from .models import Stripe_Payment
# from .serializers import PaymentSerializer
# from .utils import convert_bdt_to_usd

# stripe.api_key = settings.STRIPE_SECRET_KEY


# class PaymentListView(ListAPIView):
#     queryset = Stripe_Payment.objects.all()
#     serializer_class = PaymentSerializer


# class CreatePaymentIntentView(APIView):
#     permission_classes = [permissions.IsAuthenticated]  # Require authentication

#     def post(self, request):
#         try:
#             data = json.loads(request.body.decode("utf-8"))
#             amount_in_bdt = data.get("amount")
#             # Use authenticated user's email
#             email = request.user.email
#         except json.JSONDecodeError:
#             return Response({'error': 'Invalid JSON format'}, status=400)

#         if not email:
#             return Response({'error': 'Invalid email'}, status=400)
#         if not amount_in_bdt or int(amount_in_bdt) <= 0:
#             return Response({'error': 'Invalid amount'}, status=400)

#         # Convert BDT to USD
#         try:
#             amount_in_usd_cents = convert_bdt_to_usd(int(amount_in_bdt))
#         except Exception as e:
#             return Response({'error': f'Currency conversion failed: {str(e)}'}, status=400)

#         # Create the Stripe payment intent
#         try:
#             intent = stripe.PaymentIntent.create(
#                 amount=amount_in_usd_cents,
#                 currency="usd",
#             )
#             payment_data = {
#                 'amount': amount_in_bdt,
#                 'currency': "bdt",
#                 'stripe_payment_id': intent['id'],
#                 'user_email': email
#             }
#             serializer = PaymentSerializer(data=payment_data)
#             if serializer.is_valid():
#                 serializer.save()
#                 return Response({
#                     'clientSecret': intent['client_secret'],
#                     'payment': serializer.data,
#                 }, status=status.HTTP_201_CREATED)
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         except stripe.error.StripeError as e:
#             return Response({'error': str(e)}, status=400)


# class PaymentHistoryView(generics.ListAPIView):
#     serializer_class = PaymentSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def get_queryset(self):
#         return Stripe_Payment.objects.filter(user_email=self.request.user.email)



#version 3 (admin product name show )
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from rest_framework.generics import ListAPIView
import stripe
import json
from django.conf import settings

from .models import Stripe_Payment
from .serializers import PaymentSerializer
from .utils import convert_bdt_to_usd

from api.models import Order  # ✅ Order model import

stripe.api_key = settings.STRIPE_SECRET_KEY


# 🔹 List ALL payments (admin / internal use)
class PaymentListView(ListAPIView):
    queryset = Stripe_Payment.objects.all().order_by("-created_at")
    serializer_class = PaymentSerializer


# 🔹 Create Stripe Payment Intent & SAVE order
class CreatePaymentIntentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # -----------------------------
        # Parse JSON
        # -----------------------------
        try:
            data = json.loads(request.body.decode("utf-8"))
            amount_in_bdt = data.get("amount")
            order_id = data.get("order_id")  # ✅ REQUIRED
            email = request.user.email
        except json.JSONDecodeError:
            return Response(
                {"error": "Invalid JSON format"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # -----------------------------
        # Validations
        # -----------------------------
        if not email:
            return Response(
                {"error": "Invalid user email"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not amount_in_bdt or int(amount_in_bdt) <= 0:
            return Response(
                {"error": "Invalid amount"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not order_id:
            return Response(
                {"error": "order_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # -----------------------------
        # Validate Order belongs to user
        # -----------------------------
        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found for this user"},
                status=status.HTTP_404_NOT_FOUND
            )

        # -----------------------------
        # Convert BDT → USD cents
        # -----------------------------
        try:
            amount_in_usd_cents = convert_bdt_to_usd(int(amount_in_bdt))
        except Exception as e:
            return Response(
                {"error": f"Currency conversion failed: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # -----------------------------
        # Create Stripe PaymentIntent
        # -----------------------------
        try:
            intent = stripe.PaymentIntent.create(
                amount=amount_in_usd_cents,
                currency="usd",
                metadata={
                    "order_id": str(order.id),
                    "user_email": email,
                },
            )

            # -----------------------------
            # Save payment in DB (LINK ORDER)
            # -----------------------------
            payment = Stripe_Payment.objects.create(
                amount=amount_in_bdt,
                currency="bdt",
                stripe_payment_id=intent["id"],
                user_email=email,
                order=order,  # ✅ FK LINKED
            )

            serializer = PaymentSerializer(payment)

            return Response(
                {
                    "clientSecret": intent["client_secret"],
                    "payment": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        except stripe.error.StripeError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


# 🔹 Logged-in user's payment history
class PaymentHistoryView(generics.ListAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Stripe_Payment.objects.filter(
            user_email=self.request.user.email
        ).order_by("-created_at")

from rest_framework import viewsets, generics, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Avg, Max, Count
from django.db.models.functions import TruncMonth
import datetime

from django.contrib.auth.models import User
from .models import Expense
from .serializers import RegisterSerializer, UserSerializer, ExpenseSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class CurrentUserView(generics.RetrieveAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Guarantee data isolation by filtering querysets to request.user
        queryset = Expense.objects.filter(owner=self.request.user)

        # Filters
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)

        date = self.request.query_params.get('date')
        if date:
            queryset = queryset.filter(date=date)

        month = self.request.query_params.get('month')
        if month:
            queryset = queryset.filter(date__month=month)

        year = self.request.query_params.get('year')
        if year:
            queryset = queryset.filter(date__year=year)

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(title__icontains=search) | queryset.filter(description__icontains=search)

        # Sorting
        ordering = self.request.query_params.get('ordering', '-date')
        if ordering in ['date', '-date', 'amount', '-amount']:
            queryset = queryset.order_by(ordering)

        return queryset

    def perform_create(self, serializer):
        # Automatically assign request.user as owner
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'], url_path='summary')
    def get_summary(self, request):
        user_expenses = Expense.objects.filter(owner=request.user)

        # Category-wise totals
        category_totals = (
            user_expenses.values('category')
            .annotate(total=Sum('amount'))
            .order_by('-total')
        )

        # Monthly totals for charts
        monthly_totals = (
            user_expenses.annotate(month=TruncMonth('date'))
            .values('month')
            .annotate(total=Sum('amount'))
            .order_by('month')
        )

        formatted_monthly = []
        for m in monthly_totals:
            if m['month']:
                formatted_monthly.append({
                    'month': m['month'].strftime('%Y-%m'),
                    'total': float(m['total']) if m['total'] else 0.0
                })

        # Calculations for current month stats
        today = datetime.date.today()
        current_month_expenses = user_expenses.filter(date__year=today.year, date__month=today.month)

        stats = current_month_expenses.aggregate(
            total=Sum('amount'),
            count=Count('id'),
            highest=Max('amount'),
            avg=Avg('amount')
        )

        return Response({
            'category_totals': [
                {'category': item['category'], 'total': float(item['total']) if item['total'] else 0.0}
                for item in category_totals
            ],
            'monthly_totals': formatted_monthly,
            'summary_stats': {
                'total_current_month': float(stats['total']) if stats['total'] else 0.0,
                'count_current_month': stats['count'] or 0,
                'highest_current_month': float(stats['highest']) if stats['highest'] else 0.0,
                'avg_current_month': float(stats['avg']) if stats['avg'] else 0.0,
            }
        })

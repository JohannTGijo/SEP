from django.contrib import admin
from .models import Expense

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'amount', 'category', 'date', 'created_at')
    list_filter = ('category', 'date', 'owner')
    search_fields = ('title', 'description', 'owner__username')

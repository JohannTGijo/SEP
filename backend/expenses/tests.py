from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Expense

class AuthAndExpenseTests(APITestCase):
    def setUp(self):
        self.user_a = User.objects.create_user(username='usera', email='usera@example.com', password='password123')
        self.user_b = User.objects.create_user(username='userb', email='userb@example.com', password='password123')

        self.register_url = reverse('auth_register')
        self.login_url = reverse('token_obtain_pair')
        self.expense_list_url = reverse('expense-list')

    def test_user_registration(self):
        data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "password123",
            "confirm_password": "password123"
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="newuser").exists())

    def test_user_login_jwt(self):
        data = {
            "username": "usera",
            "password": "password123"
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_expense_crud_and_isolation(self):
        self.client.force_authenticate(user=self.user_a)

        expense_data = {
            "title": "Lunch",
            "amount": "15.50",
            "category": "Food",
            "date": "2026-08-14",
            "description": "Tasty food"
        }
        response = self.client.post(self.expense_list_url, expense_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], "Lunch")
        
        expense_id = response.data['id']

        response = self.client.get(self.expense_list_url, format='json')
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], expense_id)

        self.client.force_authenticate(user=self.user_b)

        response = self.client.get(self.expense_list_url, format='json')
        self.assertEqual(len(response.data), 0)

        detail_url = reverse('expense-detail', kwargs={'pk': expense_id})
        response = self.client.get(detail_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        response = self.client.delete(detail_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

import requests
import json

url = 'http://127.0.0.1:8081/api/auth/register/'
payload = {
    'username': 'test_integ2',
    'email': 'test_integ2@example.com',
    'phone': '',
    'password': 'secret123',
    'password2': 'secret123',
    'referral_code': ''
}
print('Posting to', url)
r = requests.post(url, json=payload)
print('Status', r.status_code)
print(r.text)

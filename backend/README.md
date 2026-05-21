# Rotech Backend - Django REST API

Backend API for Rotech crypto wallet application with M-Pesa payment integration.

## Features

- **User Authentication**: JWT-based authentication with custom user model
- **Payment Integration**: Safaricom Daraja API for M-Pesa STK Push payments
- **Referral System**: Track and manage user referrals with admin approval
- **Weekly Claims**: Token claiming system with admin approval workflow
- **Wallet Management**: Transaction tracking and balance management
- **Admin Dashboard**: Django admin for managing payments, referrals, and claims

## Tech Stack

- Django 5.0.6
- Django REST Framework 3.15.1
- PostgreSQL
- M-Pesa Daraja API
- JWT Authentication (SimpleJWT)

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update with your credentials:

```bash
cp .env.example .env
```

Update the following variables:
- `SECRET_KEY`: Django secret key
- Database credentials
- M-Pesa API credentials
- `MPESA_CALLBACK_URL`: public HTTPS URL for the callback endpoint, for example `https://your-domain.com/api/payments/callback/`

If you want the mobile app to work outside your LAN, also configure these for your public backend host:

- `ALLOWED_HOSTS`: include your server domain or public IP, for example `api.yourdomain.com`
- `CORS_ALLOWED_ORIGINS`: include your Expo app origin and any web frontend origin you use

Example:

```bash
ALLOWED_HOSTS=api.yourdomain.com,localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=https://app.yourdomain.com,https://api.yourdomain.com
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb rotech

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### 4. Run Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8081`

For external access, run the server on `0.0.0.0` and place it behind a public host or reverse proxy:

```bash
python manage.py runserver 0.0.0.0:8081
```

## API Endpoints

### Authentication

- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login and get JWT token
- `POST /api/auth/token/refresh/` - Refresh JWT token
- `GET /api/auth/profile/` - Get user profile
- `GET /api/auth/dashboard/` - Get dashboard statistics

### Payments

- `POST /api/payments/initiate/` - Initiate a payment prompt using the configured provider
- `GET /api/payments/list/` - List user's payments
- `POST /api/payments/callback/` - Payment callback endpoint
- `GET /api/payments/status/<payment_id>/` - Check payment status

### Referrals

- `GET /api/referrals/made/` - List referrals made by user
- `GET /api/referrals/received/` - List referrals received by user
- `POST /api/referrals/apply/` - Apply referral code
- `GET /api/referrals/stats/` - Get referral statistics

### Claims

- `GET /api/wallet/claims/history/` - List user's claims
- `POST /api/wallet/claims/create/` - Create weekly claim request
- `GET /api/wallet/claims/status/` - Check claim eligibility

### Wallet

- `GET /api/wallet/balance/` - Get wallet balance
- `GET /api/wallet/transactions/` - List transactions
- `POST /api/wallet/adjust/` - Admin endpoint to adjust balance

## Admin Dashboard

Access the Django admin dashboard at `http://localhost:8081/admin`

### Modern Admin UI Preview

The admin now uses a modern Jazzmin theme with:
- Sidebar navigation and grouped app sections
- Dashboard stat cards + analytics chart placeholder
- Dark mode-friendly color palette
- Branded header/logo/favicon
- Improved tables, filters, and forms

Use the project virtual environment to run the backend for consistent dependencies:

```bash
cd backend
venv\Scripts\python.exe manage.py runserver 8081
```

Then open:

```text
http://127.0.0.1:8081/admin/
```

### Admin Features

- **User Management**: View and manage users, registration status
- **Payment Management**: View payments, approve registrations
- **Referral Management**: Approve/reject referrals, credit rewards
- **Claim Management**: Approve/reject weekly claims
- **Transaction History**: View all wallet transactions

## M-Pesa Integration

### Setup

1. Get credentials from [Safaricom Developer Portal](https://developer.safaricom.co.ke)
2. Update environment variables with your credentials
3. Set `MPESA_ENVIRONMENT` to `sandbox` for testing or `production` for live
4. Set `MPESA_CALLBACK_URL` to a public HTTPS endpoint that points to `/api/payments/callback/`

For local development, use a tunnel such as ngrok so Safaricom can reach your callback URL.

### Payment Flow

1. User initiates payment via mobile app
2. Backend sends STK Push request to M-Pesa
3. User receives payment prompt on phone
4. User enters M-Pesa PIN
5. M-Pesa sends callback to backend
6. Backend processes callback and updates payment status
7. User becomes registered upon successful payment

## Security Notes

- All API endpoints require JWT authentication (except register and login)
- Payment callbacks are validated
- Admin endpoints require staff status
- Referral abuse prevention through unique constraints
- Weekly claim limits enforced

## Database Models

### User
- Custom user model with referral code
- Registration and verification status
- Wallet balance tracking

### Payment
- M-Pesa payment tracking
- Callback metadata storage
- Status management

### Referral
- Referrer/referred user relationship
- Reward amount tracking
- Approval workflow

### Claim
- Weekly claim requests
- Week/year tracking for duplicate prevention
- Approval workflow

### Transaction
- All wallet operations
- Transaction type classification
- Balance snapshots

## Development

### Run Tests

```bash
python manage.py test
```

### Create Superuser

```bash
python manage.py createsuperuser
```

### Reset Database

```bash
python manage.py flush
python manage.py migrate
```

## Deployment

### Production Checklist

- Set `DEBUG=False`
- Use strong `SECRET_KEY`
- Configure PostgreSQL for production
- Set `MPESA_ENVIRONMENT=production`
- Configure CORS for production domain
- Use HTTPS
- Set up proper logging
- Configure static file serving

## License

Proprietary - Rotech

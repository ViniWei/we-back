# We - Back End

## Setup

### Install dependencies
npm i

### Create .env
```bash
PORT        # Server port
SECRET_KEY  # Auth secret key
DB_HOST     # Database host 
DB_USER     # Database user
DB_PASS     # Database password
DB_NAME     # Database name
DB_PORT     # Database port

SMTP_HOST       # SMTP server host (ex: smtp.gmail.com)
SMTP_PORT       # SMTP server port (ex: 465 para SSL ou 587 para TLS)
SMTP_AUTH_USER  # SMTP username (e-mail address)
SMTP_AUTH_PASS  # SMTP password (or app password if you have MFA enabled)
```

## Run the project with hot reload
npm run serve

## Lint (always use this command before commiting)
npm run lint

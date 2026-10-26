# PART F: CONFIGURATION REFERENCE

## Root .gitignore
```
node_modules
dist
build
.env
.env.*
!.env.example
.DS_Store
coverage
*.log
.vscode
.idea
```

## backend/.env.example
```
NODE_ENV=development
PORT=8084
dbURL=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/showtime
JWT_SECRET=replace-with-64-byte-hex
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
ADMIN_EMAIL=admin@showtime.test
ADMIN_PASSWORD=ChangeMe@123
SEED_CONFIRM=false
```

## frontend/vite-project/.env.example
```
VITE_API_URL=http://localhost:8084
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
```

## frontend/vite-project/vercel.json
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [ { "source": "/(.*)", "destination": "/index.html" } ]
}
```

## frontend/vite-project/tailwind.config.js
```javascript
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    container: { center: true, padding: { DEFAULT: '1rem', lg: '1.5rem' }, screens: { xl: '1240px' } },
    extend: {
      colors: {
        primary: { DEFAULT: '#F84464', dark: '#E03556' },
        navy: { DEFAULT: '#333545', light: '#404258' },
        ink: '#1F2533', muted: '#666C7A', pagebg: '#F5F5F5',
        seat: '#1EA83C', timegreen: '#4ABD5D', sold: '#DEDEDE', warn: '#FFA500',
      },
      fontFamily: { sans: ['Roboto', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}
```

## index.html head (frontend)
```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
<title>ShowTime - Book Movie Tickets</title>
```

## Render and Vercel settings
| Platform | Setting | Value |
| :--- | :--- | :--- |
| Render | Root Directory / Build / Start | backend / npm install / npm start |
| Render | Health check path | /health |
| Render | Env vars | All backend variables from backend/.env.example with NODE_ENV=production and CLIENT_URL set to the exact Vercel URL |
| Vercel | Root Directory / Framework | frontend/vite-project / Vite (build npm run build, output dist) |
| Vercel | Env vars | VITE_API_URL (Render URL, https, no trailing slash), VITE_RAZORPAY_KEY_ID |

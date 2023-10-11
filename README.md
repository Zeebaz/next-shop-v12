# Tesloshop | Next.js

* Reconstruir los módulos de node y levantar Next
```
yarn install
yarn dev
```

* Contruir __.env__ (archivo con variables de entorno)

1. Create `/mongo`, this is to volumen data
2. Create `.env` and `.env.template`
    1. template with > MONGO_URL = mongo_url
    2. MONGO_URL = mongodb://localhost:27017/teslodb
    3. NEXT_PUBLIC_TAX_RATE=TAX_VALUE
    4. JWT_SECRET_SEED = ESt@ESSssLasedmillaz?--@1346
    5. NEXT_PUBLIC_PAYPAL_CLIENT_ID
    6. PAYPAL_SECRET_KEY
3. `docker-compose.yaml`
    1. Copy this
    
    ```docker
    services:
      teslodb:
        image: mongo:5.0.0
        container_name: teslo-database
        ports:
          - 27017:27017
        volumes:
          - ./mongo:/data/db
    ```
    
4. In a bash
    1. 
    
    ```bash
    docker-compose up -d
    ```
    * El -d, significa __detached__
## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


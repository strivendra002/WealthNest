# WealthWise — Node.js + MongoDB Backend (Wealthnest.ai Assignment)

This repository implements a simple REST API backend for tracking users, transactions (BUY/SELL), and computing a portfolio summary (holdings, average cost, current prices, unrealized P/L).  
This README explains how to create a user, add transactions, fetch transaction history, and view the portfolio summary — with ready-to-use curl examples.

---

## Server base
- Base URL used in examples: `http://localhost:4000`
- API prefix used: `/api`
- Example `userId` used in examples: `690f2e6106236be0edc38bd6` — **replace** with the `_id` returned by the `create-user` endpoint.

---

## Table of contents
1. Quick start
2. Create a user
3. Add a transaction (BUY)
4. Add a transaction (SELL)
5. Attempt to SELL more than available (error example)
6. Get transactions (history)
7. Get portfolio summary
8. How portfolio numbers are computed
9. Seeding prices (optional)
10. Links & references


---

## 1) Quick start
1. Ensure MongoDB is running and `MONGO_URI` is configured (if using remote DB).  
2. Start the server:
```bash
npm install
npm run server   # or: npm start
```
3. Server should be listening on `http://localhost:4000`.

---

## 2) Create a user

**Request**
```bash
curl --location 'http://localhost:4000/api/users/create-user' \
--header 'Content-Type: application/json' \
--data-raw '{"name":"Alice","email":"alice@example.com"}'
```

**Example response**
```json
{
  "user": {
    "_id": "690f2e6106236be0edc38bd6",
    "name": "Alice",
    "email": "alice@example.com",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```
> Save the returned `_id` — use it as `userId` for subsequent requests.

---

## 3) Add a transaction — BUY

**Request (BUY 5 RELIANCE @ ₹3200 on 2025-05-10)**
```bash
curl --location 'http://localhost:4000/api/transactions/add-transaction' \
--header 'Content-Type: application/json' \
--data '{
  "userId":"690f2e6106236be0edc38bd6",
  "symbol":"RELIANCE",
  "type":"BUY",
  "units":5,
  "price":3200,
  "date":"2025-05-10"
}'
```

**Successful response (example)**
```json
{
  "transaction": {
    "_id": "64f2...abcd",
    "userId": "690f2e6106236be0edc38bd6",
    "symbol": "RELIANCE",
    "type": "BUY",
    "units": 5,
    "price": 3200,
    "date": "2025-05-10T00:00:00.000Z"
  }
}
```

---

## 4) Add a transaction — SELL

**Request (SELL 2 RELIANCE @ ₹3300 on 2025-05-20)**
```bash
curl --location 'http://localhost:4000/api/transactions/add-transaction' \
--header 'Content-Type: application/json' \
--data '{
  "userId":"690f2e6106236be0edc38bd6",
  "symbol":"RELIANCE",
  "type":"SELL",
  "units":2,
  "price":3300,
  "date":"2025-05-20"
}'
```

**Notes**
- The backend validates SELLs and **rejects** selling more than your current net units.
- SELL reduces the `units` for the holding. Realized P/L handling depends on implementation (basic running-average vs FIFO).

---

## 5) Attempt to SELL more than available (error)

**Request (attempt to sell 100 units while only 5 units exist)**
```bash
curl --location 'http://localhost:4000/api/transactions/add-transaction' \
--header 'Content-Type: application/json' \
--data '{
  "userId":"690f2e6106236be0edc38bd6",
  "symbol":"RELIANCE",
  "type":"SELL",
  "units":100,
  "price":2600,
  "date":"2025-05-21"
}'
```

**Example error response**
```json
{
  "error": "cannot sell 100 units — only 5 available"
}
```

---

## 6) Get transactions (history)

**Request**
```bash
curl --location --request GET 'http://localhost:4000/api/transactions/get-transacton?userId=690f2e6106236be0edc38bd6' \
--header 'Content-Type: application/json'
```

**Example response**
```json
{
  "transactions": [
    {
      "_id": "...",
      "userId": "690f2e6106236be0edc38bd6",
      "symbol": "RELIANCE",
      "type": "BUY",
      "units": 5,
      "price": 3200,
      "date": "2025-05-10T00:00:00.000Z"
    },
    {
      "_id": "...",
      "userId": "690f2e6106236be0edc38bd6",
      "symbol": "RELIANCE",
      "type": "SELL",
      "units": 2,
      "price": 3300,
      "date": "2025-05-20T00:00:00.000Z"
    }
  ]
}
```
> The GET endpoint expects `userId` as a **query parameter**. Do not pass a request body.

---

## 7) Get portfolio summary

**Request**
```bash
curl --location --request GET 'http://localhost:4000/api/transactions/get-portfolio?userId=690f2e6106236be0edc38bd6' \
--header 'Content-Type: application/json'
```

**Example response**
```json
{
  "user_id": "690f2e6106236be0edc38bd6",
  "holdings": [
    {
      "symbol": "RELIANCE",
      "units": 5,
      "avg_cost": 3200,
      "current_price": 2600,
      "unrealized_pl": -3000
    },
    {
      "symbol": "TCS",
      "units": 10,
      "avg_cost": 3200,
      "current_price": 3400,
      "unrealized_pl": 2000
    }
  ],
  "total_value": 200000,
  "total_gain": 8000
}
```

**Meaning**
- `units`: net units (BUYs − SELLs)
- `avg_cost`: running weighted-average buy price per unit (updated on BUYs)
- `current_price`: price read from mock prices or `Price` collection
- `unrealized_pl`: `(current_price − avg_cost) × units`
- `total_value`: Σ(current_price × units) across holdings
- `total_gain`: Σ(unrealized_pl) across holdings

---

## 8) How portfolio numbers are computed (short)
- Transactions are processed chronologically.
- On a **BUY**: update running average cost:
  - `new_avg = (old_units*old_avg + buy_units*buy_price) / (old_units + buy_units)`
- On a **SELL**: subtract units; average cost for remaining units remains unchanged in running-average approach.
- `unrealized_pl` is computed per holding; portfolio totals are sums across holdings.


---

## 9) Seeding prices (optional)
- The app reads current prices from a mock JSON (`data/mock_prices.json`) or a `Price` DB collection.
- To seed DB prices, use a small seed script (e.g., `seedPrices.js`) and insert `[{ symbol: 'TCS', price:3400 }, ...]`.

---

## 10) Links & references
- My portfolio : https://portfolio-two-pi-ejaoseqvam.vercel.app/
- Resume : https://drive.google.com/file/d/1tDPEkJj4vY9HzVB2SL55Bcw0RvaHa8gf/view?usp=sharing
- Assignment for company: **wealthnest.ai**

---


---



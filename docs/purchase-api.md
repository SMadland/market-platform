# Mamon Kjøps-API Dokumentasjon

## Oversikt
API-et lar eksterne plattformer og tjenester automatisk opprette tips i Mamon når brukere kjøper produkter. Dette gjør det enkelt å dele anbefalinger uten manuell input.

## Endpoint
```
POST https://azmrpbfifkznhqbyftsg.supabase.co/functions/v1/create-tip-from-purchase
```

## Headers
```
Content-Type: application/json
Authorization: Bearer [SUPABASE_ANON_KEY]
```

## Request Body
```json
{
  "user_id": "uuid",           // Påkrevd: Brukerens ID i Mamon
  "product_url": "string",     // Påkrevd: URL til produktet
  "product_name": "string",    // Valgfri: Produktnavn (hentes automatisk hvis ikke oppgitt)
  "product_image": "string",   // Valgfri: Bilde-URL (hentes automatisk hvis ikke oppgitt)
  "product_price": "number",   // Valgfri: Pris (hentes automatisk hvis ikke oppgitt)
  "comment": "string",         // Valgfri: Brukerens kommentar
  "category": "string",        // Valgfri: Produktkategori
  "visibility": "string"       // Valgfri: "friends" (standard) eller "public"
}
```

## Response
### Suksess (200)
```json
{
  "success": true,
  "tip": {
    "id": "uuid",
    "title": "Produktnavn",
    "description": "Brukerens kommentar",
    "product_url": "https://example.com/product",
    "created_at": "2024-01-01T12:00:00Z"
  },
  "message": "Tip created successfully from purchase data"
}
```

### Feil (400)
```json
{
  "success": false,
  "error": "user_id and product_url are required"
}
```

## Eksempel på bruk

### JavaScript/Node.js
```javascript
const response = await fetch('https://azmrpbfifkznhqbyftsg.supabase.co/functions/v1/create-tip-from-purchase', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  body: JSON.stringify({
    user_id: 'user-uuid-here',
    product_url: 'https://shop.example.com/product/123',
    comment: 'Fantastisk produkt! Anbefaler på det sterkeste.',
    category: 'elektronikk',
    visibility: 'friends'
  })
});

const result = await response.json();
console.log(result);
```

### cURL
```bash
curl -X POST https://azmrpbfifkznhqbyftsg.supabase.co/functions/v1/create-tip-from-purchase \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "user_id": "user-uuid-here",
    "product_url": "https://shop.example.com/product/123",
    "comment": "Fantastisk produkt!",
    "category": "elektronikk"
  }'
```

### Python
```python
import requests

url = "https://azmrpbfifkznhqbyftsg.supabase.co/functions/v1/create-tip-from-purchase"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
data = {
    "user_id": "user-uuid-here",
    "product_url": "https://shop.example.com/product/123",
    "comment": "Fantastisk produkt!",
    "category": "elektronikk"
}

response = requests.post(url, json=data, headers=headers)
print(response.json())
```

## Integrasjonsscenarier

### 1. E-handel plattform
Når en kunde fullfører et kjøp, send automatisk produktinfo til Mamon:
```javascript
// Etter vellykket kjøp
const createTipFromPurchase = async (userId, productUrl, userComment) => {
  await fetch('https://azmrpbfifkznhqbyftsg.supabase.co/functions/v1/create-tip-from-purchase', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
    },
    body: JSON.stringify({
      user_id: userId,
      product_url: productUrl,
      comment: userComment || 'Kjøpte dette produktet'
    })
  });
};
```

### 2. Mobilapp integration
Integrer i checkout-flow:
```javascript
// Etter betaling er bekreftet
onPaymentSuccess: async (paymentData) => {
  if (user.shareToMamon) {
    await createMamonTip(user.id, paymentData.productUrl);
  }
}
```

### 3. Browser extension
Lag en extension som fanger opp kjøp på populære nettsider.

## Sikkerhet
- API-et krever gyldig Supabase authentication
- Validering av user_id mot autentisert bruker
- Rate limiting anbefales på klient-siden

## Bedre løsninger og alternativer

### 1. Widget/Embed løsning
```html
<!-- Enkel widget som kan embeddes på checkout-sider -->
<script src="https://mamon.no/widget.js"></script>
<div id="mamon-share" data-product-url="..." data-user-id="..."></div>
```

### 2. QR-kode løsning
- Generer QR-koder som kunder kan skanne etter kjøp
- QR-koden inneholder produkt-info og åpner Mamon-appen

### 3. E-post integration
- Send e-post til kunder etter kjøp med link til å dele på Mamon
- Linken inneholder pre-fyllt produktinfo

### 4. Social sharing knapper
- Legg til "Del på Mamon" knapp ved siden av Facebook/Twitter
- Bruk Web Share API for native deling på mobil
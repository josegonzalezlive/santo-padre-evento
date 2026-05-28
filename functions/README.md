# 🚀 Guía de Despliegue de Cloud Functions para SantoPadre® Wallets

Esta carpeta contiene el código del servidor para firmar y servir pases digitales seguros de **Google Wallet** y **Apple Wallet** (`.pkpass`).

---

## 📋 Pasos para el Despliegue

### 1. Colocar la clave de Google Wallet
Mueve el archivo `.json` de cuenta de servicio que descargaste en el paso anterior a este directorio y cámbiale el nombre a:
👉 `google-wallet-key.json`

*(Asegúrate de que quede dentro de la carpeta `/functions`)*.

---

### 2. (Opcional) Configurar Certificados de Apple Wallet
Si decides habilitar Apple Wallet (costo de $99 USD/año en Apple Developer):
1. Crea una carpeta llamada `certs/` dentro de `/functions`.
2. Exporta y coloca ahí tus archivos:
   - `wwdr.pem` (Apple Worldwide Developer Relations Certificate)
   - `signerCert.pem` (Tu certificado de tipo de pase)
   - `signerKey.pem` (Tu clave privada desencriptada de firma)

---

### 3. Instalar dependencias locales
Abre la terminal en tu ordenador, navega a la carpeta del proyecto y entra a esta carpeta:
```bash
cd functions
npm install
```

---

### 4. Desplegar a tu proyecto de Firebase
Si no has iniciado sesión en Firebase CLI en tu máquina:
```bash
npx firebase-tools login
```

Vincular este directorio a tu proyecto de Firebase:
```bash
npx firebase-tools use --add
```
*(Selecciona tu proyecto de producción de la lista).*

Finalmente, despliega las funciones a la nube:
```bash
npx firebase-tools deploy --only functions
```

---

## 🔗 Endpoints Generados
Una vez desplegadas, Firebase te dará dos URLs HTTPS que lucen así:
*   `https://us-central1-<id-proyecto>.cloudfunctions.net/generateGooglePassUrl`
*   `https://us-central1-<id-proyecto>.cloudfunctions.net/generateApplePass`

El portal de SantoPadre® (`js/dashboard.js`) está programado para **detectar y usar estas URLs automáticamente** una vez que dejes el modo simulación y actives tus credenciales de producción.

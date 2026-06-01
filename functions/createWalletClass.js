const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Cargar llave
const keyPath = path.join(__dirname, 'google-wallet-key.json');
const credentials = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

// Autenticar
const auth = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  ['https://www.googleapis.com/auth/wallet_object.issuer']
);

const issuerId = "3388000000023148970";
const classId = `${issuerId}.santopadre_loyalty_class`;

async function createClass() {
  await auth.authorize();
  
  const newClass = {
    id: classId,
    issuerName: "Programa de Recompensas",
    reviewStatus: "UNDER_REVIEW", // Or DRAFT
    programName: "SantoPadre®",
    programLogo: {
      kind: 'walletobjects#image',
      sourceUri: {
        uri: "https://raw.githubusercontent.com/josegonzalezlive/santopadre-ecommerce/feature-rewards-admin/assets/Logo%20de%20santo.png"
      }
    },
    hexBackgroundColor: "#124032",
    heroImage: {
      kind: 'walletobjects#image',
      sourceUri: {
        uri: "https://raw.githubusercontent.com/josegonzalezlive/santopadre-ecommerce/feature-rewards-admin/assets/Tacos%20de%20carne%20-%20santoapdre.png"
      }
    }
  };

  try {
    const authHeaders = await auth.getRequestHeaders();
    const res = await fetch(`https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass/${classId}`, {
      method: 'PUT',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newClass)
    });
    const data = await res.json();
    console.log("Response:", data);
  } catch (err) {
    console.error("Error creating class:", err);
  }
}

createClass();

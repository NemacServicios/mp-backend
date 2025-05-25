const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mercadopago = require("mercadopago");

// Firebase Admin
const admin = require("firebase-admin");
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // o usa una key manual
  });
}
const db = admin.firestore();

// Configura tu access token de MercadoPago
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

const app = express();
app.use(cors());
app.use(express.json());

// Crear preferencia de pago
app.post("/create_preference", async (req, res) => {
  try {
    const { title, price, quantity, external_reference } = req.body;

    const preference = {
      items: [
        {
          title,
          unit_price: Number(price),
          quantity: Number(quantity),
        },
      ],
      external_reference, // UID del usuario
      back_urls: {
        success: "https://www.tuapp.com/success",
        failure: "https://www.tuapp.com/failure",
        pending: "https://www.tuapp.com/pending",
      },
      auto_return: "approved",
    };

    const result = await mercadopago.preferences.create(preference);
    console.log("Preferencia creada:", JSON.stringify(result, null, 2));

    res.json({
      id: result.body.id,
      init_point: result.body.init_point,
    });
  } catch (error) {
    console.error("❌ Error al crear preferencia:", error);
    res.status(500).send("Error al crear preferencia");
  }
});

// Webhook para recibir notificaciones de pago
app.post("/webhook", async (req, res) => {
  try {
    const payment = req.body;

    if (payment.action === "payment.created" || payment.type === "payment") {
      const paymentId = payment.data.id;
      const paymentInfo = await mercadopago.payment.findById(paymentId);

      if (paymentInfo.body.status === "approved") {
        const amount = paymentInfo.body.transaction_amount;
        const userUid = paymentInfo.body.external_reference;

        console.log(`💰 Pago aprobado: $${amount} - UID: ${userUid}`);

        const userRef = db.collection("users").doc(userUid);
        await db.runTransaction(async (t) => {
          const doc = await t.get(userRef);
          if (!doc.exists) throw new Error("Usuario no encontrado");
          const currentSaldo = doc.data().saldo || 0;
          t.update(userRef, { saldo: currentSaldo + amount });
        });

        console.log("✅ Saldo actualizado en Firestore");
      }
    }

    res.sendStatus(200); // importante: MercadoPago espera 200
  } catch (err) {
    console.error("❌ Error en webhook:", err);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Servidor corriendo en puerto " + PORT);
});


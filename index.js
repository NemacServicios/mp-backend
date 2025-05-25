const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mercadopago = require("mercadopago");

// Configurar MercadoPago
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

const app = express();
app.use(cors());
app.use(express.json());

app.post("/create_preference", async (req, res) => {
  try {
    const { title, price, quantity } = req.body;

    const preference = {
      items: [
        {
          title,
          unit_price: Number(price),
          quantity: Number(quantity),
        },
      ],
      back_urls: {
        success: "https://www.tuapp.com/success",
        failure: "https://www.tuapp.com/failure",
        pending: "https://www.tuapp.com/pending",
      },
      auto_return: "approved",
    };

    // ESTA LÍNEA ES FUNDAMENTAL
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


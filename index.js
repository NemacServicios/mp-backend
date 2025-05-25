const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mercadopago = require("mercadopago");

// Configura tu access token (asegúrate que en .env esté MP_ACCESS_TOKEN)
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

    // Crear la preferencia y esperar la respuesta
    const result = await mercadopago.preferences.create(preference);

    // Log para verificar la preferencia creada en consola
    console.log("Preferencia creada:", JSON.stringify(result, null, 2));

    // Responder con el ID y la URL de inicio de pago
    res.json({
      id: result.body.id,
      init_point: result.body.init_point,
    });
  } catch (error) {
    console.error("❌ Error al crear preferencia:", error);
    res.status(500).send("Error al crear preferencia");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});


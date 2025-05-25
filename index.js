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

    // **AQUÍ falta crear la preferencia usando mercadopago SDK**
    const result = await mercadopago.preferences.create(preference);

    // **Ahora sí podemos imprimir el resultado:**
    console.log("Preferencia creada:", JSON.stringify(result, null, 2));

    // **Responder con el id y la URL para iniciar el pago**
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


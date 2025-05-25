const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MercadoPagoConfig } = require("mercadopago");

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const app = express();
app.use(cors());
app.use(express.json());

app.post("/create_preference", async (req, res) => {
  try {
    const { title, price, quantity } = req.body;

    console.log("📦 Datos recibidos para crear preferencia:");
    console.log("Título:", title);
    console.log("Precio:", price);
    console.log("Cantidad:", quantity);

    const result = await mp.preference.create({
      body: {
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
      },
    });

    console.log("✅ Preferencia creada:", result);

    res.json({
      id: result.id,
      init_point: result.init_point,
    });
  } catch (error) {
    console.error("❌ Error al crear preferencia:", error);
    res.status(500).send(`Error al crear preferencia: ${error.message}`);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});

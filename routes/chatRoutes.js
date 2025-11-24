// routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");


// Helper para sanitizar strings (evitar nulls raros)
function safeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * GET /api/chat/clients
 * Lista de clientes que tienen conversación, con último mensaje.
 */
router.get("/clients", (req, res) => {
  const sql = `
    SELECT
      cm.client_id,
      MAX(cm.created_at) AS last_message_at,
      SUBSTRING_INDEX(
        (
          SELECT m.message
          FROM chat_messages m
          WHERE m.client_id = cm.client_id
          ORDER BY m.created_at DESC
          LIMIT 1
        ),
        '\n',
        1
      ) AS last_message,
      MAX(cm.client_name) AS client_name,
      MAX(cm.client_email) AS client_email
    FROM chat_messages cm
    GROUP BY cm.client_id
    ORDER BY last_message_at DESC;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error al obtener clientes del chat:", err);
      return res.status(500).json({ mensaje: "Error interno del servidor" });
    }
    res.json(results);
  });
});

/**
 * GET /api/chat/messages/:clientId
 * Mensajes de un cliente concreto.
 */
router.get("/messages/:clientId", (req, res) => {
  const clientId = safeString(req.params.clientId);
  if (!clientId) {
    return res.status(400).json({ mensaje: "clientId es obligatorio." });
  }

  const sql = `
    SELECT id, client_id, client_name, client_email, sender, message, created_at
    FROM chat_messages
    WHERE client_id = ?
    ORDER BY created_at ASC;
  `;

  db.query(sql, [clientId], (err, results) => {
    if (err) {
      console.error("❌ Error al obtener mensajes de chat:", err);
      return res.status(500).json({ mensaje: "Error interno del servidor" });
    }
    res.json(results);
  });
});

/**
 * POST /api/chat/messages
 * Crear un nuevo mensaje (cliente o admin).
 * body: { clientId, message, sender, clientName?, clientEmail? }
 */
router.post("/messages", (req, res) => {
  const clientId = safeString(req.body.clientId);
  const message = safeString(req.body.message);
  const sender = safeString(req.body.sender); // 'client' | 'admin'
  const clientName = safeString(req.body.clientName);
  const clientEmail = safeString(req.body.clientEmail);

  if (!clientId || !message || !sender) {
    return res.status(400).json({
      mensaje: "Campos 'clientId', 'message' y 'sender' son obligatorios.",
    });
  }

  if (!["client", "admin"].includes(sender)) {
    return res.status(400).json({ mensaje: "sender inválido." });
  }

  const sql = `
    INSERT INTO chat_messages (client_id, client_name, client_email, sender, message)
    VALUES (?, ?, ?, ?, ?);
  `;

  const params = [clientId, clientName || null, clientEmail || null, sender, message];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("❌ Error al guardar mensaje de chat:", err);
      return res.status(500).json({ mensaje: "Error interno del servidor" });
    }

    const newMessage = {
      id: result.insertId,
      client_id: clientId,
      client_name: clientName || null,
      client_email: clientEmail || null,
      sender,
      message,
      created_at: new Date(),
    };

    res.status(201).json(newMessage);
  });
});

module.exports = router;

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs/promises";

interface Reservation {
  id: string;
  nome: string;
  telefone: string;
  data: string;
  pessoas: string;
  observacoes: string;
  createdAt: string;
  synced: boolean;
}

const RESERVATIONS_FILE = path.join(process.cwd(), "reservas.json");
const SETTINGS_FILE = path.join(process.cwd(), "settings.json");

// Helper to read reservations
async function getReservations(): Promise<Reservation[]> {
  try {
    const content = await fs.readFile(RESERVATIONS_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return [];
  }
}

// Helper to save reservations
async function saveReservations(reservations: Reservation[]): Promise<void> {
  await fs.writeFile(RESERVATIONS_FILE, JSON.stringify(reservations, null, 2), "utf-8");
}

// Helper to read settings
async function getSpreadsheetId(): Promise<string> {
  try {
    const content = await fs.readFile(SETTINGS_FILE, "utf-8");
    const parsed = JSON.parse(content);
    return parsed.spreadsheetId || "";
  } catch {
    return "";
  }
}

// Helper to save settings
async function saveSpreadsheetId(spreadsheetId: string): Promise<void> {
  await fs.writeFile(SETTINGS_FILE, JSON.stringify({ spreadsheetId }, null, 2), "utf-8");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Dynamic dynamic config route for client-side Firebase Auth
  app.get("/api/firebase-config", async (req, res) => {
    try {
      const configPath = path.join(process.cwd(), "firebase-applet-config.json");
      const configContent = await fs.readFile(configPath, "utf-8");
      res.json(JSON.parse(configContent));
    } catch (error) {
      res.status(500).json({ error: "Failed to load Firebase config" });
    }
  });

  // Fetch local reservations (admin)
  app.get("/api/admin/reservas", async (req, res) => {
    const list = await getReservations();
    const spreadsheetId = await getSpreadsheetId();
    res.json({ reservations: list, spreadsheetId });
  });

  // Save Spreadsheet ID (admin manual input or persist)
  app.post("/api/admin/save-spreadsheet-id", async (req, res) => {
    const { spreadsheetId } = req.body;
    await saveSpreadsheetId(spreadsheetId || "");
    res.json({ success: true, spreadsheetId });
  });

  // Create Google Spreadsheet
  app.post("/api/admin/create-sheet", async (req, res) => {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ error: "Access token is required" });
    }

    try {
      // 1. Create Spreadsheet
      const createRes = await fetch("https://sheets.googleapis.com/v1/spreadsheets", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          properties: {
            title: "Reservas - Galeteria Caxias"
          }
        })
      });

      if (!createRes.ok) {
        const errText = await createRes.text();
        throw new Error(`Failed to create spreadsheet: ${errText}`);
      }

      const sheetData = await createRes.json() as any;
      const spreadsheetId = sheetData.spreadsheetId;
      const url = sheetData.spreadsheetUrl;

      // 2. Initialize headers
      const updateRes = await fetch(`https://sheets.googleapis.com/v1/spreadsheets/${spreadsheetId}/values/Sheet1!A1:F1?valueInputOption=USER_ENTERED`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          range: "Sheet1!A1:F1",
          majorDimension: "ROWS",
          values: [
            ["Nome", "Telefone", "Data", "Pessoas", "Observações", "Data de Cadastro"]
          ]
        })
      });

      if (!updateRes.ok) {
        const errText = await updateRes.text();
        throw new Error(`Failed to set headers: ${errText}`);
      }

      // Save spreadsheet ID locally
      await saveSpreadsheetId(spreadsheetId);

      res.json({ success: true, spreadsheetId, url });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Failed to create Google Sheet" });
    }
  });

  // Sync Reservations to Google Sheet
  app.post("/api/admin/sync-sheet", async (req, res) => {
    const { accessToken, spreadsheetId } = req.body;
    if (!accessToken || !spreadsheetId) {
      return res.status(400).json({ error: "Access token and Spreadsheet ID are required" });
    }

    try {
      const allReservations = await getReservations();
      const nonSynced = allReservations.filter(r => !r.synced);

      if (nonSynced.length === 0) {
        return res.json({ success: true, message: "Todas as reservas já estão sincronizadas!", syncedCount: 0 });
      }

      // Convert to row arrays
      const rows = nonSynced.map(r => [
        r.nome,
        r.telefone,
        r.data,
        r.pessoas,
        r.observacoes || "",
        new Date(r.createdAt).toLocaleString("pt-BR")
      ]);

      // Append to sheet
      const appendRes = await fetch(`https://sheets.googleapis.com/v1/spreadsheets/${spreadsheetId}/values/Sheet1!A2:append?valueInputOption=USER_ENTERED`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          range: "Sheet1!A2",
          majorDimension: "ROWS",
          values: rows
        })
      });

      if (!appendRes.ok) {
        const errText = await appendRes.text();
        throw new Error(`Failed to append rows to spreadsheet: ${errText}`);
      }

      // Mark as synced
      nonSynced.forEach(r => r.synced = true);
      await saveReservations(allReservations);

      res.json({ success: true, syncedCount: nonSynced.length });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Failed to sync to Google Sheet" });
    }
  });

  // Create new reservation
  app.post("/api/reserve", async (req, res) => {
    const { nome, telefone, data, pessoas, observacoes } = req.body;
    
    if (!nome || !telefone || !data || !pessoas) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes!" });
    }

    try {
      const list = await getReservations();
      const newReservation: Reservation = {
        id: "res_" + Date.now(),
        nome,
        telefone,
        data,
        pessoas,
        observacoes: observacoes || "",
        createdAt: new Date().toISOString(),
        synced: false
      };

      list.push(newReservation);
      await saveReservations(list);

      res.json({ success: true, message: "Reserva recebida com sucesso!", reservation: newReservation });
    } catch (error) {
      res.status(500).json({ error: "Erro ao salvar reserva no servidor local" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();


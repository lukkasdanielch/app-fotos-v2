import express from "express";
import multer from "multer";
import { google } from "googleapis";
import fs from "fs";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Configuração de upload local
const upload = multer({ dest: "uploads/" });

// Autenticação Google Drive
const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json",
  scopes: ["https://www.googleapis.com/auth/drive.file"]
});
const drive = google.drive({ version: "v3", auth });

// Endpoint para upload de fotos
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { empresa } = req.body;

    // Verifica se há pasta da empresa no Drive
    const folderName = empresa || "Fotos";
    const folderList = await drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`,
      fields: "files(id, name)"
    });

    let folderId;
    if (folderList.data.files.length > 0) {
      folderId = folderList.data.files[0].id;
    } else {
      // Cria nova pasta
      const folder = await drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: "application/vnd.google-apps.folder"
        },
        fields: "id"
      });
      folderId = folder.data.id;
    }

    // Faz upload do arquivo
    const fileMetadata = {
      name: req.file.originalname,
      parents: [folderId]
    };

    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path)
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, name, webViewLink"
    });

    // Apaga arquivo temporário local
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      link: response.data.webViewLink
    });
  } catch (error) {
    console.error("Erro ao enviar:", error);
    res.status(500).send("Erro ao enviar para o Google Drive");
  }
});

// Inicia servidor
app.listen(3000, () => console.log("Servidor rodando em http://localhost:3000"));

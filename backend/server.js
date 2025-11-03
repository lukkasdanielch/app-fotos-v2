const express = require('express');
const { google } = require('googleapis');
const fileUpload = require('express-fileupload');
const fs = require('fs');

const app = express();
app.use(fileUpload());

// Configuração OAuth2 (Drive)
const CLIENT_ID = 'SEU_CLIENT_ID';
const CLIENT_SECRET = 'SEU_CLIENT_SECRET';
const REDIRECT_URI = 'http://localhost:5500/oauth2callback.html';
const REFRESH_TOKEN = 'SEU_REFRESH_TOKEN';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({ version: 'v3', auth: oauth2Client });

app.post('/upload', async (req, res) => {
  try {
    const file = req.files.file;

    const response = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: ['ID_DA_PASTA_DA_EMPRESA']
      },
      media: {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.tempFilePath)
      }
    });

    res.send({ status: 'success', fileId: response.data.id });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao enviar arquivo');
  }
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));

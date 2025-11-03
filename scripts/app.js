// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCmSDvcOSeVvoXllf2PAdUL_YBhddTUPjk",
  authDomain: "appfotosv2.firebaseapp.com",
  projectId: "appfotosv2",
  storageBucket: "appfotosv2.firebasestorage.app",
  messagingSenderId: "1049994498973",
  appId: "1:1049994498973:web:34fca30e49781984ae5574",
  measurementId: "G-ZQK153WYB5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Elementos
const loginForm = document.getElementById('login-form');
const uploadForm = document.getElementById('upload-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

const cameraInput = document.getElementById('camera-upload');
const galleryInput = document.getElementById('gallery-upload');
const previewContainer = document.getElementById('preview-container');
const submitButton = document.getElementById('submit-button');
const carNameInput = document.getElementById('car-name');
const stageSelect = document.getElementById('photo-stage');

let selectedFiles = [];

// -------- Login Firebase --------
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
    } catch (err) {
        alert("Erro no login: " + err.message);
    }
});

// -------- Detect login --------
onAuthStateChanged(auth, user => {
    if(user){
        loginForm.style.display = 'none';
        uploadForm.style.display = 'block';
    } else {
        loginForm.style.display = 'block';
        uploadForm.style.display = 'none';
    }
});

// -------- Preview de imagens --------
function updatePreview() {
    previewContainer.innerHTML = '';
    if(selectedFiles.length === 0){
        previewContainer.innerHTML = '<p>Nenhuma foto selecionada.</p>';
        submitButton.disabled = true;
        return;
    }
    selectedFiles.forEach((file, index) => {
        const container = document.createElement('div');
        container.classList.add('preview-image-container');

        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.classList.add('preview-image');

        const btn = document.createElement('button');
        btn.textContent = 'X';
        btn.classList.add('remove-image-btn');
        btn.addEventListener('click', () => {
            selectedFiles.splice(index, 1);
            updatePreview();
        });

        container.appendChild(img);
        container.appendChild(btn);
        previewContainer.appendChild(container);
    });
    submitButton.disabled = false;
}

// -------- Seleção de arquivos --------
cameraInput.addEventListener('change', (e) => {
    if(e.target.files[0]) selectedFiles.push(e.target.files[0]);
    updatePreview();
});
galleryInput.addEventListener('change', (e) => {
    for(const file of e.target.files){
        selectedFiles.push(file);
    }
    updatePreview();
});

// -------- Google Drive OAuth --------
// Necessário criar OAuth Client ID no Google Cloud Console
const CLIENT_ID = 'SEU_CLIENT_ID.apps.googleusercontent.com';
const API_KEY = 'SUA_API_KEY';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
let gapiInited = false;

// Carregar API do Google
function gapiLoad() {
    gapi.load('client:auth2', initClient);
}

async function initClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        scope: SCOPES,
    });
    gapiInited = true;
}

// -------- Função para autenticar Drive --------
async function authenticateDrive() {
    if(!gapiInited) await gapiLoad();
    return gapi.auth2.getAuthInstance().signIn();
}

// -------- Função para criar pasta --------
async function createFolder(name, parentId=null){
    const fileMetadata = {
        'name': name,
        'mimeType': 'application/vnd.google-apps.folder'
    };
    if(parentId) fileMetadata.parents = [parentId];

    const response = await gapi.client.drive.files.create({
        resource: fileMetadata,
        fields: 'id'
    });
    return response.result.id;
}

// -------- Upload de arquivo --------
async function uploadFile(file, folderId){
    const metadata = {
        'name': file.name,
        parents: [folderId]
    };
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
    form.append('file', file);

    await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
        method: 'POST',
        headers: new Headers({'Authorization': 'Bearer ' + gapi.auth.getToken().access_token}),
        body: form
    });
}

// -------- Enviar fotos --------
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if(selectedFiles.length === 0) return alert('Selecione pelo menos uma foto.');

    try {
        await authenticateDrive();
        // Pasta raiz da empresa
        const companyFolderId = await createFolder('Oficina');

        // Pasta do carro
        const carFolderId = await createFolder(carNameInput.value, companyFolderId);

        // Pasta da etapa
        const stageFolderId = await createFolder(stageSelect.value, carFolderId);

        // Enviar arquivos
        for(const file of selectedFiles){
            await uploadFile(file, stageFolderId);
        }
        alert('Fotos enviadas com sucesso!');
        selectedFiles = [];
        updatePreview();
        uploadForm.reset();
    } catch(err) {
        alert('Erro ao enviar: ' + err.message);
    }
});

let user;
const loginDiv = document.getElementById("loginDiv");
const appDiv = document.getElementById("appDiv");
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userEmailSpan = document.getElementById("userEmail");
const empresaSelect = document.getElementById("empresaSelect");
const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const photosContainer = document.getElementById("photosContainer");

// Login Firebase
loginBtn.addEventListener("click", () => {
  firebase.auth().signInWithEmailAndPassword(emailInput.value, senhaInput.value)
    .then(res => {
      user = res.user;
      loginDiv.style.display = "none";
      appDiv.style.display = "block";
      userEmailSpan.innerText = user.email;
      initGoogleDrive();
    })
    .catch(err => alert(err.message));
});

// Logout
logoutBtn.addEventListener("click", () => {
  firebase.auth().signOut().then(() => {
    user = null;
    loginDiv.style.display = "block";
    appDiv.style.display = "none";
  });
});

// Google Drive API
function initGoogleDrive() {
  gapi.load('client:auth2', initClient);
}

function initClient() {
  gapi.client.init({
    apiKey: "SUA_CHAVE_API_GOOGLE",
    clientId: "SEU_CLIENT_ID_GOOGLE",
    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
    scope: "https://www.googleapis.com/auth/drive"
  }).then(() => {
    gapi.auth2.getAuthInstance().signIn().then(() => {
      listEmpresas();
    });
  });
}

function listEmpresas() {
  // Aqui você pode criar a lógica para listar pastas de empresas
  // Exemplo: adicionar opções manualmente
  ["Oficina1","Oficina2","Oficina3"].forEach(nome => {
    const option = document.createElement("option");
    option.value = nome;
    option.innerText = nome;
    empresaSelect.appendChild(option);
  });
  listFotos();
}

uploadBtn.addEventListener("click", () => {
  const files = fileInput.files;
  const empresa = empresaSelect.value;
  if(!empresa) return alert("Selecione uma empresa");

  Array.from(files).forEach(file => {
    const metadata = {
      name: file.name,
      parents: [empresa], // pasta da empresa
      mimeType: file.type
    };
    const form = new FormData();
    form.append("metadata", new Blob([JSON.stringify(metadata)], {type: "application/json"}));
    form.append("file", file);

    gapi.client.request({
      path: "/upload/drive/v3/files?uploadType=multipart",
      method: "POST",
      body: form
    }).then(() => listFotos());
  });
});

function listFotos() {
  const empresa = empresaSelect.value;
  if(!empresa) return;
  photosContainer.innerHTML = "";
  gapi.client.drive.files.list({
    q: `'${empresa}' in parents and trashed=false`,
    fields: "files(id,name,webViewLink)"
  }).then(res => {
    res.result.files.forEach(file => {
      const img = document.createElement("img");
      img.src = `https://drive.google.com/uc?id=${file.id}`;
      img.width = 150;
      img.style.margin = "5px";
      photosContainer.appendChild(img);
    });
  });
}

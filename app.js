// ==================== CONFIGURAÇÃO DO FIREBASE ====================
const firebaseConfig = {
    apiKey: "AIzaSyCmSDvcOSeVvoXllf2PAdUL_YBhddTUPjk",
    authDomain: "appfotosv2.firebaseapp.com",
    projectId: "appfotosv2",
    storageBucket: "appfotosv2.firebasestorage.app",
    messagingSenderId: "1049994498973",
    appId: "1:1049994498973:web:34fca30e49781984ae5574"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// ==================== ELEMENTOS ====================
const loginDiv = document.getElementById('loginDiv');
const appDiv = document.getElementById('appDiv');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('loginError');
const userEmail = document.getElementById('userEmail');
const photoInput = document.getElementById('photoInput');
const uploadBtn = document.getElementById('uploadBtn');
const photosList = document.getElementById('photosList');

// ==================== LOGIN ====================
loginBtn.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            const user = userCredential.user;
            loginDiv.style.display = 'none';
            appDiv.style.display = 'block';
            userEmail.textContent = user.email;
        })
        .catch(error => {
            loginError.textContent = error.message;
        });
});

// ==================== LOGOUT ====================
logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        appDiv.style.display = 'none';
        loginDiv.style.display = 'block';
    });
});

// ==================== UPLOAD PARA GOOGLE DRIVE ====================
// Essa função vai enviar para a sua API/Server que conecta ao Google Drive
uploadBtn.addEventListener('click', async () => {
    const files = photoInput.files;
    if(files.length === 0) {
        alert("Selecione pelo menos uma foto.");
        return;
    }

    for(const file of files){
        await uploadToDrive(file); // função que você implementa no backend
    }

    alert("Upload concluído!");
});

// Função de exemplo, precisa de backend com OAuth2
async function uploadToDrive(file){
    // Aqui você faria POST para seu servidor com OAuth do Google Drive
    console.log("Enviando para Drive:", file.name);
}

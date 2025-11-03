// Configuração Firebase Auth
const firebaseConfig = {
  apiKey: "SEU_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

async function login() {
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, senha);
    alert('Bem-vindo ' + userCredential.user.email);
  } catch (err) {
    alert('Erro no login: ' + err.message);
  }
}

async function upload() {
  const file = document.getElementById('fileInput').files[0];
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('http://localhost:3000/upload', {
    method: 'POST',
    body: formData
  });
  const data = await res.json();
  alert('Arquivo enviado! ID: ' + data.fileId);
}

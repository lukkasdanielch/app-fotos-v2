// Config do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCmSDvcOSeVvoXllf2PAdUL_YBhddTUPjk",
  authDomain: "appfotosv2.firebaseapp.com",
  projectId: "appfotosv2",
  storageBucket: "appfotosv2.firebasestorage.app",
  messagingSenderId: "1049994498973",
  appId: "1:1049994498973:web:34fca30e49781984ae5574",
  measurementId: "G-ZQK153WYB5"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Captura formulário
const loginForm = document.getElementById('loginForm');
const mensagem = document.getElementById('mensagem');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  auth.signInWithEmailAndPassword(email, senha)
    .then(userCredential => {
      mensagem.style.color = 'green';
      mensagem.textContent = `Bem-vindo ${userCredential.user.email}!`;
      // Redirecionar para outra página ou iniciar app de fotos
    })
    .catch(error => {
      mensagem.style.color = 'red';
      mensagem.textContent = `Erro: ${error.message}`;
    });
});

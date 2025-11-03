// Após login bem-sucedido
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    document.getElementById("login").style.display = "none";
    document.getElementById("upload").style.display = "block";
    document.getElementById("user").innerText = user.email;
  } else {
    document.getElementById("login").style.display = "block";
    document.getElementById("upload").style.display = "none";
  }
});

// Envio da imagem
async function enviarFoto() {
  const fileInput = document.getElementById("foto");
  const empresa = document.getElementById("empresa").value;

  if (!fileInput.files[0]) {
    alert("Selecione uma foto primeiro!");
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);
  formData.append("empresa", empresa);

  const response = await fetch("http://localhost:3000/upload", {
    method: "POST",
    body: formData
  });

  const result = await response.json();
  alert("Foto enviada! Link: " + result.link);
}

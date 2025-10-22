document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("⚠️ Debes iniciar sesión primero");
    window.location.href = "login.html";
    return;
  }

  fetch("http://localhost:3000/auth/perfil", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` 
    }
  })
    .then(res => {
      if (!res.ok) {
        throw new Error("Token inválido o expirado");
      }
      return res.json();
    })
    .then(data => {
      if (data.nombre) {
        document.getElementById("usuario").textContent = data.nombre;
      }
    })
    .catch(err => {
      console.error("❌ Error al validar token:", err);
      alert("⚠️ Tu sesión expiró, vuelve a iniciar sesión");
      localStorage.removeItem("token");
      window.location.href = "login.html";
    });

  document.getElementById("comprar").addEventListener("click", () => {
    alert("✅ Compra realizada con éxito (aquí conectarás con pedidos en el backend)");
  });
});

 document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const correo = document.getElementById("correo").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!correo || !password) {
      document.getElementById("error").textContent = "⚠️ Ingrese correo y contraseña";
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });

      const result = await response.json();

      if (response.ok && result.token) {
        alert("✅ Login exitoso");
        localStorage.setItem("token", result.token);
        window.location.href = "producto.html";
      } else {
        document.getElementById("error").textContent = "❌ Credenciales inválidas";
      }
    } catch (error) {
      console.error("❌ Error en login:", error);
      document.getElementById("error").textContent = "Error de conexión con el servidor";
    }
  });
});

// public/login.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const errorBox = document.getElementById("error");
  const loadingOverlay = document.getElementById("loginLoading");

  const showLoading = () => {
    if (!loadingOverlay) return;
    loadingOverlay.classList.remove("hidden");
    loadingOverlay.classList.add("active");
  };

  const hideLoading = () => {
    if (!loadingOverlay) return;
    loadingOverlay.classList.remove("active");
    setTimeout(() => loadingOverlay.classList.add("hidden"), 250);
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const correo = document.getElementById("correo").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = document.getElementById("role").value;

    if (!correo || !password) {
      errorBox.textContent = "⚠️ Ingrese correo y contraseña";
      return;
    }

    try {
      showLoading();
      errorBox.textContent = "";

      const response = await fetch("http://127.0.0.1:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password, role }),
      });

      const result = await response.json();

      if (response.ok && result.token) {
        alert("✅ Login exitoso");
        localStorage.setItem("token", result.token);
        if (result.user) {
          localStorage.setItem("role", result.user.role);
          localStorage.setItem("userName", result.user.nombre || "");
        }

        if (result.user?.role === "admin") {
          window.location.href = "admin.html";
        } else {
          window.location.href = "producto.html";
        }
        return;
      }

      errorBox.textContent = result.message || "❌ Credenciales inválidas";
    } catch (error) {
      console.error("❌ Error en login:", error);
      errorBox.textContent = "Error de conexión con el servidor";
    } finally {
      hideLoading();
    }
  });
});

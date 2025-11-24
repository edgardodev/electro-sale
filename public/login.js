// public/login.js
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (!form) return; 

  const errorBox = document.getElementById("error");
  const loadingOverlay = document.getElementById("loginLoading");

  const API_BASE_URL = "http://127.0.0.1:3000";
  const AUTH_LOGIN_URL = `${API_BASE_URL}/auth/login`;

  const setError = (message) => {
    if (!errorBox) return;
    errorBox.textContent = message;
  };

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
    const role = document.getElementById("role").value; // "cliente" | "admin"

    if (!correo || !password) {
      setError("⚠️ Ingrese correo y contraseña");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      setError("⚠️ Ingrese un correo válido");
      return;
    }

    try {
      showLoading();
      setError("");

      const response = await fetch(AUTH_LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password, role }), // mandamos role como pide el backend
      });

      let result = {};
      try {
        result = await response.json();
      } catch (_) {
        result = {};
      }

      if (response.ok && result.token) {
        // Guardar token
        localStorage.setItem("token", result.token);

        // Guardar datos del usuario para saludo + chat
        if (result.user) {
          localStorage.setItem("role", result.user.role || "cliente");
          localStorage.setItem("userName", result.user.nombre || "");
          localStorage.setItem("userEmail", result.user.correo || "");
          localStorage.setItem("userId", String(result.user.id || ""));
        }

        // Redirigir según rol REAL (el que viene del backend)
        if (result.user?.role === "admin") {
          window.location.href = "admin.html";
        } else {
          window.location.href = "producto.html";
        }
        return;
      }

      // Errores de credenciales / backend
      setError(result.message || "❌ Credenciales inválidas");
    } catch (error) {
      console.error("❌ Error en login:", error);
      setError("Error de conexión con el servidor");
    } finally {
      hideLoading();
    }
  });
});

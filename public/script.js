document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('.formulario');

  if (!form) {
    console.error("❌ No se encontró el formulario (.formulario)");
    return;
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const direccion = document.getElementById("direccion").value.trim();
    const password = document.getElementById("password").value.trim();
    const metodo_pago = document.querySelector('input[name="pago"]:checked')?.value || "";

    if (!nombre || !correo || !direccion || !password || !metodo_pago) {
      alert("⚠️ Favor llenar todos los campos.");
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      alert('⚠️ Ingrese un correo válido.');
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo, direccion, metodo_pago, password })
      });

      const result = await response.json();

      if (response.ok) {
        alert("✅ Usuario creado correctamente");
        console.log(result);
      } else {
        alert("❌ Error: " + (result.message || "No se pudo registrar"));
      }
    } catch (error) {
      console.error("❌ Error al registrar:", error);
      alert("Error de conexión con el servidor");
    }
  });
});

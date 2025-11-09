document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('registerForm');

  if (!form) {
    return;
  }

  const messageBox = document.getElementById('registerMessage');
  const loadingOverlay = document.getElementById('registerLoading');

  const setMessage = (message, type = 'neutral') => {
    if (!messageBox) return;
    messageBox.textContent = message;
    messageBox.classList.remove('is-error', 'is-success');

    if (type === 'error') {
      messageBox.classList.add('is-error');
    } else if (type === 'success') {
      messageBox.classList.add('is-success');
    }
  };

  const showLoading = () => {
    if (!loadingOverlay) return;
    loadingOverlay.classList.remove('hidden');
    requestAnimationFrame(() => loadingOverlay.classList.add('active'));
  };

  const hideLoading = () => {
    if (!loadingOverlay) return;
    loadingOverlay.classList.remove('active');
    setTimeout(() => loadingOverlay.classList.add('hidden'), 250);
  };

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const direccion = document.getElementById('direccion').value.trim();
    const password = document.getElementById('password').value.trim();
    const metodo_pago = document.querySelector('input[name="pago"]:checked')?.value || '';

    if (!nombre || !correo || !direccion || !password || !metodo_pago) {
      setMessage('⚠️ Favor llenar todos los campos.', 'error');
      return;
    }

    if (password.length < 8) {
      setMessage('⚠️ La contraseña debe tener al menos 8 caracteres.', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      setMessage('⚠️ Ingrese un correo válido.', 'error');
      return;
    }

    try {
      setMessage('Procesando tu registro...');
      showLoading();

      const response = await fetch('http://127.0.0.1:3000/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo, direccion, metodo_pago, password })
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('✅ Usuario creado correctamente. Revisa tu correo para confirmar tu cuenta.', 'success');
        form.reset();
      } else {
        setMessage(result.message ? `❌ ${result.message}` : '❌ No se pudo registrar el usuario.', 'error');
      }
    } catch (error) {
      console.error('❌ Error al registrar:', error);
      setMessage('Error de conexión con el servidor.', 'error');
    } finally {
      hideLoading();
    }
  });
});

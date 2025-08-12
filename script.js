document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.formulario'); 

    if (!form) {
        console.error("No se encontró el formulario (.formulario). Verifica el HTML y el nombre del archivo script.");
        return;
    }

    form.addEventListener('submit', function (event) {
        const nombre = document.getElementById("nombre").value.trim();
        const email = document.getElementById("correo").value.trim();
        const apellido = document.getElementById("apellido").value.trim();
        const cedula = document.getElementById("cedula").value.trim();
        const contrasena = document.getElementById("contrasena").value.trim();
        const fechaNacimiento = document.getElementById("fecha_nacimiento").value.trim();
        const ciudad = document.getElementById("ciudad").value.trim();
        const direccionEnvio = document.getElementById("direccion_envio").value.trim();

        if (!nombre || !email || !apellido || !cedula || !contrasena || !fechaNacimiento || !ciudad || !direccionEnvio) {
            alert("Favor llenar todos los campos.");
            event.preventDefault();
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Ingrese un correo válido.');
            event.preventDefault();
            return;
        }

        alert("Usuario creado correctamente");
    });
});
function login(event) {
    event.preventDefault(); 
    const cedulaCorrecta = "32645219";
    const contrasenaCorrecta = "sena123";
    let cedula = document.getElementById("cedula").value.trim();
    let contrasena = document.getElementById("CONTRASENA").value.trim();
    if (cedula === cedulaCorrecta && contrasena === contrasenaCorrecta) {
        window.location.href = "producto.html";
    } else {
        document.getElementById("error").textContent = "Cédula o contraseña incorrectos";
    }
}
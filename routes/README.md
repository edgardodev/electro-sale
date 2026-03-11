# 📁 Organización del Proyecto

Este proyecto fue organizado siguiendo el principio de **separación de responsabilidades**, con el objetivo de mantener el código limpio, escalable y fácil de mantener.

La estructura divide la lógica en tres carpetas principales:

* `routes`
* `controllers`
* `middleware`

---

## 📌 ¿Por qué esta organización?

Se decidió estructurar el proyecto de esta manera para:

* Separar la definición de rutas de la lógica de negocio.
* Hacer el código más modular y reutilizable.
* Facilitar el mantenimiento y la escalabilidad.
* Permitir que otros desarrolladores entiendan rápidamente la estructura.
* Aplicar buenas prácticas comunes en aplicaciones backend con Express.

---

# 📂 Descripción de cada carpeta

## 🛣 routes/

Contiene los archivos que definen las rutas de la aplicación.

Aquí se especifica:

* Qué endpoint existe.
* Qué método HTTP utiliza (GET, POST, PUT, DELETE).
* Qué controlador se ejecuta cuando se accede a esa ruta.

Ejemplos:

* `authRoutes.js`
* `clienteRoutes.js`
* `pedidoRoutes.js`
* `productoRoutes.js`

Las rutas no contienen lógica compleja, solo conectan las peticiones con los controladores.

---

## 🎮 controllers/

Contiene la lógica de negocio de la aplicación.

Los controladores:

* Procesan la solicitud.
* Ejecutan la lógica correspondiente.
* Interactúan con la base de datos (si aplica).
* Devuelven la respuesta al cliente.

Ejemplos:

* `authController.js`
* `clienteController.js`
* `pedidoController.js`
* `productoController.js`

Esta separación permite que la lógica no esté mezclada con la definición de rutas.

---

## 🔐 middleware/

Contiene funciones intermedias que se ejecutan antes de que la petición llegue al controlador.

Los middleware se usan para:

* Validar autenticación (`authMiddleware.js`)
* Verificar roles de usuario (`adminMiddleware.js`)
* Ejecutar lógica previa común

Permiten reutilizar validaciones y mantener el código organizado.

---

# 🧠 Principio aplicado

La estructura sigue el patrón de arquitectura basado en:

* Separación de responsabilidades
* Modularidad
* Organización escalable
* Buenas prácticas en aplicaciones backend con Express

Esto facilita agregar nuevas funcionalidades sin desordenar el proyecto.

---

📌 Esta organización permite que el proyecto crezca manteniendo claridad y orden en el código.

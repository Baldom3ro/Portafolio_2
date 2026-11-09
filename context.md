El alumno desarrollará un conjunto de 5 ejercicios prácticos individuales orientados a dotar a la Aplicación Web Progresiva de capacidades avanzadas. En este portafolio se implementará la gestión explícita de permisos del navegador, el uso de Web APIs de hardware (ubicación y cámara), las notificaciones locales y la persistencia/sincronización de datos con IndexedDB y estrategias dinámicas de caché.

Especificaciones del Portafolio de Ejercicios:  

El portafolio se entregará mediante actualización en el repositorio de GitHub/GitLab, creando la carpeta Portafolio_2 con las siguientes subcarpetas:

Ejercicio 1: Consulta de Permisos y GeolocalizaciónVerificación del estado de permisos con la Permissions API (navigator.permissions.query).  Solicitud de acceso al GPS mediante navigator.geolocation.getCurrentPosition y despliegue de las coordenadas (latitud y longitud) con mapa interactivo o texto.

Ejercicio 2: Captura de Medios con Cámara Web/Móvil
Acceso al hardware de video del dispositivo mediante la API navigator.mediaDevices.getUserMedia.
Renderizado del flujo de video en un elemento HTML <video> y captura de una fotografía estática enviada a un canvas HTML.

Ejercicio 3: Notificaciones Push Locales desde el Service WorkerSolicitud de permisos de notificación al usuario (Notification.requestPermission).  Disparo de una notificación local personalizada (con título, cuerpo, icono y vibración) ejecutada a través del evento del Service Worker (self.registration.showNotification).

Ejercicio 4: Persistencia de Datos Asíncrona con IndexedDBApertura y creación de un Object Store en IndexedDB (utilizando JavaScript nativo o la librería idb).  Implementación de una interfaz sencilla para insertar, consultar y eliminar registros locales sin depender de una conexión a internet.  

Ejercicio 5: Estrategia de Caché Dinámica con Fallback a IndexedDB / Network-FirstConsumo de una API REST remota mediante fetch.  Implementación de la estrategia Network-First o Stale-While-Revalidate: al recibir la respuesta JSON, guarda una copia local en IndexedDB/Cache API.  Si el dispositivo se queda sin red, la interfaz recupera y renderiza de forma automática el último JSON almacenado localmente.
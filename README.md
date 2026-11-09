# Portafolio de Ejercicios 2 - Aplicaciones Web Progresivas (PWA)

Repositorio de entrega para el **Portafolio de Ejercicios 2** correspondiente a la materia de Aplicaciones Web Progresivas.

En este portafolio se implementa un conjunto de 5 ejercicios prácticos individuales orientados a dotar a la Aplicación Web Progresiva de capacidades avanzadas: gestión explícita de permisos del navegador, Web APIs de hardware (GPS y cámara), notificaciones locales desde el Service Worker, persistencia de datos con IndexedDB y estrategias de caché dinámica con fallback.

Repositorio GitHub: [https://github.com/Baldom3ro/Portafolio_2.git](https://github.com/Baldom3ro/Portafolio_2.git)

---

## 📂 Contenido del Portafolio

La entrega se encuentra organizada dentro de la carpeta principal [`Portafolio_2`](file:///Users/baldo/Documents/Guille/Portafolio%20de%20Ejercicios%202/Portafolio_2/) con las subcarpetas requeridas:

| Subcarpeta | Ejercicio | Tecnologías y APIs Principales |
|---|---|---|
| [**`Ejercicio_1/`**](file:///Users/baldo/Documents/Guille/Portafolio%20de%20Ejercicios%202/Portafolio_2/Ejercicio_1/) | **Consulta de Permisos y Geolocalización** | `Permissions API`, `Geolocation API`, `Leaflet.js`, `OpenStreetMap` |
| [**`Ejercicio_2/`**](file:///Users/baldo/Documents/Guille/Portafolio%20de%20Ejercicios%202/Portafolio_2/Ejercicio_2/) | **Captura de Medios con Cámara Web/Móvil** | `MediaDevices.getUserMedia`, HTML5 `<video>`, Canvas 2D, Filtros & PNG |
| [**`Ejercicio_3/`**](file:///Users/baldo/Documents/Guille/Portafolio%20de%20Ejercicios%202/Portafolio_2/Ejercicio_3/) | **Notificaciones Push Locales desde el Service Worker** | `Notification.requestPermission`, `Service Worker`, `showNotification`, `Vibration API` |
| [**`Ejercicio_4/`**](file:///Users/baldo/Documents/Guille/Portafolio%20de%20Ejercicios%202/Portafolio_2/Ejercicio_4/) | **Persistencia de Datos Asíncrona con IndexedDB** | `IndexedDB` nativo, Object Store, Transacciones, CRUD Asíncrono Offline |
| [**`Ejercicio_5/`**](file:///Users/baldo/Documents/Guille/Portafolio%20de%20Ejercicios%202/Portafolio_2/Ejercicio_5/) | **Estrategia de Caché Dinámica con Fallback a IndexedDB / Network-First** | `Fetch API`, Estrategia Network-First, Fallback a IndexedDB, Simulador Offline |

---

## 💻 Instrucciones para Ejecutar en Local

Dado que los Service Workers y las Web APIs de hardware (como la cámara y la geolocalización) requieren un origen seguro (*Secure Context*), deben ejecutarse a través de `http://localhost` o un servidor HTTPS:

```bash
# Iniciar servidor local en el puerto 8000
python3 -m http.server 8000
```

Abre en tu navegador:
- [http://localhost:8000/Portafolio_2/](http://localhost:8000/Portafolio_2/)

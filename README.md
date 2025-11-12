# Proyecto AquaControl IoT

**AquaControl IoT** es una solución completa para la monitorización y el control de sistemas de riego en invernaderos, desarrollada con tecnologías de vanguardia. Este proyecto te permite gestionar de forma remota y eficiente la humedad del suelo de tus cultivos, asegurando un crecimiento óptimo y un uso responsable del agua.

## Características Principales

*   **Monitorización en Tiempo Real:** Visualiza los niveles de humedad del suelo de múltiples sensores en tiempo real a través de un panel de control web intuitivo.
*   **Backend con Firebase:** Utiliza Firebase Realtime Database para una comunicación fluida y en tiempo real entre el dispositivo ESP32 y la aplicación web.
*   **Firmware para ESP32:** Incluye el código fuente para el microcontrolador ESP32, encargado de leer los sensores y actuar sobre el sistema de riego.
*   **Control de Riego Manual:** Activa el sistema de riego de forma manual con un solo clic desde el panel de control.
*   **Programador de Riego con IA (en desarrollo):** Una futura funcionalidad que utilizará inteligencia artificial para predecir las necesidades de riego basándose en el historial de humedad y el pronóstico del tiempo.
*   **Frontend con Next.js y Shadcn/ui:** Una interfaz de usuario moderna, receptiva y fácil de usar, construida con las últimas tecnologías de desarrollo web.

## Empezando

Para poner en marcha el proyecto en tu entorno local, sigue estos pasos:

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/Makita2108/studio.git
    cd studio
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    ```

3.  **Configura tus credenciales:**
    *   **Firebase:** Actualiza el archivo `src/lib/firebase.ts` con tus credenciales de Firebase.
    *   **ESP32:** Abre el archivo `src/esp32_main.cpp` y reemplaza los marcadores de posición con las credenciales de tu red Wi-Fi y de tu proyecto de Firebase.

4.  **Ejecuta el servidor de desarrollo:**
    ```bash
    npm run dev
    ```

Abre [http://localhost:9003](http://localhost:9003) en tu navegador para ver el panel de control en acción.

## Despliegue

La forma más sencilla de desplegar tu aplicación Next.js es utilizar la [Plataforma Vercel](https://vercel.com/new), de los creadores de Next.js.

Consulta la [documentación de despliegue de Next.js](https://nextjs.org/docs/deployment) para más detalles.

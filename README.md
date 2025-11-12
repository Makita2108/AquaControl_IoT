# Proyecto AquaControl IoT (Flutter)

**AquaControl IoT** es una solución completa para la monitorización y el control de sistemas de riego en invernaderos, desarrollada con Flutter y Firebase. Este proyecto te permite gestionar de forma remota y eficiente la humedad del suelo de tus cultivos a través de una aplicación móvil para Android y iOS.

## Características Principales

*   **Interfaz Móvil con Flutter:** Una aplicación móvil moderna y fácil de usar, construida con Flutter para un rendimiento nativo en Android y iOS.
*   **Backend Centralizado con Firebase:** Utiliza Firebase Realtime Database para una comunicación fluida y en tiempo real entre el dispositivo ESP32 y la aplicación móvil.
*   **Autenticación Segura:** Implementa un sistema de registro e inicio de sesión de usuarios con Firebase Authentication, protegiendo el acceso a los datos.
*   **Firmware para ESP32:** Incluye el código fuente para el microcontrolador ESP32, encargado de leer los sensores y actuar sobre el sistema de riego.
*   **Control Climático Inteligente:** El firmware implementa una lógica de control automático para el ventilador basada en umbrales de temperatura leídos desde Firebase, además de permitir el control manual del ventilador desde la app.
*   **Control y Monitorización:** Visualiza datos de sensores en tiempo real y controla los actuadores (ventilador, válvula de agua) directamente desde la app.

## Empezando

Para poner en marcha el proyecto, sigue estos pasos:

### Prerrequisitos

Asegúrate de tener el [SDK de Flutter](https://docs.flutter.dev/get-started/install) instalado en tu máquina.

### 1. Clona el Repositorio

```bash
git clone https://github.com/Makita2108/AquaControl_IoT.git
cd AquaControl_IoT
```

### 2. Configura el Firmware del ESP32

*   Abre el archivo `src/esp32_main.cpp`.
*   Reemplaza los marcadores de posición con las credenciales de tu red Wi-Fi y de tu proyecto de Firebase.
*   Carga el firmware en tu dispositivo ESP32.

### 3. Configura la Aplicación Flutter

1.  **Navega al directorio de la app:**
    ```bash
    cd iot_app
    ```

2.  **Instala las dependencias:**
    ```bash
    flutter pub get
    ```

3.  **Configura tus credenciales de Firebase (¡MUY IMPORTANTE!):**
    *   Abre `lib/main.dart`, descomenta el bloque `Firebase.initializeApp` y rellénalo con las credenciales de tu proyecto de Firebase.
    *   Abre `lib/screens/home_screen.dart` y reemplaza `'YOUR_DATABASE_URL'` con la URL de tu Realtime Database.

### 4. Ejecuta la Aplicación

Con un emulador en ejecución o un dispositivo conectado, ejecuta el siguiente comando desde la carpeta `iot_app`:

```bash
flutter run
```

## Paso Final: Configurar Reglas de Seguridad

Para cumplir con los requisitos de seguridad y proteger tu base de datos, es **crucial** que configures las reglas en tu consola de Firebase.

1.  Ve a tu Proyecto de Firebase.
2.  En el menú, selecciona **Realtime Database**.
3.  Ve a la pestaña **Reglas**.
4.  Reemplaza las reglas existentes con el siguiente código y haz clic en **Publicar**:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

Estas reglas garantizan que solo los usuarios autenticados en tu aplicación puedan leer o escribir datos.

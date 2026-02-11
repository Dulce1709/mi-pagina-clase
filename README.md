# 📺 TV en Vivo - Proyecto de Streaming

Aplicación web para reproducir televisión en vivo usando HLS streaming.

## 🚀 Características

- ✅ Reproductor de video HLS
- ✅ Múltiples canales predefinidos
- ✅ Interfaz responsive
- ✅ Indicador de estado de conexión
- ✅ Diseño moderno con gradientes
- ✅ Soporte para navegadores modernos

## 📁 Estructura del Proyecto

```
proyecto-tv-vivo/
├── index.html          # Página principal
├── styles.css          # Estilos
├── script.js           # Lógica de la aplicación
└── README.md          # Documentación
```

## 🛠️ Tecnologías Utilizadas

- HTML5
- CSS3 (Gradientes, Flexbox, Grid)
- JavaScript (ES6+)
- HLS.js (Librería para streaming)

## 📋 Pasos para Desplegar en Render

### 1. Preparar el Repositorio en GitHub

1. Abre **GitHub Desktop**
2. Ve a `File` → `Add Local Repository`
3. Selecciona la carpeta de tu proyecto
4. Si no existe el repositorio, te pedirá crearlo
5. Haz clic en "Create Repository"
6. Escribe un mensaje de commit: "Proyecto TV en vivo inicial"
7. Haz clic en "Commit to main"
8. Haz clic en "Publish repository"
9. Marca como público (Public) si quieres
10. Haz clic en "Publish Repository"

### 2. Desplegar en Render

1. Ve a [https://render.com](https://render.com)
2. Inicia sesión o crea una cuenta
3. Haz clic en "New +" → "Static Site"
4. Conecta tu repositorio de GitHub
5. Configura:
   - **Name**: tv-en-vivo (o el nombre que quieras)
   - **Branch**: main
   - **Build Command**: (déjalo vacío)
   - **Publish Directory**: . (punto)
6. Haz clic en "Create Static Site"
7. Espera unos minutos a que se despliegue
8. ¡Listo! Tendrás una URL como: `https://tu-proyecto.onrender.com`

## 🎯 Canales Incluidos

El proyecto incluye varios canales de demostración:
- Canal Demo 1 (Stream de prueba HD)
- NASA TV (Transmisión en vivo de la NASA)
- Red Bull TV
- Arte France
- Big Buck Bunny (Video de demostración)

## 💡 Cómo Usar

1. Abre la aplicación en tu navegador
2. Haz clic en cualquier botón de canal
3. El video comenzará a reproducirse automáticamente
4. Puedes cambiar de canal en cualquier momento
5. Usa los controles del reproductor para pausar, ajustar volumen, etc.

## 🔧 Personalización

### Agregar Más Canales

Edita el archivo `script.js` y agrega nuevos canales al array `channels`:

```javascript
const channels = [
    {
        name: "Tu Canal",
        url: "https://tu-stream-url.m3u8",
        description: "Descripción del canal"
    },
    // ... más canales
];
```

### Cambiar Colores

Edita `styles.css` y modifica los gradientes:

```css
background: linear-gradient(135deg, #TU_COLOR_1 0%, #TU_COLOR_2 100%);
```

## 📱 Compatibilidad

- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Opera
- ✅ Dispositivos móviles (iOS/Android)

## ⚠️ Requisitos

- Conexión a internet
- Navegador moderno con soporte para HTML5
- Los streams deben ser URLs públicas en formato HLS (.m3u8)

## 🐛 Solución de Problemas

**El video no carga:**
- Verifica que la URL del stream sea válida
- Asegúrate de tener buena conexión a internet
- Algunos streams pueden estar temporalmente fuera de línea

**Autoplay bloqueado:**
- Haz clic en el botón de reproducción manualmente
- Los navegadores bloquean autoplay con sonido por defecto

**Error de CORS:**
- Algunos streams pueden tener restricciones de CORS
- Usa solo streams públicos que permitan reproducción web

## 📝 Notas

- Este proyecto usa streams de demostración públicos
- Para usar canales comerciales necesitarás permisos y licencias
- El rendimiento depende de tu velocidad de internet

## 👨‍💻 Autor

Proyecto creado para la clase de Aplicaciones Web

## 📄 Licencia

Proyecto educativo - Uso libre

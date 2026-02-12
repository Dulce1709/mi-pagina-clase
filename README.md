# 📺 TV en Vivo - Versión YouTube

Aplicación web para reproducir videos y transmisiones en vivo de YouTube.

## 🎯 ¿CÓMO CAMBIAR LOS VIDEOS DE YOUTUBE?

### Paso 1: Encuentra el video en YouTube

1. Ve a YouTube y busca el video o transmisión en vivo que quieras
2. Copia la URL del video
   - Ejemplo: `https://www.youtube.com/watch?v=jfKfPfyJRdk`

### Paso 2: Obtén el Video ID

El **Video ID** es la parte después de `v=` en la URL:
```
https://www.youtube.com/watch?v=jfKfPfyJRdk
                              ^^^^^^^^^^^
                              Este es el Video ID
```

### Paso 3: Edita el archivo script.js

Abre `script.js` y busca el array `channels` al inicio del archivo:

```javascript
const channels = [
    {
        name: "Tu Canal",           // Nombre que aparecerá en el botón
        videoId: "VIDEO_ID_AQUI",   // Pega el Video ID aquí
        description: "Descripción"   // Breve descripción
    },
    // Agrega más canales aquí...
];
```

### Ejemplo Real:

Quieres agregar un video de música:
1. URL: `https://www.youtube.com/watch?v=5qap5aO4i9A`
2. Video ID: `5qap5aO4i9A`
3. Código:

```javascript
{
    name: "Música Lofi",
    videoId: "5qap5aO4i9A",
    description: "Lofi hip hop para estudiar"
}
```

## 🔄 CÓMO ACTUALIZAR EN RENDER

Una vez que hagas cambios en tus archivos:

### Método 1: GitHub Desktop (Recomendado)

1. **Abre GitHub Desktop**
2. Verás los archivos modificados en el panel izquierdo
3. Escribe un mensaje: "Actualización de canales"
4. Haz clic en **"Commit to main"**
5. Haz clic en **"Push origin"**
6. **Render detectará automáticamente** los cambios
7. En 1-2 minutos tu sitio se actualizará solo

### Método 2: Desde el Dashboard de Render

1. Ve a tu dashboard de Render
2. Selecciona tu proyecto `mi-tv-live`
3. Haz clic en **"Manual Deploy"**
4. Selecciona **"Deploy latest commit"**
5. Espera 1-2 minutos

## 📋 Canales Actuales Incluidos

1. **Lofi Girl 24/7** - Música para estudiar
2. **NASA TV Live** - Transmisión NASA en vivo
3. **Noticias 24/7** - ABC News
4. **Naturaleza Relax** - Sonidos naturales
5. **Música Clásica** - Obras maestras
6. **Ocean Waves** - Olas del océano

## 💡 Ideas de Canales para Agregar

### Transmisiones en Vivo 24/7:
- Lofi Girl: `jfKfPfyJRdk`
- NASA TV: `21X5lGlDOfg`
- ABC News: `dp8PhLsUcFE`
- Bloomberg TV: `Ga3maNZ0x0w`
- Sky News: `9Auq9mYxFEE`

### Música:
- Jazz: `Dx5qFachd3A`
- Piano Relajante: `lTRiuFIWV54`
- Música Clásica: `jgpJVI3tDbY`

### Naturaleza y Relajación:
- Lluvia: `q76bMs-NwRk`
- Olas del Mar: `bn9F19Hi1cM`
- Chimenea: `L_LUpnjgPso`

## ⚠️ Notas Importantes

1. **Videos privados o restringidos** no funcionarán
2. Algunos videos pueden tener restricciones de reproducción en sitios externos
3. Las transmisiones en vivo 24/7 son las más confiables
4. Puedes tener hasta 10-12 canales sin problemas

## 🛠️ Estructura del Proyecto

```
proyecto-tv-vivo/
├── index.html          # Página principal
├── styles.css          # Estilos
├── script.js           # AQUÍ CAMBIAS LOS CANALES
└── README.md          # Esta documentación
```

## 🚀 Tecnologías

- HTML5
- CSS3
- JavaScript
- YouTube Iframe API

## 📝 Licencia

Proyecto educativo - Uso libre

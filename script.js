// Configuración de canales - AQUÍ PUEDES CAMBIAR LOS VIDEOS DE YOUTUBE
const channels = [
    {
        name: "Romance",
        videoId: "HJm8dqnb6hY",
        description: "Peliculas de Romance"
    },
    {
        name: "Infantil",
        videoId: "eE56hm3yNOk",
        description: "Caricaturas"
    },
    {
        name: "Noticias 24/7",
        videoId: "zxmAgXeyTgY",
        description: "Noticias en vivo"
    },
    {
        name: "Naturaleza Relax",
        videoId: "9Zq79uu_o5E",
        description: "Sonidos de la naturaleza"
    },
    {
        name: "Música Clásica",
        videoId: "c5dW5Oc9X7I",
        description: "Las mejores obras clásicas"
    },
    {
        name: "Comedia",
        videoId: "I6le--Xtfhc",
        description: "Las mejores comedias"
    }
];

// IMPORTANTE: Para obtener el videoId de un video de YouTube:
// 1. Ve al video en YouTube
// 2. La URL será: https://www.youtube.com/watch?v=XXXXXXXXXX
//    o https://youtu.be/XXXXXXXXXX
//    o https://www.youtube.com/live/XXXXXXXXXX (para transmisiones en vivo)
// 3. Copia solo la parte XXXXXXXXXX (el ID del video)
// 4. Ese es tu videoId - NO pongas la URL completa, solo el ID

let currentChannelIndex = -1;

// NUEVAS VARIABLES PARA TRANSMISIÓN EN VIVO
let liveStream = null;
let isLiveStreaming = false;

// Elementos del DOM
const videoPlayer = document.getElementById('videoPlayer');
const channelGrid = document.getElementById('channelGrid');
const channelInfo = document.getElementById('channelInfo');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const loadingOverlay = document.getElementById('loadingOverlay');

// NUEVOS ELEMENTOS PARA TRANSMISIÓN EN VIVO
const liveStreamVideo = document.getElementById('liveStream');
const startLiveBtn = document.getElementById('startLiveBtn');
const stopLiveBtn = document.getElementById('stopLiveBtn');

// Inicializar la aplicación
function init() {
    renderChannels();
    updateStatus(true, 'Listo para reproducir');
    hideLoading();
    
    // NUEVO: Event listeners para transmisión en vivo
    startLiveBtn.addEventListener('click', startLiveStream);
    stopLiveBtn.addEventListener('click', stopLiveStream);
}

// Renderizar botones de canales
function renderChannels() {
    channelGrid.innerHTML = '';
    
    channels.forEach((channel, index) => {
        const button = document.createElement('button');
        button.className = 'channel-btn';
        button.textContent = channel.name;
        button.onclick = () => selectChannel(index);
        channelGrid.appendChild(button);
    });
}

// Seleccionar canal
function selectChannel(index) {
    // NUEVO: Si está en vivo, detener primero
    if (isLiveStreaming) {
        stopLiveStream();
    }
    
    if (index === currentChannelIndex) return;
    
    currentChannelIndex = index;
    const channel = channels[index];
    
    showLoading();
    updateChannelInfo(channel);
    updateActiveButton(index);
    loadVideo(channel.videoId);
}

// Cargar video de YouTube
function loadVideo(videoId) {
    // NUEVO: Ocultar video en vivo
    liveStreamVideo.classList.remove('active');
    
    // Construir URL del iframe de YouTube
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&rel=0&enablejsapi=1`;
    
    // Establecer la URL en el iframe
    videoPlayer.src = embedUrl;
    
    // Simular carga (YouTube carga rápido)
    setTimeout(() => {
        hideLoading();
        updateStatus(true, 'Reproduciendo');
    }, 1000);
}

// ============================================
// NUEVAS FUNCIONES PARA TRANSMISIÓN EN VIVO
// ============================================

// Iniciar transmisión en vivo
async function startLiveStream() {
    try {
        showLoading();
        
        // Solicitar acceso a cámara y micrófono
        liveStream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        });
        
        // Asignar el stream al elemento video
        liveStreamVideo.srcObject = liveStream;
        liveStreamVideo.muted = false; // Activar audio
        
        // Mostrar el video en vivo
        liveStreamVideo.classList.add('active');
        
        // Ocultar iframe de YouTube
        videoPlayer.src = '';
        
        // Actualizar controles
        isLiveStreaming = true;
        startLiveBtn.classList.add('hidden');
        stopLiveBtn.classList.remove('hidden');
        startLiveBtn.classList.add('recording');
        
        // Desactivar todos los botones de canales
        const buttons = document.querySelectorAll('.channel-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        currentChannelIndex = -1;
        
        // Actualizar información
        updateChannelInfo({
            name: 'MI TRANSMISIÓN EN VIVO',
            description: '🔴 Transmitiendo ahora'
        });
        
        hideLoading();
        updateStatus('live', '🔴 EN VIVO');
        statusIndicator.classList.add('live');
        
    } catch (error) {
        console.error('Error al acceder a la cámara/micrófono:', error);
        hideLoading();
        
        let errorMessage = 'No se pudo acceder a la cámara o micrófono';
        
        if (error.name === 'NotAllowedError') {
            errorMessage = 'Permiso denegado. Por favor permite el acceso a la cámara y micrófono';
        } else if (error.name === 'NotFoundError') {
            errorMessage = 'No se encontró cámara o micrófono conectado';
        } else if (error.name === 'NotReadableError') {
            errorMessage = 'La cámara o micrófono está siendo usado por otra aplicación';
        }
        
        alert('❌ ' + errorMessage);
        updateStatus(false, 'Error al iniciar transmisión');
    }
}

// Detener transmisión en vivo
function stopLiveStream() {
    if (liveStream) {
        // Detener todos los tracks del stream
        liveStream.getTracks().forEach(track => track.stop());
        liveStreamVideo.srcObject = null;
        liveStream = null;
    }
    
    // Ocultar video en vivo
    liveStreamVideo.classList.remove('active');
    
    // Actualizar controles
    isLiveStreaming = false;
    startLiveBtn.classList.remove('hidden');
    stopLiveBtn.classList.add('hidden');
    startLiveBtn.classList.remove('recording');
    
    // Actualizar estado
    statusIndicator.classList.remove('live');
    updateChannelInfo({
        name: 'Transmisión detenida',
        description: 'Selecciona un canal o inicia tu transmisión'
    });
    updateStatus(true, 'Listo para reproducir');
}

// ============================================
// FIN DE NUEVAS FUNCIONES
// ============================================

// Actualizar información del canal
function updateChannelInfo(channel) {
    channelInfo.textContent = `📡 ${channel.name} - ${channel.description}`;
}

// Actualizar botón activo
function updateActiveButton(index) {
    const buttons = document.querySelectorAll('.channel-btn');
    buttons.forEach((btn, i) => {
        if (i === index) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Actualizar estado de conexión - MODIFICADO PARA SOPORTAR ESTADO "LIVE"
function updateStatus(connected, text) {
    if (connected === 'live') {
        statusIndicator.classList.add('live');
        statusIndicator.classList.add('connected');
    } else if (connected) {
        statusIndicator.classList.add('connected');
        statusIndicator.classList.remove('live');
    } else {
        statusIndicator.classList.remove('connected');
        statusIndicator.classList.remove('live');
    }
    statusText.textContent = text;
}

// Mostrar/ocultar loading
function showLoading() {
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

// NUEVO: Limpiar recursos al cerrar la página
window.addEventListener('beforeunload', () => {
    if (isLiveStreaming) {
        stopLiveStream();
    }
});

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

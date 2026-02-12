// Configuración de canales - AQUÍ PUEDES CAMBIAR LOS VIDEOS DE YOUTUBE
const channels = [
    {
        name: "Lofi Girl 24/7",
        videoId: "jfKfPfyJRdk", // ID del video de YouTube
        description: "Música lofi para estudiar/relajarse"
    },
    {
        name: "NASA TV Live",
        videoId: "21X5lGlDOfg", // Transmisión en vivo de NASA
        description: "NASA TV en directo"
    },
    {
        name: "Noticias 24/7",
        videoId: "dp8PhLsUcFE", // ABC News Live
        description: "Noticias en vivo"
    },
    {
        name: "Naturaleza Relax",
        videoId: "LoQ4x2NXsLw", // Video de naturaleza relajante
        description: "Sonidos de la naturaleza"
    },
    {
        name: "Música Clásica",
        videoId: "jgpJVI3tDbY", // Música clásica
        description: "Las mejores obras clásicas"
    },
    {
        name: "Ocean Waves",
        videoId: "bn9F19Hi1cM", // Olas del océano
        description: "Sonido de olas para relajación"
    }
];

// IMPORTANTE: Para obtener el videoId de un video de YouTube:
// 1. Ve al video en YouTube
// 2. La URL será: https://www.youtube.com/watch?v=XXXXXXXXXX
// 3. Copia solo la parte XXXXXXXXXX (después del "v=")
// 4. Ese es tu videoId

let currentChannelIndex = -1;

// Elementos del DOM
const videoPlayer = document.getElementById('videoPlayer');
const channelGrid = document.getElementById('channelGrid');
const channelInfo = document.getElementById('channelInfo');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const loadingOverlay = document.getElementById('loadingOverlay');

// Inicializar la aplicación
function init() {
    renderChannels();
    updateStatus(true, 'Listo para reproducir');
    hideLoading();
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
    // Construir URL del iframe de YouTube
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&rel=0`;
    
    // Establecer la URL en el iframe
    videoPlayer.src = embedUrl;
    
    // Simular carga (YouTube carga rápido)
    setTimeout(() => {
        hideLoading();
        updateStatus(true, 'Reproduciendo');
    }, 1000);
}

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

// Actualizar estado de conexión
function updateStatus(connected, text) {
    if (connected) {
        statusIndicator.classList.add('connected');
    } else {
        statusIndicator.classList.remove('connected');
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

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

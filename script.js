// Configuración de canales de TV en vivo
const channels = [
    {
        name: "Canal Demo 1",
        url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        description: "Stream de prueba HD"
    },
    {
        name: "NASA TV",
        url: "https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8",
        description: "NASA TV en vivo"
    },
    {
        name: "Red Bull TV",
        url: "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8",
        description: "Red Bull TV"
    },
    {
        name: "Canal Demo 2",
        url: "https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8",
        description: "Stream de prueba"
    },
    {
        name: "Big Buck Bunny",
        url: "https://test-streams.mux.dev/x36xhzz/url_6/193039199_mp4_h264_aac_hd_7.m3u8",
        description: "Video de demostración"
    },
    {
        name: "Arte France",
        url: "https://artesimulcast.akamaized.net/hls/live/2031003/artelive_fr/master.m3u8",
        description: "Arte France en vivo"
    }
];

let hls;
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
    setupVideoPlayer();
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

// Configurar el reproductor de video
function setupVideoPlayer() {
    if (Hls.isSupported()) {
        hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });

        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            hideLoading();
            updateStatus(true, 'Conectado');
            videoPlayer.play().catch(e => {
                console.log('Autoplay bloqueado:', e);
                showNotification('Haz clic en play para comenzar');
            });
        });

        hls.on(Hls.Events.ERROR, function(event, data) {
            console.error('Error HLS:', data);
            if (data.fatal) {
                handleError(data);
            }
        });

    } else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
        // Soporte nativo en Safari
        videoPlayer.addEventListener('loadedmetadata', function() {
            hideLoading();
            updateStatus(true, 'Conectado');
            videoPlayer.play();
        });

        videoPlayer.addEventListener('error', function() {
            handleError({ type: 'native', fatal: true });
        });
    } else {
        alert('Tu navegador no soporta HLS streaming');
    }
}

// Seleccionar canal
function selectChannel(index) {
    if (index === currentChannelIndex) return;
    
    currentChannelIndex = index;
    const channel = channels[index];
    
    showLoading();
    updateChannelInfo(channel);
    updateActiveButton(index);
    loadStream(channel.url);
}

// Cargar stream
function loadStream(url) {
    if (Hls.isSupported()) {
        if (hls) {
            hls.destroy();
        }
        hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });

        hls.loadSource(url);
        hls.attachMedia(videoPlayer);

        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            hideLoading();
            updateStatus(true, 'Conectado - Reproduciendo');
            videoPlayer.play().catch(e => {
                console.log('Autoplay bloqueado:', e);
            });
        });

        hls.on(Hls.Events.ERROR, function(event, data) {
            if (data.fatal) {
                handleError(data);
            }
        });

    } else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
        videoPlayer.src = url;
        videoPlayer.addEventListener('loadedmetadata', function() {
            hideLoading();
            updateStatus(true, 'Conectado - Reproduciendo');
        });
    }
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

// Manejar errores
function handleError(data) {
    hideLoading();
    updateStatus(false, 'Error de conexión');
    
    let errorMsg = 'No se pudo cargar el stream. ';
    
    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        errorMsg += 'Problema de red. Verificando...';
        // Intentar recuperar
        if (hls) {
            setTimeout(() => {
                hls.startLoad();
            }, 2000);
        }
    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        errorMsg += 'Error de media. Intentando recuperar...';
        if (hls) {
            hls.recoverMediaError();
        }
    } else {
        errorMsg += 'Intenta con otro canal.';
    }
    
    showNotification(errorMsg);
}

// Mostrar notificación
function showNotification(message) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Agregar estilos de animación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Limpiar al salir
window.addEventListener('beforeunload', () => {
    if (hls) {
        hls.destroy();
    }
});

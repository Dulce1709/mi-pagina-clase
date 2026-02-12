// Configuración de canales
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

let currentChannelIndex = -1;
let liveStream = null;
let isLiveStreaming = false;

// Variables para WebRTC
let peer = null;
let myPeerId = null;
let connections = [];
let viewerCount = 0;

// Elementos del DOM
const videoPlayer = document.getElementById('videoPlayer');
const channelGrid = document.getElementById('channelGrid');
const channelInfo = document.getElementById('channelInfo');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const loadingOverlay = document.getElementById('loadingOverlay');
const liveStreamVideo = document.getElementById('liveStream');
const startLiveBtn = document.getElementById('startLiveBtn');
const stopLiveBtn = document.getElementById('stopLiveBtn');
const shareSection = document.getElementById('shareSection');
const shareLink = document.getElementById('shareLink');
const roomId = document.getElementById('roomId');
const copyBtn = document.getElementById('copyBtn');
const viewersCount = document.getElementById('viewersCount');
const viewerNumber = document.getElementById('viewerNumber');

// Inicializar la aplicación
function init() {
    renderChannels();
    updateStatus(true, 'Listo para reproducir');
    hideLoading();
    
    // Event listeners
    startLiveBtn.addEventListener('click', startLiveStream);
    stopLiveBtn.addEventListener('click', stopLiveStream);
    copyBtn.addEventListener('click', copyShareLink);
    
    // Verificar si es espectador (tiene roomId en URL)
    const urlParams = new URLSearchParams(window.location.search);
    const viewRoomId = urlParams.get('room');
    
    if (viewRoomId) {
        // Es un espectador, ocultar botón de transmitir
        startLiveBtn.style.display = 'none';
        document.querySelector('.live-controls').style.display = 'none';
        
        // Conectar a la sala
        joinRoom(viewRoomId);
    }
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
    liveStreamVideo.classList.remove('active');
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&rel=0&enablejsapi=1`;
    videoPlayer.src = embedUrl;
    
    setTimeout(() => {
        hideLoading();
        updateStatus(true, 'Reproduciendo');
    }, 1000);
}

// ============================================
// FUNCIONES DE TRANSMISIÓN EN VIVO CON WebRTC
// ============================================

// Iniciar transmisión en vivo
async function startLiveStream() {
    try {
        showLoading();
        
        // Inicializar PeerJS
        peer = new Peer({
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            }
        });
        
        // Esperar a que se genere el ID
        peer.on('open', async (id) => {
            myPeerId = id;
            console.log('Mi Peer ID:', myPeerId);
            
            try {
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
                
                // Mostrar video local
                liveStreamVideo.srcObject = liveStream;
                liveStreamVideo.muted = false;
                liveStreamVideo.classList.add('active');
                
                // Ocultar iframe
                videoPlayer.src = '';
                
                // Configurar para aceptar llamadas entrantes
                peer.on('call', (call) => {
                    console.log('Recibiendo llamada de espectador');
                    call.answer(liveStream);
                    connections.push(call);
                    viewerCount++;
                    updateViewerCount();
                    
                    call.on('close', () => {
                        viewerCount--;
                        updateViewerCount();
                        connections = connections.filter(c => c !== call);
                    });
                });
                
                // Actualizar UI
                isLiveStreaming = true;
                startLiveBtn.classList.add('hidden');
                stopLiveBtn.classList.remove('hidden');
                
                // Mostrar enlace para compartir
                const currentUrl = window.location.origin + window.location.pathname;
                const shareUrl = `${currentUrl}?room=${myPeerId}`;
                shareLink.value = shareUrl;
                roomId.textContent = myPeerId;
                shareSection.classList.remove('hidden');
                viewersCount.classList.remove('hidden');
                
                // Desactivar botones de canales
                const buttons = document.querySelectorAll('.channel-btn');
                buttons.forEach(btn => btn.classList.remove('active'));
                currentChannelIndex = -1;
                
                updateChannelInfo({
                    name: 'MI TRANSMISIÓN EN VIVO',
                    description: '🔴 Transmitiendo ahora'
                });
                
                hideLoading();
                updateStatus('live', '🔴 EN VIVO');
                statusIndicator.classList.add('live');
                
            } catch (error) {
                console.error('Error al acceder a cámara:', error);
                handleStreamError(error);
            }
        });
        
        peer.on('error', (error) => {
            console.error('Error de PeerJS:', error);
            alert('Error al conectar con el servidor de streaming. Intenta de nuevo.');
            hideLoading();
        });
        
    } catch (error) {
        console.error('Error general:', error);
        handleStreamError(error);
    }
}

// Unirse a una sala como espectador
function joinRoom(roomIdToJoin) {
    showLoading();
    
    updateChannelInfo({
        name: 'CONECTANDO...',
        description: 'Esperando transmisión en vivo'
    });
    
    // Inicializar PeerJS como espectador
    peer = new Peer({
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' }
            ]
        }
    });
    
    peer.on('open', (id) => {
        console.log('Mi ID como espectador:', id);
        console.log('Conectando a sala:', roomIdToJoin);
        
        // Esperar 2 segundos antes de intentar conectar
        setTimeout(() => {
            // Llamar al transmisor
            const call = peer.call(roomIdToJoin, null);
            
            if (call) {
                let streamReceived = false;
                
                call.on('stream', (remoteStream) => {
                    console.log('Recibiendo stream del transmisor');
                    streamReceived = true;
                    
                    // Mostrar el stream remoto
                    liveStreamVideo.srcObject = remoteStream;
                    liveStreamVideo.muted = false;
                    liveStreamVideo.classList.add('active');
                    videoPlayer.src = '';
                    
                    updateChannelInfo({
                        name: 'VIENDO TRANSMISIÓN EN VIVO',
                        description: '🔴 Conectado al transmisor'
                    });
                    
                    hideLoading();
                    updateStatus('live', '🔴 VIENDO EN VIVO');
                    statusIndicator.classList.add('live');
                });
                
                call.on('close', () => {
                    alert('La transmisión ha finalizado');
                    location.reload();
                });
                
                call.on('error', (error) => {
                    console.error('Error en la llamada:', error);
                    hideLoading();
                    showViewerError();
                });
                
                // Timeout si no recibe stream en 10 segundos
                setTimeout(() => {
                    if (!streamReceived) {
                        hideLoading();
                        showViewerError();
                    }
                }, 10000);
                
            } else {
                hideLoading();
                showViewerError();
            }
        }, 2000);
    });
    
    peer.on('error', (error) => {
        console.error('Error del espectador:', error);
        hideLoading();
        showViewerError();
    });
}

// Mostrar error al espectador
function showViewerError() {
    updateChannelInfo({
        name: 'NO SE PUDO CONECTAR',
        description: 'La transmisión no está activa o el enlace es incorrecto'
    });
    updateStatus(false, 'Error de conexión');
    
    // Mostrar mensaje amigable
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        text-align: center;
        z-index: 1000;
        max-width: 400px;
    `;
    errorDiv.innerHTML = `
        <h2 style="color: #f5576c; margin-bottom: 15px;">⚠️ No se pudo conectar</h2>
        <p style="margin-bottom: 20px; color: #555;">
            <strong>Posibles razones:</strong><br><br>
            • El transmisor no está transmitiendo ahora<br>
            • El enlace es incorrecto<br>
            • Problemas de conexión a internet
        </p>
        <button onclick="location.reload()" style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
        ">🔄 Intentar de nuevo</button>
    `;
    document.body.appendChild(errorDiv);
}

// Detener transmisión
function stopLiveStream() {
    // Cerrar todas las conexiones
    connections.forEach(conn => {
        try {
            conn.close();
        } catch (e) {
            console.error('Error cerrando conexión:', e);
        }
    });
    connections = [];
    viewerCount = 0;
    
    // Detener stream
    if (liveStream) {
        liveStream.getTracks().forEach(track => track.stop());
        liveStreamVideo.srcObject = null;
        liveStream = null;
    }
    
    // Destruir peer
    if (peer) {
        peer.destroy();
        peer = null;
    }
    
    // Ocultar video
    liveStreamVideo.classList.remove('active');
    
    // Actualizar UI
    isLiveStreaming = false;
    startLiveBtn.classList.remove('hidden');
    stopLiveBtn.classList.add('hidden');
    shareSection.classList.add('hidden');
    viewersCount.classList.add('hidden');
    
    statusIndicator.classList.remove('live');
    updateChannelInfo({
        name: 'Transmisión detenida',
        description: 'Selecciona un canal o inicia tu transmisión'
    });
    updateStatus(true, 'Listo para reproducir');
}

// Manejar errores de stream
function handleStreamError(error) {
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

// Actualizar contador de espectadores
function updateViewerCount() {
    viewerNumber.textContent = viewerCount;
}

// Copiar enlace
function copyShareLink() {
    shareLink.select();
    shareLink.setSelectionRange(0, 99999); // Para móviles
    
    navigator.clipboard.writeText(shareLink.value).then(() => {
        copyBtn.textContent = '✅ Copiado!';
        copyBtn.classList.add('copied');
        
        setTimeout(() => {
            copyBtn.textContent = '📋 Copiar';
            copyBtn.classList.remove('copied');
        }, 2000);
    });
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function updateChannelInfo(channel) {
    channelInfo.textContent = `📡 ${channel.name} - ${channel.description}`;
}

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

function showLoading() {
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

// Limpiar al cerrar
window.addEventListener('beforeunload', () => {
    if (isLiveStreaming) {
        stopLiveStream();
    }
});

// Inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

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
        // Es un espectador: ocultar controles de transmisión
        document.querySelector('.live-controls').style.display = 'none';
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
// TRANSMISOR: Iniciar transmisión en vivo
// ============================================
async function startLiveStream() {
    try {
        showLoading();

        // 1. Pedir permisos de cámara y micrófono PRIMERO
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

        // 2. Mostrar la vista previa local (silenciada para evitar eco)
        liveStreamVideo.srcObject = liveStream;
        liveStreamVideo.muted = true; // Solo el transmisor se silencia a sí mismo
        liveStreamVideo.classList.add('active');
        videoPlayer.src = '';

        // 3. Crear el peer DESPUÉS de tener el stream
        peer = new Peer({
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    { urls: 'stun:stun2.l.google.com:19302' },
                    { urls: 'stun:stun3.l.google.com:19302' }
                ]
            }
        });

        peer.on('open', (id) => {
            myPeerId = id;
            console.log('Transmisor ID:', myPeerId);

            // 4. Escuchar conexiones de datos (espectadores que se "registran")
            peer.on('connection', (dataConn) => {
                console.log('Espectador conectado por datos:', dataConn.peer);

                dataConn.on('open', () => {
                    // Llamar al espectador y enviarle el stream
                    console.log('Enviando stream a espectador:', dataConn.peer);
                    const call = peer.call(dataConn.peer, liveStream);
                    connections.push(call);
                    viewerCount++;
                    updateViewerCount();

                    call.on('close', () => {
                        viewerCount = Math.max(0, viewerCount - 1);
                        updateViewerCount();
                        connections = connections.filter(c => c !== call);
                    });

                    call.on('error', (err) => {
                        console.error('Error en llamada a espectador:', err);
                        viewerCount = Math.max(0, viewerCount - 1);
                        updateViewerCount();
                        connections = connections.filter(c => c !== call);
                    });
                });

                dataConn.on('close', () => {
                    console.log('Espectador desconectado');
                });
            });

            // Mostrar enlace para compartir
            const currentUrl = window.location.origin + window.location.pathname;
            const shareUrl = `${currentUrl}?room=${myPeerId}`;
            shareLink.value = shareUrl;
            roomId.textContent = myPeerId;
            shareSection.classList.remove('hidden');
            viewersCount.classList.remove('hidden');

            // Actualizar UI
            isLiveStreaming = true;
            startLiveBtn.classList.add('hidden');
            stopLiveBtn.classList.remove('hidden');

            const buttons = document.querySelectorAll('.channel-btn');
            buttons.forEach(btn => btn.classList.remove('active'));
            currentChannelIndex = -1;

            updateChannelInfo({
                name: 'MI TRANSMISIÓN EN VIVO',
                description: '🔴 Transmitiendo ahora'
            });

            hideLoading();
            updateStatus('live', '🔴 EN VIVO');
        });

        peer.on('error', (error) => {
            console.error('Error PeerJS transmisor:', error);
            hideLoading();
            alert('Error al iniciar la transmisión: ' + error.type + '. Intenta de nuevo.');
        });

    } catch (error) {
        console.error('Error al acceder a cámara/micrófono:', error);
        handleStreamError(error);
    }
}

// ============================================
// ESPECTADOR: Unirse a una sala
// ============================================
function joinRoom(roomIdToJoin) {
    showLoading();
    updateChannelInfo({
        name: 'CONECTANDO...',
        description: 'Esperando transmisión en vivo...'
    });

    // Crear peer del espectador
    peer = new Peer({
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' }
            ]
        }
    });

    peer.on('open', (myId) => {
        console.log('Espectador ID:', myId);
        console.log('Conectando al transmisor:', roomIdToJoin);

        // 1. Primero abrir conexión de datos para "registrarse" con el transmisor
        const dataConn = peer.connect(roomIdToJoin, { reliable: true });

        let streamReceived = false;

        dataConn.on('open', () => {
            console.log('Conexión de datos abierta con transmisor');
            // El transmisor nos llamará automáticamente al recibir esta conexión
        });

        dataConn.on('error', (err) => {
            console.error('Error en conexión de datos:', err);
            hideLoading();
            showViewerError();
        });

        // 2. Escuchar la llamada entrante del transmisor (él nos llama a nosotros)
        peer.on('call', (call) => {
            console.log('Recibiendo stream del transmisor');

            // Responder SIN stream (solo somos espectadores)
            call.answer();

            call.on('stream', (remoteStream) => {
                console.log('Stream recibido correctamente');
                streamReceived = true;

                liveStreamVideo.srcObject = remoteStream;
                liveStreamVideo.muted = false;
                liveStreamVideo.classList.add('active');
                videoPlayer.src = '';

                // Intentar reproducir con audio
                liveStreamVideo.play().catch((e) => {
                    console.warn('Autoplay bloqueado, reproduciendo sin audio:', e);
                    liveStreamVideo.muted = true;
                    liveStreamVideo.play();

                    // Mostrar botón para activar audio
                    showUnmuteButton();
                });

                updateChannelInfo({
                    name: 'VIENDO TRANSMISIÓN EN VIVO',
                    description: '🔴 Conectado al transmisor'
                });

                hideLoading();
                updateStatus('live', '🔴 VIENDO EN VIVO');
            });

            call.on('close', () => {
                updateChannelInfo({
                    name: 'Transmisión finalizada',
                    description: 'El transmisor ha detenido la transmisión'
                });
                hideLoading();
                updateStatus(false, 'Transmisión finalizada');
                liveStreamVideo.srcObject = null;
                liveStreamVideo.classList.remove('active');
            });

            call.on('error', (error) => {
                console.error('Error en la llamada:', error);
                hideLoading();
                showViewerError();
            });
        });

        // Timeout si no llega el stream en 15 segundos
        setTimeout(() => {
            if (!streamReceived) {
                hideLoading();
                showViewerError();
            }
        }, 15000);
    });

    peer.on('error', (error) => {
        console.error('Error PeerJS espectador:', error);
        hideLoading();
        showViewerError();
    });
}

// Botón para activar audio si el autoplay lo bloqueó
function showUnmuteButton() {
    const existing = document.getElementById('unmuteBtn');
    if (existing) return;

    const btn = document.createElement('button');
    btn.id = 'unmuteBtn';
    btn.textContent = '🔊 Toca para activar el audio';
    btn.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 15px 30px;
        border-radius: 12px;
        font-size: 1em;
        font-weight: bold;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    btn.onclick = () => {
        liveStreamVideo.muted = false;
        liveStreamVideo.play();
        btn.remove();
    };
    document.body.appendChild(btn);
}

// Mostrar error al espectador
function showViewerError() {
    updateChannelInfo({
        name: 'NO SE PUDO CONECTAR',
        description: 'La transmisión no está activa o el enlace es incorrecto'
    });
    updateStatus(false, 'Error de conexión');

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
        width: 90%;
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
            font-size: 1em;
        ">🔄 Intentar de nuevo</button>
    `;
    document.body.appendChild(errorDiv);
}

// Detener transmisión
function stopLiveStream() {
    connections.forEach(conn => {
        try { conn.close(); } catch (e) { console.error(e); }
    });
    connections = [];
    viewerCount = 0;

    if (liveStream) {
        liveStream.getTracks().forEach(track => track.stop());
        liveStreamVideo.srcObject = null;
        liveStream = null;
    }

    if (peer) {
        peer.destroy();
        peer = null;
    }

    liveStreamVideo.classList.remove('active');

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

// Manejar errores de cámara/micrófono
function handleStreamError(error) {
    hideLoading();

    let errorMessage = 'No se pudo acceder a la cámara o micrófono.';

    if (error.name === 'NotAllowedError') {
        errorMessage = 'Permiso denegado. Por favor permite el acceso a la cámara y micrófono en tu navegador.';
    } else if (error.name === 'NotFoundError') {
        errorMessage = 'No se encontró cámara o micrófono conectado.';
    } else if (error.name === 'NotReadableError') {
        errorMessage = 'La cámara o micrófono está siendo usado por otra aplicación.';
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
    shareLink.setSelectionRange(0, 99999);

    navigator.clipboard.writeText(shareLink.value).then(() => {
        copyBtn.textContent = '✅ ¡Copiado!';
        copyBtn.classList.add('copied');

        setTimeout(() => {
            copyBtn.textContent = '📋 Copiar';
            copyBtn.classList.remove('copied');
        }, 2000);
    }).catch(() => {
        // Fallback para navegadores sin clipboard API
        document.execCommand('copy');
        copyBtn.textContent = '✅ ¡Copiado!';
        setTimeout(() => { copyBtn.textContent = '📋 Copiar'; }, 2000);
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
        btn.classList.toggle('active', i === index);
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

// Limpiar al cerrar la página
window.addEventListener('beforeunload', () => {
    if (isLiveStreaming) stopLiveStream();
});

// Inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

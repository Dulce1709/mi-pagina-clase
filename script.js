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

// ============================================
// CONFIGURACIÓN ICE - STUN + TURN SERVERS
// Los servidores TURN son NECESARIOS cuando
// transmisor y espectador están en redes
// diferentes (WiFi vs 4G, etc.)
// ============================================
const ICE_SERVERS = {
    iceServers: [
        // STUN - descubren la IP pública
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        // TURN - intermediarios cuando la conexión directa falla (WiFi <-> 4G)
        {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        },
        {
            urls: 'turn:openrelay.metered.ca:443',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        },
        {
            urls: 'turn:openrelay.metered.ca:443?transport=tcp',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        }
    ],
    iceCandidatePoolSize: 10
};

let currentChannelIndex = -1;
let liveStream = null;
let isLiveStreaming = false;

// Variables WebRTC
let peer = null;
let myPeerId = null;
let connections = [];
let viewerCount = 0;

// Elementos DOM
const videoPlayer      = document.getElementById('videoPlayer');
const channelGrid      = document.getElementById('channelGrid');
const channelInfo      = document.getElementById('channelInfo');
const statusIndicator  = document.getElementById('statusIndicator');
const statusText       = document.getElementById('statusText');
const loadingOverlay   = document.getElementById('loadingOverlay');
const liveStreamVideo  = document.getElementById('liveStream');
const startLiveBtn     = document.getElementById('startLiveBtn');
const stopLiveBtn      = document.getElementById('stopLiveBtn');
const shareSection     = document.getElementById('shareSection');
const shareLink        = document.getElementById('shareLink');
const roomIdSpan       = document.getElementById('roomId');
const copyBtn          = document.getElementById('copyBtn');
const viewersCount     = document.getElementById('viewersCount');
const viewerNumber     = document.getElementById('viewerNumber');

// ============================================
// INICIALIZACIÓN
// ============================================
function init() {
    renderChannels();
    updateStatus(true, 'Listo para reproducir');
    hideLoading();

    startLiveBtn.addEventListener('click', startLiveStream);
    stopLiveBtn.addEventListener('click', stopLiveStream);
    copyBtn.addEventListener('click', copyShareLink);

    const urlParams = new URLSearchParams(window.location.search);
    const viewRoomId = urlParams.get('room');

    if (viewRoomId) {
        // Modo espectador
        document.querySelector('.live-controls').style.display = 'none';
        joinRoom(viewRoomId);
    }
}

// ============================================
// CANALES DE YOUTUBE
// ============================================
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

function selectChannel(index) {
    if (isLiveStreaming) stopLiveStream();
    if (index === currentChannelIndex) return;

    currentChannelIndex = index;
    const channel = channels[index];
    showLoading();
    updateChannelInfo(channel);
    updateActiveButton(index);
    loadVideo(channel.videoId);
}

function loadVideo(videoId) {
    liveStreamVideo.classList.remove('active');
    videoPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&rel=0`;
    setTimeout(() => { hideLoading(); updateStatus(true, 'Reproduciendo'); }, 1000);
}

// ============================================
// TRANSMISOR: Iniciar transmisión
// ============================================
async function startLiveStream() {
    try {
        showLoading();
        updateStatus(false, 'Iniciando cámara...');

        // 1. Pedir permisos de cámara y micrófono PRIMERO
        liveStream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        });

        // 2. Mostrar vista previa local (silenciada para evitar eco)
        liveStreamVideo.srcObject = liveStream;
        liveStreamVideo.muted = true;
        liveStreamVideo.classList.add('active');
        videoPlayer.src = '';

        updateStatus(false, 'Conectando al servidor...');

        // 3. Crear peer con STUN + TURN
        peer = new Peer({ config: ICE_SERVERS, debug: 0 });

        peer.on('open', (id) => {
            myPeerId = id;
            console.log('Transmisor conectado. ID:', id);

            // 4. Escuchar espectadores que se registran via conexión de datos
            peer.on('connection', (dataConn) => {
                console.log('Espectador registrado:', dataConn.peer);

                dataConn.on('open', () => {
                    console.log('Enviando stream a:', dataConn.peer);

                    // Llamar al espectador y enviarle el stream
                    const call = peer.call(dataConn.peer, liveStream);

                    if (!call) {
                        console.error('No se pudo llamar al espectador');
                        return;
                    }

                    connections.push(call);
                    viewerCount++;
                    updateViewerCount();

                    call.on('close', () => {
                        viewerCount = Math.max(0, viewerCount - 1);
                        updateViewerCount();
                        connections = connections.filter(c => c !== call);
                    });

                    call.on('error', (err) => {
                        console.error('Error llamada espectador:', err);
                        viewerCount = Math.max(0, viewerCount - 1);
                        updateViewerCount();
                        connections = connections.filter(c => c !== call);
                    });
                });

                dataConn.on('error', (err) => console.error('Error datos espectador:', err));
            });

            // 5. Actualizar UI
            const shareUrl = `${window.location.origin}${window.location.pathname}?room=${id}`;
            shareLink.value = shareUrl;
            roomIdSpan.textContent = id;
            shareSection.classList.remove('hidden');
            viewersCount.classList.remove('hidden');

            isLiveStreaming = true;
            startLiveBtn.classList.add('hidden');
            stopLiveBtn.classList.remove('hidden');

            document.querySelectorAll('.channel-btn').forEach(b => b.classList.remove('active'));
            currentChannelIndex = -1;

            updateChannelInfo({ name: 'MI TRANSMISIÓN EN VIVO', description: '🔴 Transmitiendo ahora' });
            hideLoading();
            updateStatus('live', '🔴 EN VIVO');
        });

        peer.on('error', (err) => {
            console.error('Error PeerJS transmisor:', err);
            hideLoading();
            alert('❌ Error al conectar: ' + err.type + '\nIntenta recargar la página.');
            updateStatus(false, 'Error de conexión');
        });

        peer.on('disconnected', () => {
            if (peer && !peer.destroyed) peer.reconnect();
        });

    } catch (error) {
        console.error('Error cámara/micrófono:', error);
        handleStreamError(error);
    }
}

// ============================================
// ESPECTADOR: Conectarse a la transmisión
// ============================================
function joinRoom(roomIdToJoin) {
    showLoading();
    updateChannelInfo({ name: 'CONECTANDO...', description: 'Buscando transmisión en vivo...' });

    peer = new Peer({ config: ICE_SERVERS, debug: 0 });

    let streamReceived = false;

    peer.on('open', (myId) => {
        console.log('Espectador ID:', myId);
        console.log('Conectando al transmisor:', roomIdToJoin);

        updateChannelInfo({ name: 'CONECTANDO...', description: 'Registrándose con el transmisor...' });

        // 1. Conectarse vía datos para que el transmisor nos detecte
        const dataConn = peer.connect(roomIdToJoin, {
            reliable: true,
            serialization: 'none'
        });

        dataConn.on('open', () => {
            console.log('Conexión de datos abierta — esperando video...');
            updateChannelInfo({ name: 'CONECTANDO...', description: 'Esperando que llegue el video...' });
        });

        dataConn.on('error', (err) => {
            console.error('Error dataConn:', err);
            if (!streamReceived) { hideLoading(); showViewerError(); }
        });

        // 2. El transmisor NOS llama — escuchar llamada entrante
        peer.on('call', (call) => {
            console.log('Llamada del transmisor recibida');

            // Responder SIN stream (solo espectadores)
            call.answer();

            call.on('stream', (remoteStream) => {
                console.log('Stream recibido correctamente');
                streamReceived = true;

                liveStreamVideo.srcObject = remoteStream;
                liveStreamVideo.muted = false;  // Audio activado para espectadores
                liveStreamVideo.classList.add('active');
                videoPlayer.src = '';

                // Intentar reproducir automáticamente
                liveStreamVideo.play().catch(err => {
                    console.log('Error autoplay:', err);
                    // En algunos navegadores puede fallar, pero el audio debería funcionar
                });

                updateChannelInfo({ name: '🔴 EN VIVO', description: 'Conectado al transmisor' });
                hideLoading();
                updateStatus('live', '🔴 VIENDO EN VIVO');
            });

            call.on('close', () => {
                liveStreamVideo.srcObject = null;
                liveStreamVideo.classList.remove('active');
                updateChannelInfo({ name: 'Transmisión terminada', description: 'El transmisor ha finalizado' });
                updateStatus(false, 'Transmisión finalizada');
                hideLoading();
            });

            call.on('error', (err) => {
                console.error('Error en llamada:', err);
                if (!streamReceived) { hideLoading(); showViewerError(); }
            });
        });

        // Timeout 18 segundos
        setTimeout(() => {
            if (!streamReceived) {
                console.warn('Timeout — no llegó el stream');
                hideLoading();
                showViewerError();
            }
        }, 18000);
    });

    peer.on('error', (err) => {
        console.error('Error PeerJS espectador:', err);
        if (!streamReceived) { hideLoading(); showViewerError(); }
    });
}

// ============================================
// BOTÓN ACTIVAR AUDIO (iOS / autoplay bloqueado)
// ============================================
function showUnmuteButton() {
    if (document.getElementById('unmuteBtn')) return;

    const style = document.createElement('style');
    style.textContent = `@keyframes flotar {
        from { transform: translateX(-50%) translateY(0px); }
        to   { transform: translateX(-50%) translateY(-10px); }
    }`;
    document.head.appendChild(style);

    const btn = document.createElement('button');
    btn.id = 'unmuteBtn';
    btn.innerHTML = '🔊 Toca aquí para activar el audio';
    btn.style.cssText = `
        position: fixed; bottom: 30px; left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white; border: none;
        padding: 16px 32px; border-radius: 50px;
        font-size: 1em; font-weight: bold;
        cursor: pointer; z-index: 9999;
        box-shadow: 0 6px 25px rgba(102,126,234,0.5);
        animation: flotar 1s ease-in-out infinite alternate;
    `;
    btn.onclick = () => {
        liveStreamVideo.muted = false;
        liveStreamVideo.play().catch(e => console.warn(e));
        btn.remove();
    };
    document.body.appendChild(btn);
}

// ============================================
// ERROR AL ESPECTADOR
// ============================================
function showViewerError() {
    updateChannelInfo({ name: 'NO SE PUDO CONECTAR', description: 'La transmisión no está activa o el enlace es incorrecto' });
    updateStatus(false, 'Error de conexión');

    const prev = document.getElementById('viewerErrorModal');
    if (prev) prev.remove();

    const errorDiv = document.createElement('div');
    errorDiv.id = 'viewerErrorModal';
    errorDiv.style.cssText = `
        position: fixed; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        background: white; padding: 30px;
        border-radius: 15px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        text-align: center; z-index: 1000;
        max-width: 380px; width: 90%;
    `;
    errorDiv.innerHTML = `
        <h2 style="color:#f5576c;margin-bottom:15px;">⚠️ No se pudo conectar</h2>
        <p style="margin-bottom:20px;color:#555;line-height:1.6;">
            <strong>Posibles razones:</strong><br><br>
            • El transmisor no está transmitiendo ahora<br>
            • El enlace es incorrecto<br>
            • Problemas de conexión a internet
        </p>
        <button onclick="location.reload()" style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; border: none;
            padding: 14px 35px; border-radius: 10px;
            cursor: pointer; font-weight: bold;
            font-size: 1em; width: 100%;
        ">🔄 Intentar de nuevo</button>
    `;
    document.body.appendChild(errorDiv);
}

// ============================================
// DETENER TRANSMISIÓN
// ============================================
function stopLiveStream() {
    connections.forEach(c => { try { c.close(); } catch(e) {} });
    connections = [];
    viewerCount = 0;

    if (liveStream) {
        liveStream.getTracks().forEach(t => t.stop());
        liveStreamVideo.srcObject = null;
        liveStream = null;
    }

    if (peer) { peer.destroy(); peer = null; }

    liveStreamVideo.classList.remove('active');
    isLiveStreaming = false;

    startLiveBtn.classList.remove('hidden');
    stopLiveBtn.classList.add('hidden');
    shareSection.classList.add('hidden');
    viewersCount.classList.add('hidden');
    statusIndicator.classList.remove('live');

    updateChannelInfo({ name: 'Transmisión detenida', description: 'Selecciona un canal o inicia tu transmisión' });
    updateStatus(true, 'Listo para reproducir');
}

// ============================================
// ERROR DE PERMISOS DE CÁMARA
// ============================================
function handleStreamError(error) {
    hideLoading();
    let msg = 'No se pudo acceder a la cámara o micrófono.';
    if (error.name === 'NotAllowedError')  msg = '🚫 Permiso denegado. Permite el acceso a la cámara y micrófono en tu navegador y recarga la página.';
    if (error.name === 'NotFoundError')    msg = '📵 No se encontró cámara o micrófono en este dispositivo.';
    if (error.name === 'NotReadableError') msg = '⚠️ La cámara está siendo usada por otra aplicación. Ciérrala e intenta de nuevo.';
    alert('❌ ' + msg);
    updateStatus(false, 'Error al iniciar transmisión');
}

// ============================================
// COPIAR ENLACE
// ============================================
function copyShareLink() {
    shareLink.select();
    shareLink.setSelectionRange(0, 99999);
    const text = shareLink.value;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(showCopied).catch(() => fallbackCopy(text));
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    try { document.execCommand('copy'); showCopied(); }
    catch(e) { alert('Copia este enlace:\n' + text); }
}

function showCopied() {
    copyBtn.textContent = '✅ ¡Copiado!';
    copyBtn.classList.add('copied');
    setTimeout(() => { copyBtn.textContent = '📋 Copiar'; copyBtn.classList.remove('copied'); }, 2500);
}

// ============================================
// UTILIDADES
// ============================================
function updateViewerCount()   { viewerNumber.textContent = viewerCount; }
function updateChannelInfo(ch) { channelInfo.textContent = `📡 ${ch.name} - ${ch.description}`; }
function showLoading()         { loadingOverlay.classList.remove('hidden'); }
function hideLoading()         { loadingOverlay.classList.add('hidden'); }

function updateActiveButton(index) {
    document.querySelectorAll('.channel-btn').forEach((btn, i) => btn.classList.toggle('active', i === index));
}

function updateStatus(connected, text) {
    if (connected === 'live') {
        statusIndicator.classList.add('live', 'connected');
    } else if (connected) {
        statusIndicator.classList.add('connected');
        statusIndicator.classList.remove('live');
    } else {
        statusIndicator.classList.remove('connected', 'live');
    }
    statusText.textContent = text;
}

window.addEventListener('beforeunload', () => { if (isLiveStreaming) stopLiveStream(); });

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

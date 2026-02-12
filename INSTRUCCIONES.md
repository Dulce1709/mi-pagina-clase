# 📺 TV en Vivo con Transmisión WebRTC

## 🎉 ¡Ahora puedes transmitir en vivo y otros pueden verte!

### ✨ ¿Qué hace esto?

Cuando inicies tu transmisión:
1. Se genera un **enlace único**
2. Compartes ese enlace con quien quieras
3. Ellos abren el enlace y **VEN TU TRANSMISIÓN EN VIVO** 🎥
4. Pueden ver tu cámara y escucharte en tiempo real
5. Puedes ver cuántos espectadores tienes conectados

---

## 🚀 Cómo usar

### **COMO TRANSMISOR (El que transmite):**

1. **Abre tu página** `index.html` en el navegador
2. Haz clic en **"🎥 Iniciar Mi Transmisión en Vivo"**
3. Acepta los permisos de cámara y micrófono
4. **Aparecerá un recuadro azul** con:
   - Un enlace para compartir
   - Un botón "📋 Copiar"
   - Tu ID de sala
5. **Copia el enlace** y envíalo por WhatsApp, email, etc.
6. Los espectadores abren ese enlace y te ven en vivo
7. Verás el contador de espectadores: "👥 Espectadores: 2"

### **COMO ESPECTADOR (El que ve):**

1. **Recibe el enlace** del transmisor
2. Ábrelo en tu navegador
3. **Automáticamente** verás la transmisión en vivo
4. ¡Listo! Ves al transmisor y lo escuchas

---

## 📋 Ejemplo de uso:

**Transmisor:**
```
1. Abres index.html
2. Click en "Iniciar Mi Transmisión en Vivo"
3. Te sale: https://tu-pagina.com/?room=abc123xyz
4. Copias y envías ese enlace
```

**Espectador:**
```
1. Recibe: https://tu-pagina.com/?room=abc123xyz
2. Lo abre en Chrome/Firefox/Safari
3. Ve tu transmisión automáticamente
```

---

## ⚠️ IMPORTANTE:

### **Requisitos:**
- ✅ Debes usar **HTTPS** (si subes a un servidor)
- ✅ O abrir desde tu computadora local funciona
- ✅ Funciona en Chrome, Firefox, Edge, Safari
- ✅ El transmisor y los espectadores necesitan internet

### **Limitaciones:**
- 🔴 Usa conexión **peer-to-peer** (sin servidor central)
- 🔴 Funciona mejor con **1-5 espectadores** simultáneos
- 🔴 Con más espectadores puede ralentizarse (es gratis pero limitado)
- 🔴 Si cierras la página, la transmisión se detiene

### **Para más espectadores:**
Si necesitas transmitir a **muchas personas** (10+), considera:
- YouTube Live (gratis, ilimitados espectadores)
- Twitch
- Facebook Live

---

## 🔧 Tecnología usada:

- **WebRTC** - Transmisión video/audio en tiempo real
- **PeerJS** - Simplifica WebRTC (usa servidores STUN de Google)
- **Conexión P2P** - Los espectadores se conectan directamente a ti

---

## 🎯 Características:

✅ Transmisión en vivo de video y audio
✅ Enlace único para compartir
✅ Contador de espectadores en tiempo real
✅ Calidad HD (720p)
✅ Sin necesidad de cuenta o registro
✅ Funciona en la misma red o por internet
✅ Los canales de YouTube siguen funcionando

---

## 🆘 Solución de problemas:

**"No puedo conectarme"**
- Verifica que ambos tengan internet
- Asegúrate de copiar el enlace completo
- Prueba en otro navegador

**"No veo al transmisor"**
- El transmisor debe tener su transmisión activa
- Verifica que copiaste el enlace correcto
- Recarga la página

**"Se ve lento o se congela"**
- Conexión a internet lenta
- Muchos espectadores conectados
- Cierra otras aplicaciones que usen internet

---

## 📱 Funciona en móviles:

✅ Android: Chrome, Firefox
✅ iOS: Safari (iOS 11+)

---

¡Disfruta transmitiendo en vivo! 🎉📺

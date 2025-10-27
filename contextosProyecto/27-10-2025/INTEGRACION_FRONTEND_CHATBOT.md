# 🎨 INTEGRACIÓN FRONTEND - PASO A PASO

## 📋 GUÍA COMPLETA PARA INTEGRAR EL CHATBOT EN TU FRONTEND

---

## 🚀 OPCIÓN 1: React/Next.js (Recomendado)

### Paso 1: Copiar el Componente

```bash
# Copiar el componente de ejemplo a tu proyecto
cp EJEMPLO_CHATBOT_FRONTEND.tsx src/components/ChatbotWidget.tsx
```

### Paso 2: Instalar Dependencias

```bash
npm install axios
# o
yarn add axios
```

### Paso 3: Configurar el Layout Principal

```tsx
// app/layout.tsx o pages/_app.tsx

import ChatbotWidget from '@/components/ChatbotWidget';
import { useAuth } from '@/hooks/useAuth'; // Tu hook de autenticación

export default function RootLayout({ children }) {
  const { user, isAuthenticated } = useAuth();
  
  return (
    <html lang="es">
      <body>
        {children}
        
        {/* Mostrar chatbot solo para usuarios autenticados */}
        {isAuthenticated && user && (
          <ChatbotWidget 
            userRole={user.role} // 'admin', 'employee', 'manager'
            apiBaseUrl={process.env.NEXT_PUBLIC_API_URL}
          />
        )}
      </body>
    </html>
  );
}
```

### Paso 4: Configurar Variables de Entorno

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Paso 5: ¡Listo! 🎉

Reinicia tu servidor de desarrollo:
```bash
npm run dev
# o
yarn dev
```

El botón flotante del chatbot aparecerá en la esquina inferior derecha.

---

## 🎨 OPCIÓN 2: Personalizar Estilos

### Con Tailwind CSS (Ya incluido en el componente)

El componente ya viene con estilos de Tailwind. Solo asegúrate de tener Tailwind configurado:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Con CSS Modules

Si prefieres CSS Modules, crea `ChatbotWidget.module.css`:

```css
.chatButton {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  background: linear-gradient(to right, #3b82f6, #9333ea);
  color: white;
  border-radius: 9999px;
  padding: 1rem;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s;
  z-index: 50;
}

.chatButton:hover {
  transform: scale(1.1);
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.4);
}

.chatWidget {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 24rem;
  height: 600px;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  z-index: 50;
}

/* ... resto de estilos ... */
```

---

## 📱 OPCIÓN 3: Posicionamiento Alternativo

### A. Panel Lateral (Sidebar)

```tsx
// En lugar de flotante, como sidebar
<div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl">
  <ChatbotWidget userRole={user.role} />
</div>
```

### B. Modal Fullscreen (Mobile-friendly)

```tsx
// Para móviles, ocupar toda la pantalla
<div className="fixed inset-0 z-50 md:inset-auto md:bottom-6 md:right-6">
  <ChatbotWidget userRole={user.role} />
</div>
```

### C. Página Dedicada

```tsx
// pages/assistant.tsx
import ChatbotWidget from '@/components/ChatbotWidget';

export default function AssistantPage() {
  return (
    <div className="container mx-auto p-4">
      <h1>Asistente Virtual</h1>
      <ChatbotWidget userRole={user.role} />
    </div>
  );
}
```

---

## 🔌 OPCIÓN 4: Vanilla JavaScript / jQuery

### HTML

```html
<!DOCTYPE html>
<html>
<head>
  <title>Sistema con Chatbot</title>
  <link rel="stylesheet" href="chatbot.css">
</head>
<body>
  <!-- Botón flotante -->
  <button id="chatbot-button" class="chatbot-button">
    💬
  </button>

  <!-- Widget de chat (oculto inicialmente) -->
  <div id="chatbot-widget" class="chatbot-widget hidden">
    <div class="chatbot-header">
      <h3>Asistente Virtual</h3>
      <button id="close-chatbot">✕</button>
    </div>
    
    <div id="chatbot-messages" class="chatbot-messages">
      <!-- Mensajes aparecerán aquí -->
    </div>
    
    <div class="chatbot-input">
      <input type="text" id="chatbot-input" placeholder="Escribe tu pregunta...">
      <button id="send-message">📤</button>
    </div>
  </div>

  <script src="chatbot.js"></script>
</body>
</html>
```

### JavaScript

```javascript
// chatbot.js

const API_URL = 'http://localhost:8000/api';
let conversationId = null;
let token = localStorage.getItem('authToken');

// Toggle chatbot
document.getElementById('chatbot-button').addEventListener('click', () => {
  document.getElementById('chatbot-widget').classList.toggle('hidden');
});

document.getElementById('close-chatbot').addEventListener('click', () => {
  document.getElementById('chatbot-widget').classList.add('hidden');
});

// Enviar mensaje
document.getElementById('send-message').addEventListener('click', sendMessage);
document.getElementById('chatbot-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

async function sendMessage() {
  const input = document.getElementById('chatbot-input');
  const message = input.value.trim();
  
  if (!message) return;
  
  // Agregar mensaje del usuario
  addMessage('user', message);
  input.value = '';
  
  // Llamar a la API
  try {
    const response = await fetch(`${API_URL}/assistant/chat/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: message,
        conversation_id: conversationId
      })
    });
    
    const data = await response.json();
    conversationId = data.conversation_id;
    
    // Agregar respuesta del asistente
    addMessage('assistant', data.message.content, data.message.suggested_actions);
    
  } catch (error) {
    console.error('Error:', error);
    addMessage('assistant', 'Lo siento, hubo un error. Intenta nuevamente.');
  }
}

function addMessage(role, content, actions = []) {
  const messagesDiv = document.getElementById('chatbot-messages');
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `message message-${role}`;
  
  const contentDiv = document.createElement('p');
  contentDiv.textContent = content;
  messageDiv.appendChild(contentDiv);
  
  // Agregar acciones si existen
  if (actions && actions.length > 0) {
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'message-actions';
    
    actions.forEach(action => {
      const link = document.createElement('a');
      link.href = action.url;
      link.textContent = action.label;
      link.className = 'action-button';
      actionsDiv.appendChild(link);
    });
    
    messageDiv.appendChild(actionsDiv);
  }
  
  messagesDiv.appendChild(messageDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
```

### CSS

```css
/* chatbot.css */

.chatbot-button {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(to right, #3b82f6, #9333ea);
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s;
  z-index: 1000;
}

.chatbot-button:hover {
  transform: scale(1.1);
}

.chatbot-widget {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 400px;
  height: 600px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.chatbot-widget.hidden {
  display: none;
}

.chatbot-header {
  background: linear-gradient(to right, #3b82f6, #9333ea);
  color: white;
  padding: 16px;
  border-radius: 16px 16px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chatbot-header h3 {
  margin: 0;
  font-size: 18px;
}

#close-chatbot {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
}

.chatbot-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.message {
  margin-bottom: 12px;
  padding: 12px;
  border-radius: 12px;
  max-width: 80%;
}

.message-user {
  background: linear-gradient(to right, #3b82f6, #9333ea);
  color: white;
  margin-left: auto;
}

.message-assistant {
  background: #f3f4f6;
  color: #1f2937;
}

.message-actions {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-button {
  background: white;
  color: #3b82f6;
  padding: 8px 12px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 14px;
  display: block;
  transition: background 0.3s;
}

.action-button:hover {
  background: #dbeafe;
}

.chatbot-input {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 8px;
}

#chatbot-input {
  flex: 1;
  border: 1px solid #d1d5db;
  border-radius: 24px;
  padding: 8px 16px;
  font-size: 14px;
}

#send-message {
  background: linear-gradient(to right, #3b82f6, #9333ea);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  font-size: 18px;
}
```

---

## 🎯 OPCIÓN 5: Vue.js

### ChatbotWidget.vue

```vue
<template>
  <div>
    <!-- Botón flotante -->
    <button
      v-if="!isOpen"
      @click="isOpen = true"
      class="chatbot-button"
    >
      💬
    </button>

    <!-- Widget de chat -->
    <div v-if="isOpen" class="chatbot-widget">
      <div class="chatbot-header">
        <h3>Asistente Virtual</h3>
        <span class="role-badge">{{ userRole }}</span>
        <button @click="isOpen = false">✕</button>
      </div>

      <div class="chatbot-messages" ref="messagesContainer">
        <div
          v-for="msg in messages"
          :key="msg.id"
          :class="['message', `message-${msg.role}`]"
        >
          <p>{{ msg.content }}</p>

          <!-- Acciones sugeridas -->
          <div v-if="msg.suggested_actions" class="actions">
            <a
              v-for="(action, idx) in msg.suggested_actions"
              :key="idx"
              :href="action.url"
              class="action-button"
            >
              {{ action.label }}
            </a>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="message message-assistant">
          <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <div class="chatbot-input">
        <input
          v-model="inputValue"
          @keyup.enter="sendMessage"
          placeholder="Escribe tu pregunta..."
          :disabled="isLoading"
        />
        <button @click="sendMessage" :disabled="isLoading">
          📤
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ChatbotWidget',
  props: {
    userRole: {
      type: String,
      required: true
    },
    apiBaseUrl: {
      type: String,
      default: 'http://localhost:8000/api'
    }
  },
  data() {
    return {
      isOpen: false,
      messages: [],
      inputValue: '',
      isLoading: false,
      conversationId: null
    };
  },
  methods: {
    async sendMessage() {
      if (!this.inputValue.trim() || this.isLoading) return;

      // Agregar mensaje del usuario
      this.messages.push({
        id: Date.now(),
        role: 'user',
        content: this.inputValue
      });

      const message = this.inputValue;
      this.inputValue = '';
      this.isLoading = true;

      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.post(
          `${this.apiBaseUrl}/assistant/chat/`,
          {
            message,
            conversation_id: this.conversationId
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        this.conversationId = response.data.conversation_id;
        this.messages.push(response.data.message);
      } catch (error) {
        console.error('Error:', error);
        this.messages.push({
          id: Date.now(),
          role: 'assistant',
          content: 'Lo siento, hubo un error. Intenta nuevamente.'
        });
      } finally {
        this.isLoading = false;
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      container.scrollTop = container.scrollHeight;
    }
  }
};
</script>

<style scoped>
/* Mismo CSS que en el ejemplo de Vanilla JS */
</style>
```

---

## 📱 RESPONSIVE DESIGN

### Mobile-First Approach

```css
/* Estilos base para móvil */
.chatbot-widget {
  position: fixed;
  bottom: 0;
  right: 0;
  left: 0;
  height: 100vh;
  width: 100%;
  border-radius: 0;
}

/* Tablet y Desktop */
@media (min-width: 768px) {
  .chatbot-widget {
    bottom: 24px;
    right: 24px;
    left: auto;
    height: 600px;
    width: 400px;
    border-radius: 16px;
  }
}
```

---

## 🎨 TEMAS Y PERSONALIZACIÓN

### Tema Oscuro

```css
.chatbot-widget.dark-theme {
  background: #1f2937;
  color: white;
}

.chatbot-widget.dark-theme .message-assistant {
  background: #374151;
  color: white;
}

.chatbot-widget.dark-theme .chatbot-input input {
  background: #374151;
  color: white;
  border-color: #4b5563;
}
```

### Personalización de Colores

```typescript
// En el componente React
interface ChatbotWidgetProps {
  userRole: string;
  apiBaseUrl?: string;
  theme?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

// Uso:
<ChatbotWidget 
  userRole="admin"
  theme={{
    primary: '#3b82f6',
    secondary: '#9333ea',
    accent: '#10b981'
  }}
/>
```

---

## ✅ CHECKLIST DE INTEGRACIÓN

- [ ] Componente copiado a src/components/
- [ ] Dependencias instaladas (axios)
- [ ] Variables de entorno configuradas
- [ ] Componente agregado al layout
- [ ] Token JWT configurado
- [ ] Estilos aplicados correctamente
- [ ] Probado en navegador
- [ ] Funciona el envío de mensajes
- [ ] Respuestas se muestran correctamente
- [ ] Enlaces son clickeables
- [ ] Responsive en móvil
- [ ] Probado con diferentes roles (admin/cajero)
- [ ] Sistema de feedback funciona
- [ ] Sin errores en consola

---

## 🐛 TROUBLESHOOTING

### Error: "Network Error"
```
Causa: Backend no está corriendo o URL incorrecta
Solución: 
1. Verificar que Django esté corriendo (python manage.py runserver)
2. Confirmar URL en .env.local
3. Verificar CORS en Django settings
```

### Error: "401 Unauthorized"
```
Causa: Token JWT no válido o expirado
Solución:
1. Hacer login nuevamente
2. Verificar que el token se guarde en localStorage
3. Confirmar que el header Authorization esté correcto
```

### Mensajes no se renderizan
```
Causa: Estado no se actualiza correctamente
Solución:
1. Verificar que useState esté funcionando
2. Usar console.log para debug
3. Confirmar que la respuesta de la API tenga el formato correcto
```

### Estilos no se aplican
```
Causa: Tailwind no configurado o CSS no importado
Solución:
1. Verificar tailwind.config.js
2. Importar los estilos CSS
3. Confirmar que las clases estén correctas
```

---

## 🎉 ¡LISTO!

Una vez completados estos pasos, tendrás el chatbot completamente funcional en tu frontend.

**Tiempo estimado total:** 2-3 horas

**Dificultad:** Media

**Resultado:** Sistema de chatbot inteligente completamente funcional

---

**📅 Fecha:** 22 de Octubre, 2025  
**✅ Estado:** Guía Completa  
**🎯 Objetivo:** Frontend 100% Funcional

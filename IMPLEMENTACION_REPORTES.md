# Sistema de Reportes Implementado

## 📋 Resumen

Se ha implementado un sistema completo de generación de reportes con dos modalidades:
1. **Reportes Dinámicos con IA**: Generación mediante prompts de texto o audio
2. **Reportes Manuales**: Generación mediante filtros tradicionales

---

## 🎯 Características Implementadas

### ✅ Reportes Dinámicos con IA

- **Input por texto**: Campo de texto para describir el reporte deseado
- **Input por voz**: Reconocimiento de voz en español usando Web Speech API
- **Vista previa**: Visualización de resultados antes de descargar
- **Exportación**: Descarga en formato PDF o Excel
- **IA integrada**: El backend interpreta el prompt y genera SQL automáticamente

**Ejemplo de uso:**
```
"Muéstrame las ventas del último mes por categoría"
"Dame un reporte de los 10 productos más vendidos"
"Necesito ver el inventario con stock bajo"
```

### ✅ Reportes Manuales

- **Tipos de reportes disponibles:**
  - Ventas
  - Productos
  - Inventario
  - Categorías
  - Facturas
  - Empleados
  - Clientes

- **Filtros disponibles:**
  - **Temporales**: Año, mes, trimestre, rango de fechas
  - **Por categoría**: Para productos e inventario
  - **Por stock**: Mínimo y máximo
  - **Por estado**: Para ventas y facturas
  
- **Vista previa**: Tabla con resultados antes de descargar
- **Exportación**: PDF o Excel

---

## 📁 Archivos Creados/Modificados

### Frontend

#### 1. Servicio de Reportes
**Archivo**: `frontend/src/services/reportService.ts`

**Funciones principales:**
- `generateDynamicReport()`: Genera reporte con IA (descarga directa)
- `generateDynamicReportWithAudio()`: Genera reporte desde audio
- `previewDynamicReport()`: Vista previa de reporte dinámico
- `previewManualReport()`: Vista previa de reporte manual
- `generateManualReport()`: Genera reporte manual (descarga)
- `getReportHistory()`: Historial de reportes generados
- `getReportSuggestions()`: Sugerencias de reportes

#### 2. Página de Reportes
**Archivo**: `frontend/src/pages/admin/ReportsPage.tsx`

**Componentes:**
- `ReportsPage`: Componente principal con tabs de navegación
- `DynamicReportsTab`: Tab de reportes con IA
- `ManualReportsTab`: Tab de reportes manuales

**Características destacadas:**
- Sistema de tabs para cambiar entre dinámicos y manuales
- Integración con Web Speech API para reconocimiento de voz
- Vista previa de datos antes de descargar
- Selección de formato de exportación (PDF/Excel)
- Manejo de errores y estados de carga

#### 3. Configuración de API
**Archivo**: `frontend/src/config/api.ts`

**Endpoints agregados:**
```typescript
REPORTS: {
  GENERATE: '/reports/generate/',
  PREVIEW: '/reports/preview/',
  HISTORY: '/reports/history/',
  SUGGESTIONS: '/reports/suggestions/',
  MANUAL_PREVIEW: '/reports/manual/preview/',
  MANUAL_GENERATE: '/reports/manual/generate/',
}
```

#### 4. Rutas
**Archivo**: `frontend/src/App.tsx`

**Ruta agregada:**
```tsx
<Route path="/admin/reports" element={
  <ProtectedRoute allowedRoles={['admin', 'gerente']}>
    <AdminNavbar>
      <ReportsPage />
    </AdminNavbar>
  </ProtectedRoute>
} />
```

---

## 🔧 Backend (Ya implementado)

### Endpoints Disponibles

#### Reportes Dinámicos
- `POST /api/reports/generate/`: Generar reporte completo (devuelve archivo)
- `POST /api/reports/preview/`: Vista previa (devuelve JSON)
- `GET /api/reports/history/`: Historial de reportes
- `GET /api/reports/suggestions/`: Sugerencias

#### Reportes Manuales
- `GET /api/reports/manual/preview/`: Vista previa con filtros
- `GET /api/reports/manual/generate/`: Generar y descargar

---

## 🎨 Diseño UI/UX

### Navegación por Tabs
```
┌─────────────────────────────────────┐
│  [Reportes con IA] [Reportes Manuales] │
└─────────────────────────────────────┘
```

### Tab Reportes con IA
```
┌───────────────────────────────────┐
│ Describe el reporte que necesitas │
│ ┌─────────────────────────┐  🎤  │
│ │ Textarea para prompt    │      │
│ └─────────────────────────┘      │
│                                   │
│ [👁️ Vista Previa] Formato: [PDF▼] [⬇️ Descargar] │
└───────────────────────────────────┘

┌───────────────────────────────────┐
│         Vista Previa              │
│  • Tipo de reporte                │
│  • Explicación                    │
│  • Tabla con resultados (10 primeros) │
└───────────────────────────────────┘
```

### Tab Reportes Manuales
```
┌───────────────────────────────────┐
│        Filtros de Reporte         │
│                                   │
│ Tipo: [Ventas▼]  Año: [2025▼]   │
│ Mes: [Todos▼]    Trimestre: [Q1▼]│
│ Fecha Inicio: [____] Fecha Fin: [____] │
│                                   │
│ [Categoría, Stock, Estado...]     │
│                                   │
│ [👁️ Vista Previa] Formato: [PDF▼] [⬇️ Descargar] │
└───────────────────────────────────┘

┌───────────────────────────────────┐
│         Vista Previa              │
│  • Resumen                        │
│  • Filtros aplicados              │
│  • Tabla con resultados           │
└───────────────────────────────────┘
```

---

## 🎤 Reconocimiento de Voz

### Configuración
```typescript
- Idioma: Español (es-ES)
- Modo: No continuo
- Resultados intermedios: Sí
```

### Estados del Micrófono
- **Inactivo**: Botón azul, icono de micrófono
- **Escuchando**: Botón rojo pulsante, grabando
- **Transcribiendo**: Muestra texto en tiempo real

### Manejo de Errores
- `not-allowed`: Permisos de micrófono denegados
- `audio-capture`: No hay micrófono disponible
- `no-speech`: No se detectó audio
- `network`: Error de conexión

---

## 📊 Tipos de Reportes Manuales

### 1. Ventas
**Campos:**
- ID de orden
- Fecha
- Cliente
- Total
- Estado
- Método de pago

**Filtros adicionales:**
- Estado (pendiente, completado, cancelado)

### 2. Productos
**Campos:**
- ID
- Nombre
- SKU
- Precio
- Stock
- Categoría
- Activo

**Filtros adicionales:**
- Categoría
- Stock mínimo/máximo

### 3. Inventario
**Campos:**
- ID
- Nombre
- SKU
- Stock
- Precio unitario
- Valor total
- Categoría
- Nivel de stock

**Filtros adicionales:**
- Categoría
- Stock mínimo/máximo

### 4. Categorías
**Campos:**
- ID
- Nombre
- Descripción
- Total productos
- Stock total
- Activa

### 5. Facturas
**Campos:**
- ID
- Número de factura
- Fecha
- Cliente
- Total
- Estado
- Método de pago

**Filtros adicionales:**
- Estado

### 6. Empleados
**Campos:**
- ID
- Nombre completo
- Email
- Puesto
- Fecha de contratación
- Salario
- Activo

### 7. Clientes
**Campos:**
- ID
- Nombre completo
- Email
- Teléfono
- Fecha de registro
- Total de órdenes
- Total gastado
- Activo

---

## 🚀 Cómo Usar

### Reportes Dinámicos

1. **Por texto:**
   - Ir a Admin → Reportes
   - Seleccionar tab "Reportes con IA"
   - Escribir el reporte deseado
   - Clic en "Vista Previa" para ver resultados
   - Seleccionar formato (PDF/Excel)
   - Clic en "Descargar"

2. **Por voz:**
   - Clic en el botón del micrófono 🎤
   - Permitir acceso al micrófono
   - Hablar el reporte deseado
   - El texto se transcribe automáticamente
   - Seguir los pasos de "Vista Previa" y "Descargar"

### Reportes Manuales

1. Ir a Admin → Reportes
2. Seleccionar tab "Reportes Manuales"
3. Seleccionar tipo de reporte
4. Aplicar filtros deseados:
   - Filtros temporales (año, mes, trimestre, fechas)
   - Filtros específicos (categoría, stock, estado)
5. Clic en "Vista Previa"
6. Revisar resultados
7. Seleccionar formato (PDF/Excel)
8. Clic en "Descargar"

---

## 🔒 Permisos

**Roles con acceso:**
- `admin`
- `gerente`

**Roles sin acceso:**
- `cajero`
- `cliente`

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React + TypeScript**: Framework principal
- **Web Speech API**: Reconocimiento de voz
- **Axios**: Peticiones HTTP
- **Tailwind CSS**: Estilos
- **Lucide React**: Iconos

### Backend (ya existente)
- **Django REST Framework**: API
- **OpenAI GPT**: Interpretación de prompts
- **ReportLab**: Generación de PDF
- **OpenPyXL**: Generación de Excel
- **PostgreSQL**: Base de datos

---

## 📝 Notas Importantes

1. **Reconocimiento de voz**: Solo funciona en navegadores compatibles (Chrome, Edge, Safari)
2. **Permisos de micrófono**: El usuario debe permitir acceso al micrófono
3. **HTTPS requerido**: La API de reconocimiento de voz requiere conexión segura en producción
4. **Límite de resultados**: La vista previa muestra máximo 10 filas, el archivo descargado contiene todos los datos
5. **Formatos soportados**: PDF y Excel (XLSX)

---

## 🐛 Solución de Problemas

### El micrófono no funciona
- Verificar permisos del navegador
- Verificar que el navegador soporte Web Speech API
- Verificar conexión HTTPS (en producción)

### Error al generar reporte
- Verificar que el prompt sea claro y específico
- Verificar que los filtros sean válidos
- Revisar logs del backend

### No se descarga el archivo
- Verificar que el navegador no bloquee descargas
- Verificar que el backend esté funcionando
- Revisar errores en la consola

---

## 🔄 Próximas Mejoras (Opcionales)

- [ ] Gráficos en reportes PDF
- [ ] Programación de reportes automáticos
- [ ] Envío de reportes por email
- [ ] Historial de reportes con búsqueda
- [ ] Plantillas de reportes personalizadas
- [ ] Exportación a CSV
- [ ] Compartir reportes con otros usuarios

---

## 📚 Referencias

- [Web Speech API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [ReportLab Documentation](https://www.reportlab.com/docs/reportlab-userguide.pdf)
- [OpenPyXL Documentation](https://openpyxl.readthedocs.io/)

---

**Fecha de implementación**: 4 de Noviembre, 2025
**Desarrollado para**: Sistema de E-commerce con IA

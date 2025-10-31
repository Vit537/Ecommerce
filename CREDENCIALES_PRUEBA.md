# 👥 CREDENCIALES DE ACCESO - Datos de Prueba

## 🔐 Usuarios del Sistema

### 👑 Super Administrador
```
Email:    superadmin@boutique.com
Password: admin123
Rol:      Super Administrador (acceso total)
```
**Uso:** Desarrollo y configuración del sistema

---

### 🛡️ Administrador
```
Email:    admin@boutique.com
Password: admin123
Rol:      Administrador
```
**Permisos:** Acceso completo a todas las funcionalidades del negocio

---

### 💼 Gerente
```
Email:    gerente@boutique.com
Password: gerente123
Rol:      Gerente
```
**Permisos:** 
- Gestión de productos e inventario
- Ver y gestionar ventas
- Ver reportes avanzados
- Gestión de empleados
- No puede gestionar roles ni configuración crítica

---

### 💰 Cajero / Vendedor
```
Email:    cajero@boutique.com
Password: cajero123
Rol:      Cajero
```
**Permisos:**
- Ver productos
- Registrar ventas
- Procesar pedidos
- Gestionar inventario básico
- Ver reportes básicos

---

### 🛒 Clientes (E-commerce)

#### Cliente 1
```
Email:    cliente1@email.com
Password: cliente123
Rol:      Cliente
```

#### Cliente 2
```
Email:    cliente2@email.com
Password: cliente123
Rol:      Cliente
```

#### Cliente 3
```
Email:    cliente3@email.com
Password: cliente123
Rol:      Cliente
```

**Permisos:**
- Ver catálogo de productos
- Hacer pedidos
- Ver su historial de compras
- Ver sus facturas

---

## 🔗 URLs de Acceso

### Admin Django
```
https://TU-URL.run.app/admin/
```
Usa las credenciales de `superadmin@boutique.com`

### API Endpoints
```
Base URL: https://TU-URL.run.app/api/

Productos:   /api/products/
Categorías:  /api/categories/
Órdenes:     /api/orders/
Usuarios:    /api/auth/users/
Carrito:     /api/cart/
Reportes:    /api/reports/
ML/IA:       /api/ml/
Asistente:   /api/assistant/
```

---

## 📊 Datos del Sistema

### Google Cloud SQL
```
Connection Name: big-axiom-474503-m5:us-central1:myproject-db
Database:        ecommerce
Host:            /cloudsql/big-axiom-474503-m5:us-central1:myproject-db
User:            ecommerce-user
Password:        ecommerce123secure
```

### Google Cloud Project
```
Project ID:      big-axiom-474503-m5
Service Account: ecommerce-github-actions@big-axiom-474503-m5.iam.gserviceaccount.com
Registry:        ecommerce-registry
```

---

## 🧪 Pruebas Sugeridas

### 1. Prueba de Autenticación
```bash
# Login como administrador
POST https://TU-URL.run.app/api/auth/login/
{
  "email": "admin@boutique.com",
  "password": "admin123"
}
```

### 2. Prueba de Productos
```bash
# Listar productos
GET https://TU-URL.run.app/api/products/

# Ver producto específico
GET https://TU-URL.run.app/api/products/1/
```

### 3. Prueba de Órdenes
```bash
# Listar órdenes (requiere autenticación)
GET https://TU-URL.run.app/api/orders/
Headers: Authorization: Bearer {token}
```

### 4. Prueba del Asistente IA
```bash
# Chat con el asistente
POST https://TU-URL.run.app/api/assistant/chat/
{
  "message": "¿Qué productos tienen en stock?",
  "conversation_id": null
}
```

---

## 🎯 Escenarios de Prueba

### Escenario 1: Flujo de Compra Completo
1. Login como `cliente1@email.com`
2. Buscar productos
3. Agregar al carrito
4. Crear orden
5. Procesar pago
6. Ver factura

### Escenario 2: Gestión de Inventario
1. Login como `cajero@boutique.com`
2. Ver listado de productos
3. Actualizar stock
4. Registrar venta en tienda física

### Escenario 3: Administración
1. Login como `admin@boutique.com`
2. Crear nuevo producto
3. Asignar permisos a usuario
4. Generar reportes
5. Ver estadísticas del dashboard

### Escenario 4: Análisis de Datos
1. Login como `gerente@boutique.com`
2. Ver reportes avanzados
3. Consultar predicciones ML
4. Exportar datos

---

## ⚠️ NOTAS IMPORTANTES

### Seguridad
- ⚠️ Estas son credenciales de PRUEBA
- ⚠️ NO uses estas contraseñas en producción
- ⚠️ Cambia todas las contraseñas antes de lanzar
- ⚠️ Desactiva el endpoint `/api/temp-load-data/` después de cargar datos

### Datos de Prueba
- Los datos generados son ficticios
- Las órdenes tienen fechas aleatorias
- Los precios son de ejemplo
- El stock es aleatorio

### Próximos Pasos
1. ✅ Cargar datos de prueba
2. ✅ Verificar que funciona todo
3. 🔄 Ajustar configuraciones según necesites
4. 🔄 Cargar datos reales cuando estés listo
5. 🔄 Cambiar todas las credenciales
6. 🚀 Lanzar a producción

---

## 📞 Endpoints Útiles

### Health Check
```
GET https://TU-URL.run.app/healthcheck/
```

### Estadísticas del Admin
```
GET https://TU-URL.run.app/api/admin/dashboard-stats/
```
Requiere autenticación como admin

### Métodos de Pago
```
GET https://TU-URL.run.app/api/orders/payment-methods/
```

---

## 💡 Tips

1. **Usa Postman o Thunder Client** para probar los endpoints más fácilmente

2. **Guarda las respuestas de autenticación** para usar los tokens en otras peticiones

3. **Revisa los logs en Google Cloud** si algo falla:
   ```
   Cloud Console → Cloud Run → Tu Servicio → Logs
   ```

4. **Backup de datos** antes de hacer cambios importantes:
   ```bash
   gcloud sql export sql myproject-db gs://BUCKET/backup.sql \
     --database=ecommerce
   ```

---

**Última actualización:** 27 de octubre, 2025
**Estado:** ✅ Listo para usar

---

🎉 **¡Disfruta probando tu e-commerce!**

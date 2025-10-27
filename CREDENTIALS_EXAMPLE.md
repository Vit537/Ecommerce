# 🔐 Configuración de Google Cloud - EJEMPLO

⚠️ **IMPORTANTE**: Este es un archivo de EJEMPLO. Los valores reales deben configurarse como GitHub Secrets.

## Datos para GitHub Secrets

Crea estos secrets en tu repositorio de GitHub:
**Settings → Secrets and variables → Actions → New repository secret**

### Secrets Requeridos:

```
GCP_PROJECT_ID
Valor: tu-project-id

GCP_SA_KEY
Valor: {
  "type": "service_account",
  "project_id": "tu-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "tu-service-account@tu-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "...",
  "universe_domain": "googleapis.com"
}

DB_NAME
Valor: tu_database_name

DB_USER
Valor: tu_database_user

DB_PASSWORD
Valor: tu_database_password

DJANGO_SECRET_KEY
Valor: tu-django-secret-key-generada

CLOUD_SQL_CONNECTION_NAME
Valor: project-id:region:instance-name

GROQ_API_KEY (opcional)
Valor: tu-groq-api-key

OPENAI_API_KEY (opcional)
Valor: tu-openai-api-key
```

## Información del Artifact Registry

```
Artifact Registry: tu-registry-name
Región: us-central1 (o tu región preferida)
```

## ⚠️ Seguridad

- ❌ NUNCA subas este archivo con valores reales a GitHub
- ✅ Usa GitHub Secrets para almacenar credenciales
- ✅ Mantén las credenciales en archivos locales ignorados por Git
- ✅ Usa diferentes credenciales para desarrollo y producción

## 📚 Referencias

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Google Cloud Service Accounts](https://cloud.google.com/iam/docs/service-accounts)
- [Cloud SQL Connection](https://cloud.google.com/sql/docs/mysql/connect-run)

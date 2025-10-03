Todo cambio al API de Comercio Internacional debe seguir este proceso obligatorio para garantizar calidad, estabilidad y compliance regulatorio.

## Pipeline de CI/CD

### 1. Requisitos previos a la implementación
- [ ] Código enviado a la rama de características
- [ ] Todas las pruebas unitarias superadas localmente
- [ ] Sin conflictos de fusión con la rama principal
- [ ] Variables de entorno documentadas en .env.example

### 2. Triggers CI/CD automatizados
```yaml
# Se desencadena automáticamente en:
- Envío a cualquier rama
- Creación de solicitud de extracción
- Fusión con la rama principal

# Etapas del proceso:
1. Linting del código (ESLint + Prettier)
2. Pruebas unitarias (Jest)
3. Pruebas de integración 
4. Escaneo de seguridad (npm audit)
5. Compilación de la imagen Docker
6. Implementación en el entorno de staging
````


## Proceso de revisión de control de calidad (obligatorio)

### Responsabilidades del equipo de control de calidad

- **Responsable de control de calidad:** Ginette V. (ginettevv@sitiocomerciointernacional.com)
- **Subdirector:** Santos R. (santos@sitiocomerciointernacional.com)

 ### Criterios de aprobación de control de calidad

1. **Pruebas funcionales:** la función funciona según lo especificado en el ticket de Jira.
2. **Pruebas de regresión:** la funcionalidad existente no se ve afectada.
3. **Validación del contrato API:** los formatos de respuesta coinciden con la documentación.
4. **Pruebas de rendimiento:** no hay degradación en los puntos finales clave.


## Procedimiento de derivación de emergencia

**Solo para problemas críticos de producción que afecten a los ingresos o la seguridad**

**Requisitos:**

- Aprobación del director técnico a través de Slack
- Revisión de control de calidad posterior a la implementación en un plazo de 24 horas
- Análisis posterior al incidente en un plazo de 48 horas

**Uso reciente:** 2 veces en 2024 (problema de conexión con la base de datos el 15 de enero, parche de seguridad el 3 de marzo)


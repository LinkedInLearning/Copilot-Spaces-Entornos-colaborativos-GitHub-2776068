
Reunión Semanal Producto & Desarrollo

Fecha:  Septiembre 15:00
Facilitador: Roberto M.(Head of Product)  

Participantes:
Roberto M. (Head of Product) roberto@productoejemplo.com
Sofia G. (DevOps Lead) 
Carmen R. (QA Lead)
Carlos C. (Backend Lead)
Patricia V. (Product Manager) patricia@productoejemplo.com

---

Tema 1: Review del proceso de deployment actual

Contexto: Discusión sobre el proceso QA → Producción directa

Roberto: "Hemos tenido algunos incidentes donde features técnicamente correctas no se alineaban con objetivos de negocio. Caso ejemplo: la optimización de performance del endpoint de suppliers que cambió la estructura de respuesta sin avisar."

Carmen (QA): "Nosotros validamos que funcione técnicamente, pero no evaluamos impacto de negocio. Eso no es nuestro expertise."

Patricia: "Exacto. Necesitamos un checkpoint de producto antes de producción."

DECISIÓN TOMADA:
Nuevo paso obligatorio: Todo cambio aprobado por QA debe pasar por revisión del equipo de Producto antes de deployment a producción.

Detalles del nuevo proceso:
Responsable: Patricia V (Product Manager) como primary reviewer
Backup: Roberto M (Head of Product)
Timeline: 1-2 días business después de QA approval
Criterios de evaluación:
  Alineación con roadmap de producto
  Impacto en experiencia de usuario
  Consistencia con objetivos de negocio trimestre
  Consideraciones de timing de mercado

Roberto: "No queremos frenar development, pero necesitamos asegurar que cada release agregue valor real al negocio."

---

Tema 2: Casos que requieren revisión de Producto

Cambios que SÍ requieren Product approval:
Nuevos endpoints o funcionalidades
Cambios en estructura de response de APIs públicas
Modificaciones que afecten performance visible al usuario
Features que impacten pricing o billing logic

Cambios que NO requieren Product approval:
Bug fixes que no cambian comportamiento
Optimizaciones internas de código
Security patches
Dependency updates sin functional changes

Patricia: "Si no estás seguro, mejor preguntar. Prefiero 5 consultas innecesarias que 1 cambio problemático en producción."


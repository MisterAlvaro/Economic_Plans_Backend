# Análisis del Proyecto: Economic Plans Backend

## 1. Problemática

El sistema **Economic Plans Backend** fue desarrollado para resolver las siguientes problemáticas en la gestión de planes económicos:

### Problemas Identificados:
1. **Gestión Manual de Planes Económicos**: Los planes económicos se gestionaban manualmente en archivos Excel, lo que generaba:
   - Dificultad para mantener control de versiones
   - Falta de trazabilidad de cambios
   - Riesgo de pérdida de datos
   - Dificultad para colaborar entre múltiples usuarios

2. **Falta de Validación Automática**: 
   - No existía validación automática de fórmulas y cálculos
   - Errores en sumas y totales no se detectaban hasta la revisión manual
   - Inconsistencias en los datos entre diferentes hojas

3. **Ausencia de Control de Acceso**:
   - No había sistema de autenticación y autorización
   - Falta de auditoría de quién realizó cambios
   - Sin control de roles (admin, economist, reviewer)

4. **Procesamiento Ineficiente de Datos**:
   - Extracción manual de indicadores económicos desde Excel
   - No había forma de consultar y analizar datos históricos
   - Dificultad para generar reportes consolidados

5. **Falta de Integridad de Datos**:
   - No había validación de estructura de archivos Excel
   - Sin verificación de fórmulas y dependencias entre celdas
   - Riesgo de corrupción de datos

---

## 2. Requisitos Funcionales

### 2.1 Gestión de Autenticación y Autorización
- **RF-001**: El sistema debe permitir el registro de usuarios con email, nombre completo, contraseña, división y rol
- **RF-002**: El sistema debe autenticar usuarios mediante email y contraseña
- **RF-003**: El sistema debe generar tokens JWT con expiración de 8 horas y refresh tokens de 7 días
- **RF-004**: El sistema debe almacenar tokens en cookies HTTP-only para mayor seguridad
- **RF-005**: El sistema debe permitir la renovación de tokens mediante refresh token
- **RF-006**: El sistema debe permitir el logout invalidando tokens mediante blacklist
- **RF-007**: El sistema debe proteger rutas mediante middleware de autenticación JWT

### 2.2 Gestión de Usuarios
- **RF-008**: El sistema debe permitir crear usuarios con roles: admin, economist, reviewer
- **RF-009**: El sistema debe listar todos los usuarios registrados
- **RF-010**: El sistema debe obtener información de un usuario por ID
- **RF-011**: El sistema debe asociar usuarios a divisiones
- **RF-012**: El sistema debe permitir activar/desactivar usuarios

### 2.3 Gestión de Divisiones
- **RF-013**: El sistema debe permitir crear divisiones con nombre y código único
- **RF-014**: El sistema debe listar todas las divisiones
- **RF-015**: El sistema debe inicializar divisiones por defecto al iniciar (Oficina Central, División Occidente, División Matanzas, División Nuevitas, División Santiago de Cuba)

### 2.4 Gestión de Planes Económicos
- **RF-016**: El sistema debe permitir crear planes económicos asociados a una división y año
- **RF-017**: El sistema debe validar que no existan planes duplicados para la misma división y año
- **RF-018**: El sistema debe permitir listar todos los planes económicos
- **RF-019**: El sistema debe permitir obtener un plan por ID con todas sus relaciones
- **RF-020**: El sistema debe gestionar estados de planes: draft, reviewed, approved
- **RF-021**: El sistema debe permitir actualizar el estado de un plan
- **RF-022**: El sistema debe registrar quién creó, revisó y aprobó cada plan
- **RF-023**: El sistema debe permitir eliminar planes económicos
- **RF-024**: El sistema debe mantener control de versiones de planes

### 2.5 Procesamiento de Archivos Excel
- **RF-025**: El sistema debe permitir subir archivos Excel (.xlsx) a un plan económico
- **RF-026**: El sistema debe validar que el archivo Excel contenga las hojas requeridas: "Resumen", "IndEco", "Est. Costo"
- **RF-027**: El sistema debe validar que cada hoja contenga los headers esperados en las primeras 10 filas
- **RF-028**: El sistema debe validar que los valores en columnas numéricas sean números válidos
- **RF-029**: El sistema debe validar que los valores de "Plan 2025" sean números no negativos
- **RF-030**: El sistema debe validar que la suma de meses (Ene-Dic) coincida con el valor de ∑(Ene-Dic)
- **RF-031**: El sistema debe detectar automáticamente el final de los datos (filas de firmas, aprobaciones)
- **RF-032**: El sistema debe procesar todas las hojas del archivo Excel
- **RF-033**: El sistema debe actualizar hojas existentes o crear nuevas según corresponda
- **RF-034**: El sistema debe almacenar los datos de cada hoja en formato JSONB en la base de datos

### 2.6 Gestión de Fórmulas
- **RF-035**: El sistema debe extraer automáticamente todas las fórmulas de las celdas del Excel
- **RF-036**: El sistema debe identificar dependencias entre celdas (celdas referenciadas en fórmulas)
- **RF-037**: El sistema debe almacenar fórmulas con su referencia de celda y dependencias
- **RF-038**: El sistema debe permitir listar todas las celdas con fórmulas de una hoja
- **RF-039**: El sistema debe permitir calcular valores de celdas con fórmulas usando formulajs
- **RF-040**: El sistema debe actualizar valores calculados en las hojas

### 2.7 Gestión de Indicadores Económicos
- **RF-041**: El sistema debe extraer automáticamente indicadores económicos de la hoja "Resumen"
- **RF-042**: El sistema debe generar códigos únicos para cada indicador basados en su nombre
- **RF-043**: El sistema debe evitar duplicados de indicadores por código
- **RF-044**: El sistema debe permitir crear indicadores económicos manualmente con nombre, código, unidad, descripción y plantilla de fórmula
- **RF-045**: El sistema debe validar que el código de indicador sea único
- **RF-046**: El sistema debe permitir listar todos los indicadores económicos

### 2.8 Gestión de Hojas de Plan
- **RF-047**: El sistema debe permitir listar todas las hojas asociadas a un plan económico
- **RF-048**: El sistema debe mantener relación entre hojas y planes
- **RF-049**: El sistema debe garantizar que no existan hojas duplicadas con el mismo nombre en un plan

---

## 3. Requisitos No Funcionales

### 3.1 Seguridad
- **RNF-001**: El sistema debe usar hash bcrypt para almacenar contraseñas (nunca en texto plano)
- **RNF-002**: El sistema debe implementar autenticación JWT con tokens firmados
- **RNF-003**: El sistema debe usar cookies HTTP-only para almacenar tokens de acceso
- **RNF-004**: El sistema debe implementar blacklist de tokens revocados
- **RNF-005**: El sistema debe validar tokens en cada petición a rutas protegidas
- **RNF-006**: El sistema debe usar HTTPS en producción (secure flag en cookies)
- **RNF-007**: El sistema debe validar permisos según roles de usuario

### 3.2 Rendimiento
- **RNF-008**: El sistema debe procesar archivos Excel de tamaño razonable (< 10MB)
- **RNF-009**: El sistema debe limpiar archivos temporales después del procesamiento
- **RNF-010**: El sistema debe usar transacciones de base de datos para operaciones críticas
- **RNF-011**: El sistema debe optimizar consultas con relaciones usando TypeORM

### 3.3 Escalabilidad
- **RNF-012**: El sistema debe usar base de datos PostgreSQL para persistencia
- **RNF-013**: El sistema debe usar migraciones de base de datos para versionado del esquema
- **RNF-014**: El sistema debe soportar múltiples usuarios concurrentes
- **RNF-015**: El sistema debe usar JSONB para almacenar datos flexibles de hojas

### 3.4 Mantenibilidad
- **RNF-016**: El sistema debe estar desarrollado en TypeScript con tipado estricto
- **RNF-017**: El sistema debe usar decoradores de TypeORM para definir entidades
- **RNF-018**: El sistema debe seguir arquitectura MVC (Model-View-Controller)
- **RNF-019**: El sistema debe separar lógica de negocio en servicios
- **RNF-020**: El sistema debe usar middleware para validaciones y autenticación

### 3.5 Confiabilidad
- **RNF-021**: El sistema debe manejar errores de forma consistente con mensajes descriptivos
- **RNF-022**: El sistema debe validar datos de entrada antes de procesarlos
- **RNF-023**: El sistema debe limpiar archivos temporales incluso en caso de error
- **RNF-024**: El sistema debe usar transacciones para garantizar integridad de datos
- **RNF-025**: El sistema debe validar existencia de entidades relacionadas antes de crear registros

### 3.6 Usabilidad
- **RNF-026**: El sistema debe proporcionar mensajes de error claros y descriptivos
- **RNF-027**: El sistema debe validar archivos Excel y proporcionar feedback específico sobre errores
- **RNF-028**: El sistema debe soportar CORS para integración con frontend
- **RNF-029**: El sistema debe usar códigos HTTP apropiados (200, 201, 400, 401, 403, 404, 409, 500)

### 3.7 Portabilidad
- **RNF-030**: El sistema debe usar variables de entorno para configuración
- **RNF-031**: El sistema debe funcionar en diferentes sistemas operativos (Windows, Linux, macOS)
- **RNF-032**: El sistema debe usar Node.js como runtime multiplataforma

### 3.8 Compatibilidad
- **RNF-033**: El sistema debe procesar archivos Excel en formato .xlsx
- **RNF-034**: El sistema debe soportar fórmulas de Excel estándar
- **RNF-035**: El sistema debe mantener compatibilidad con estructura de datos existente

---

## 4. Pruebas Realizadas

### 4.1 Pruebas Manuales
El proyecto incluye un archivo `requests.http` con **17 casos de prueba manual** que cubren:

1. **Pruebas de Autenticación**:
   - Creación de usuario (público)
   - Login con email y contraseña
   - Refresh token
   - Logout

2. **Pruebas de Gestión de Usuarios**:
   - Listar usuarios (protegido)
   - Obtener usuario por ID (protegido)

3. **Pruebas de Gestión de Divisiones**:
   - Crear división (protegido)
   - Listar divisiones (protegido)

4. **Pruebas de Planes Económicos**:
   - Crear plan económico (protegido)
   - Listar planes (protegido)
   - Obtener plan por ID (protegido)
   - Actualizar estado del plan (protegido)

5. **Pruebas de Procesamiento de Excel**:
   - Subir archivo Excel a un plan (protegido)

6. **Pruebas de Hojas y Fórmulas**:
   - Listar hojas de un plan (protegido)
   - Listar celdas con fórmulas por hoja (protegido)

7. **Pruebas de Indicadores Económicos**:
   - Listar indicadores (protegido)
   - Crear indicador económico (protegido)

### 4.2 Validaciones Implementadas
El sistema incluye validaciones exhaustivas en el código:

1. **Validación de Excel (`excelValidator.ts`)**:
   - Verificación de existencia de hojas requeridas
   - Validación de headers en las primeras 10 filas
   - Validación de valores numéricos en columnas de datos
   - Validación de valores no negativos en "Plan 2025"
   - Validación de sumas (∑(Ene-Dic) vs suma de meses)
   - Detección automática de fin de datos (filas de firmas)

2. **Validación de Autenticación**:
   - Verificación de tokens JWT
   - Validación de tokens revocados
   - Verificación de credenciales de usuario

3. **Validación de Datos**:
   - Verificación de existencia de entidades relacionadas
   - Validación de duplicados (planes, indicadores)
   - Validación de estados permitidos

### 4.3 Pruebas Automatizadas
**Estado**: No se encontraron pruebas automatizadas implementadas.

- El `package.json` muestra: `"test": "echo \"Error: no test specified\" && exit 1"`
- No se encontraron archivos `.test.ts` o `.spec.ts` en el código fuente
- Se recomienda implementar pruebas unitarias y de integración

### 4.4 Pruebas de Integración
Las pruebas de integración se realizan manualmente mediante:
- Archivo `requests.http` con casos de prueba
- Pruebas end-to-end de flujos completos (crear plan → subir Excel → consultar datos)

---

## 5. Tecnologías Utilizadas

### 5.1 Lenguaje y Runtime
- **TypeScript** (v5.8.3): Lenguaje de programación con tipado estático
- **Node.js**: Runtime de JavaScript para backend
- **ts-node** (v10.9.2): Ejecución directa de TypeScript sin compilación previa

### 5.2 Framework y Librerías Core
- **Express** (v5.1.0): Framework web para Node.js
- **TypeORM** (v0.3.25): ORM para TypeScript/JavaScript con soporte para decoradores
- **reflect-metadata** (v0.2.2): Soporte para metadatos y decoradores

### 5.3 Base de Datos
- **PostgreSQL**: Base de datos relacional
- **pg** (v8.16.3): Driver de PostgreSQL para Node.js

### 5.4 Autenticación y Seguridad
- **jsonwebtoken** (v9.0.2): Implementación de JWT (JSON Web Tokens)
- **bcrypt** (v6.0.0): Algoritmo de hash para contraseñas
- **cookie-parser** (v1.4.7): Middleware para parsear cookies HTTP

### 5.5 Procesamiento de Archivos
- **multer** (v2.0.2): Middleware para manejo de multipart/form-data (subida de archivos)
- **xlsx** (v0.18.5): Librería para leer y escribir archivos Excel (.xlsx)

### 5.6 Procesamiento de Fórmulas
- **formulajs** (v1.0.8): Librería para evaluar fórmulas de Excel
- **formula-parser** (v2.0.1): Parser para fórmulas de Excel

### 5.7 Utilidades
- **cors** (v2.8.5): Middleware para habilitar CORS
- **dotenv** (v17.2.1): Carga de variables de entorno desde archivo .env

### 5.8 Desarrollo
- **nodemon** (v3.1.10): Herramienta para reiniciar automáticamente el servidor durante desarrollo
- **@types/***: Definiciones de tipos TypeScript para librerías JavaScript

### 5.9 Arquitectura y Patrones
- **Arquitectura MVC**: Separación en Controladores, Entidades (Modelos) y Servicios
- **Middleware Pattern**: Para autenticación y validación
- **Repository Pattern**: TypeORM proporciona repositorios para acceso a datos
- **Service Layer**: Lógica de negocio separada en servicios (ExcelProcessor, FormulaCalculator, InitializationService)

### 5.10 Configuración
- **TypeScript Compiler**: Configurado con `strict: true`, decoradores experimentales, y soporte para metadatos
- **TypeORM CLI**: Para generación y ejecución de migraciones
- **PostgreSQL**: Base de datos configurada mediante `ormconfig.json`

---

## Resumen Ejecutivo

El proyecto **Economic Plans Backend** es un sistema backend desarrollado en TypeScript/Node.js que automatiza la gestión de planes económicos, resolviendo problemas de gestión manual en Excel mediante:

- **Autenticación segura** con JWT y roles de usuario
- **Procesamiento automático** de archivos Excel con validaciones exhaustivas
- **Extracción automática** de indicadores económicos y fórmulas
- **Control de versiones** y estados de planes económicos
- **API RESTful** completa para integración con frontend

El sistema está listo para producción pero requiere implementación de pruebas automatizadas para mejorar la confiabilidad y facilitar el mantenimiento futuro.


# EmpleAdminis - Microservicio  ![Nodejs](https://img.shields.io/badge/-NodeJS-darkgreen?style=flat&logo=nodedotjs)

El microservicio Node.js version 18.17.1 de EmpleAdminis está configurado para recibir solicitudes HTTP desde la aplicación Angular. Este microservicio se encarga de manejar las operaciones CRUD hacia una base de datos MySQL, así como de interactuar con la API de Google Drive para el manejo de archivos. También implementa un sistema de autenticación basado en tokens para verificar las solicitudes entrantes.

## Configuración

- **URL Base**: El microservicio está configurado localmente en `http://localhost:8080/`.
- **Base de Datos MySQL**: El archivo SQL para la configuración de la base de datos se encuentra en esta carpeta, en la ruta \backend\database\database.sql.
- **Autenticación con Token**: Se utiliza JSON Web Tokens (JWT) para autenticar las solicitudes a la API.
- **Integración con Google Drive**: Se utiliza la API de Google Drive para enviar y recibir archivos como fotos de empleados y archivos de incapacidad en PDF.
- **Scripts de Automatización**: Se implementa un script de automatización para registrar inasistencias automáticamente a medianoche.

## Dependencias del proyecto

| Nombre                 | Paquete               | Versión  | Descripción                                         |
|------------------------|-----------------------|----------|-----------------------------------------------------|
| @google-cloud/local-auth | @google-cloud/local-auth | ^2.1.0   | Autenticación local para Google Cloud               |
| cors                   | cors                  | ^2.8.5   | Middleware para habilitar CORS en Express           |
| dotenv                 | dotenv                | ^16.3.1  | Carga de variables de entorno desde un archivo .env |
| ejs                    | ejs                   | ^3.1.9   | Motor de plantillas para Express                    |
| express                | express               | ^4.18.2  | Marco de aplicación web para Node.js                |
| google-auth-library    | google-auth-library   | ^9.2.0   | Biblioteca de autenticación de Google               |
| googleapis             | googleapis            | ^105.0.0 | Cliente de API de Google                            |
| html-pdf               | html-pdf              | ^3.0.1   | Generador de PDF desde HTML                         |
| jsonwebtoken           | jsonwebtoken          | ^9.0.2   | Implementación de JSON Web Tokens (JWT)             |
| mime                   | mime                  | ^3.0.0   | Determinación del tipo MIME de un archivo           |
| multer                 | multer                | ^1.4.5-lts.1 | Middleware para manejar la carga de archivos en Express |
| mysql                  | mysql                 | ^2.18.1  | Cliente MySQL para Node.js                          |
| node-cron              | node-cron             | ^3.0.3   | Programador de tareas cron para Node.js             |
| nodemailer             | nodemailer            | ^6.9.5   | Cliente SMTP para Node.js                           |
| path                   | path                  | ^0.12.7  | Utilidades de manejo de rutas de archivos en Node.js |
| uuid                   | uuid                  | ^9.0.1   | Generador de UUID para Node.js                      |

## Instalación y Ejecución

1. Clona el repositorio.
2. Instala las dependencias con `npm install`.
3. Configura las variables de entorno en un archivo `.env`.
4. Ejecuta el microservicio con `npm run dev`.
5. El microservicio estará disponible en `http://localhost:8080/`.

## Uso

1. Configura la aplicación Angular para enviar solicitudes HTTP al microservicio.
2. Utiliza las rutas y métodos definidos en el microservicio para realizar operaciones CRUD en la base de datos y trabajar con la API de Google Drive.


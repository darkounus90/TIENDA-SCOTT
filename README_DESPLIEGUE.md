# Despliegue en DonWeb

## Paso 1: Preparar la Base de Datos
1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crea un cluster gratuito
3. Obtén la connection string (mongodb+srv://...)
4. Crea una base de datos llamada "elpedalazo"

## Paso 2: Configurar Variables de Entorno
1. En DonWeb, ve al panel de control
2. Configura las variables de entorno:
   - `MONGODB_URI`: Tu connection string de MongoDB Atlas
   - `JWT_SECRET`: Una clave secreta segura (genera una aleatoria)
   - `PORT`: El puerto que asigna DonWeb (generalmente 3000 o automático)

## Paso 3: Subir Archivos
1. Sube todos los archivos del proyecto a DonWeb via FTP
2. Asegúrate de que `server.js` esté en el directorio raíz
3. Instala las dependencias ejecutando `npm install` en el servidor

## Paso 4: Configurar el Servidor
1. En DonWeb, configura Node.js como runtime
2. Establece el punto de entrada como `server.js`
3. Configura el dominio para que apunte a tu aplicación

## Paso 5: Verificar
1. Accede a tu dominio
2. Prueba el login con admin/admin123
3. Verifica que los productos se carguen

## Notas Importantes
- DonWeb puede tener limitaciones en hosting compartido
- Considera usar PM2 para manejar el proceso de Node.js
- Para archivos estáticos, configura Express.static en server.js si es necesario
- Asegúrate de que CORS esté configurado correctamente para tu dominio

## Comandos Útiles
```bash
npm install
npm start
```

Si tienes problemas, contacta al soporte de DonWeb.
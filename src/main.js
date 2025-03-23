import express from 'express'
import dotenv from "dotenv";
import { router } from './routers/videoFile.routers.js';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express'
import { logger } from '../logger.js'

dotenv.config()
const app = express();
const port = process.env.PORT || 5000;
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'resolution-change-service',
            version: '1.0.0',
            description: 'API documentations',
        },
        servers: [ { url: process.env.SERVER_URL } ],
    },
    apis: ['./src/routers/videoFile.routers.js']
}
const swaggerDocs = swaggerJsDoc(swaggerOptions);


app.use(express.json())
app.use('', router)

app.use('/api/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.use((error, req, res, next) => {
    logger.error('Error:', error); 
    res.status(error.status || 500);
    res.json({ error: error.message });
});

app.listen(port, () => {
        console.log(`App listen ${port}`)
    })

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './src/routes/authRoutes';
import alertRoutes from './src/routes/alertRoutes';
import logger from '../shared/utils/logger';
import { connectDB } from '../shared/config/database';
import morgan from 'morgan';
import { swaggerDocs, swaggerUi } from './swagger';
import { connectKafka } from './src/config/kafka';
import notificationRoutes from './src/routes/notificationRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(morgan('combined'))
app.use('/user-api/auth', authRoutes);
app.use('/user-api/alerts', alertRoutes);
app.use('/user-api/notifications', notificationRoutes);

(async () => {
  await connectDB();
  await connectKafka();
  app.listen(PORT, () => logger.info("Server running on port " + PORT));
})();
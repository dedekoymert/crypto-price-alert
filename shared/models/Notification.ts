import { Schema, model, Types, InferSchemaType } from 'mongoose';


const notificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  alertId: { type: Schema.Types.ObjectId, required: true },
  price: { type: Number, required: true },
  timeExchange: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

export type INotification = InferSchemaType<typeof notificationSchema> & { _id: Types.ObjectId };

export default model('Notification', notificationSchema);

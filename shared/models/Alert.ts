import { Schema, model, Types, InferSchemaType } from 'mongoose';

const alertSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  assetIdBase: { type: String, required: true },
  assetIdQuote: { type: String, required: true },
  targetPrice: { type: Number, required: true },
  targetDirection: { type: String, required: true },
  status: { type: String, default: "active" },
  createdAt: { type: Date, default: Date.now }
});

export type IAlert = InferSchemaType<typeof alertSchema> & { _id: Types.ObjectId };

export default model("Alert", alertSchema);

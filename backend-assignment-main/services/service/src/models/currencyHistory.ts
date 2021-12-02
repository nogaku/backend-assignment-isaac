import { Schema, model } from "mongoose";

const currencySchema = new Schema(
    {   id:{ type: Number, required: true },
        code: { type: String, required: true },
        to_code: { type: String, required: true, default: "EUR" },
        bid: { type: Number, required: true },
        biddiff: { type: Number, default: 0, required: true },
        ask: { type: Number, required: true },
        askdiff: { type: Number, default: 0, required: true },
        spread: { type: Number, required: true },
        spreaddiff: { type: Number, default: 0, required: true },
        rate: { type: Number, required: false },
        createdAt: { type: Date, default: Date.now, required: false },
        lastrefreshed: { type: Date, default: Date.now, required: false }
    }
);
currencySchema.index({ id: 1 }, { unique: true });
export default model('currency', currencySchema)
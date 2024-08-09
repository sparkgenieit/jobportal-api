import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type CounterDocument = HydratedDocument<Counter>;

@Schema()
export class Counter {
    @Prop()
    counterName: string
    @Prop()
    counterValue: number
}

export const CounterSchema = SchemaFactory.createForClass(Counter);
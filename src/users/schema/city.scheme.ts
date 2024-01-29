import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type CityDocument = HydratedDocument<City>;

@Schema()
export class City{
    @Prop({type: Date})
    created_date?: Date
    @Prop()
    city_name: string
    @Prop()
    description: string
    @Prop()
    activities: string
    @Prop()
    password: string
}

export const CitySchema = SchemaFactory.createForClass(City);
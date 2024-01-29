import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type UserDocument = HydratedDocument<Company>;

@Schema()
export class Company{
    @Prop({type: Date})
    created_date?: Date
    @Prop()
    Category:string
    @Prop()
    WebSite:string
    @Prop()
    Location:string
    @Prop()
    Address_1:string
    @Prop()
    Address_2:string
    @Prop()
    State:string
    @Prop()
    Postalcode:number
    @Prop()
    City:string
    @Prop()
    Country:string
    @Prop()
    Logo:string
    @Prop()
    About_Company:string
    @Prop()
    Mission_and_Values:string
    @Prop()
    Work_Cluture:string
    @Prop()
    Facebook:string
    @Prop()
    Instagram:string
    @Prop()
    Linkedin:string
    @Prop()
    password: string
}

export const UserSchema = SchemaFactory.createForClass(Company);
import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type SkillDocument = HydratedDocument<Skill>;

@Schema()
export class Skill {
    @Prop({ type: Date })
    created_date?: Date
    @Prop()
    skill_name: string
    @Prop()
    skill_dmain: string
    @Prop()
    description: string
    @Prop()
    photo: string
    @Prop()
    status?: string
}

export const SkillSchema = SchemaFactory.createForClass(Skill);
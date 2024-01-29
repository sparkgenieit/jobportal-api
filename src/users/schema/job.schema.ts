import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type jobDocument = HydratedDocument<Job>;

@Schema()
export class Job{
    @Prop({type: Date})
    created_date?: Date
    @Prop()
    description: string
    @Prop()
    location: string
    @Prop()
    job_Category: string
    @Prop()
    job_Sub_Category: string
    @Prop()
    job_Title: string
    @Prop()
    created_By: string
    @Prop()
    number_of_vacancies: number
    @Prop()
    creation_Date:Date 
    @Prop()
    job_id: string
    @Prop()
    emp_Job_Reference: string
    @Prop()
    last_Modified_Date: Date
    @Prop()
    salary: string
    @Prop()
    dead_line: Date
    @Prop()
    provide_Training: string
    @Prop()
    working_hours: number
    @Prop()
    required_Information_before_Applying_Jobs: string
    @Prop()
    company: string
    @Prop()
    approved : string
    @Prop()
    approved_Date: Date
    @Prop()
    approved_By: string








}
    


export const JobSchema = SchemaFactory.createForClass(Job);
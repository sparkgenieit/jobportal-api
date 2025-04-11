import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Log } from "./Log.schema";
import { Model } from "mongoose";
import { AdminLog } from "./AdminLog.Schema";
import { AdLog } from "./AdLog.Schema";

@Injectable()
export class LogService {
    constructor(
        @InjectModel(Log.name) private readonly logModel: Model<Log>,
        @InjectModel(AdminLog.name) private readonly adminLogModel: Model<AdminLog>,
        @InjectModel(AdLog.name) private readonly adLogModel: Model<AdLog>,
    ) { }


    async createLog(log: Log) {
        await this.logModel.create(log)
    }

    async createAdminLog(log: AdminLog) {
        await this.adminLogModel.create(log)
    }


    
    async createAdLog(log: AdLog) {
        await this.adLogModel.create(log)
    }

    async InsertManyLogs(logs: Log[]) {
        await this.logModel.insertMany(logs, { ordered: false })
    }

    async InsertManyAdLogs(logs: AdLog[]) {
        await this.adLogModel.insertMany(logs, { ordered: false })
    }


    async getLogs(id: string, role: string, limit: number, skip: number, filters: any) {

        let query: any = {}

        if (role === 'admin' || role === "superadmin") {
            query = {}
        } else {
            query.user_id = id
        }

        filters.jobTitle.trim() ? query.jobTitle = new RegExp(filters.jobTitle, "i") : null

        filters.employerReference.trim() ? query.employerReference = new RegExp(filters.employerReference, "i") : null

        filters.jobId.trim() ? query.jobId = new RegExp(filters.jobId, "i") : null

        if (filters.fromDate) {
            const from = new Date(filters.fromDate)
            from.setHours(0, 0, 0, 0)

            const to = filters.toDate ? new Date(filters.toDate) : new Date()
            to.setHours(23, 59, 59, 999)

            query.date = { $gte: from, $lte: to }
        }

        const response = await this.logModel.aggregate([
            {
                $match: query
            },
            {
                $facet: {
                    logs: [
                        { $sort: { date: -1 } },
                        { $skip: skip },
                        { $limit: limit }
                    ],
                    count: [{ $count: "total" }]
                }
            }
        ])


        return {
            logs: response[0].logs,
            total: response[0].count[0]?.total || 0,
            status: 200
        }
    }

    async getAdminLogs(id: string, role: string, limit: number, skip: number, filters: any) {

        let query: any = {}

        if (role === "superadmin") {
            query = {}
        } else {
            query.admin_id = id
        }

        filters.jobTitle.trim() ? query.jobTitle = new RegExp(filters.jobTitle, "i") : null

        filters.employerReference.trim() ? query.employerReference = new RegExp(filters.employerReference, "i") : null

        filters.jobId.trim() ? query.jobId = new RegExp(filters.jobId, "i") : null

        if (filters.fromDate) {
            const from = new Date(filters.fromDate)
            from.setHours(0, 0, 0, 0)

            const to = filters.toDate ? new Date(filters.toDate) : new Date()
            to.setHours(23, 59, 59, 999)

            query.date = { $gte: from, $lte: to }
        }

        const response = await this.adminLogModel.aggregate([
            {
                $match: query
            },
            {
                $facet: {
                    logs: [
                        { $sort: { date: -1 } },
                        { $skip: skip },
                        { $limit: limit }
                    ],
                    count: [{ $count: "total" }]
                }
            }
        ])


        return {
            logs: response[0].logs,
            total: response[0].count[0]?.total || 0,
            status: 200
        }
    }

}
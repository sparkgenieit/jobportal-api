import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Log } from "./Log.schema";
import { Model } from "mongoose";
import { AdminLog } from "./AdminLog.Schema";

@Injectable()
export class LogService {
    constructor(
        @InjectModel(Log.name) private readonly logModel: Model<Log>,
        @InjectModel(AdminLog.name) private readonly adminLogModel: Model<AdminLog>,
    ) { }

    async createLog(log: Log) {
        await this.logModel.create(log)
    }

    async createAdminLog(log: AdminLog) {
        await this.adminLogModel.create(log)
    }

    async InsertManyLogs(logs: Log[]) {
        await this.logModel.insertMany(logs, { ordered: false })
    }

}
import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { LogService } from './logs.service';
import { Roles } from 'src/auth/roles.decorator';
import { AuthGuard } from 'src/auth/auth.guard';


@Controller('audit')
@UseGuards(AuthGuard)
export class LogController {
    constructor(
        private readonly logService: LogService
    ) { }

    @Roles(["employer", "recruiter", "admin", "superadmin"])
    @Post('logs')
    async getLogs(@Req() req) {
        let { id, role, companyId } = req.user

        if (role === "recruiter") id = companyId
        const data = req.body
        const { limit, skip } = req.query
        return await this.logService.getLogs(id, role, +limit, +skip, data);
    }


    @Roles(["admin", "superadmin"])
    @Post('admin/logs')
    async getAdminLogs(@Req() req) {
        const { id, role } = req.user
        const { limit, skip } = req.query
        return await this.logService.getAdminLogs(id, role, +limit, +skip, req.body);
    }

}

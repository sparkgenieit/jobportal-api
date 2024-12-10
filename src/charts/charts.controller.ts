import { Controller, Post, Req, UseGuards } from "@nestjs/common";
import { ChartsService } from "./charts.service";
import { AuthGuard } from "src/auth/auth.guard";
import { Roles } from "src/auth/roles.decorator";

@Controller('charts')
export class ChartsController {
    constructor(
        private readonly chartsService: ChartsService
    ) { }

    @UseGuards(AuthGuard)
    @Roles(["employer", "recruiter"])
    @Post('company')
    async getCompanyCharts(@Req() req) {
        const { year, month } = req.body
        return this.chartsService.getCompanyChartsData(req.user.id, +year, +month)
    }
}

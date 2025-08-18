import { Controller, Get, UseGuards } from "honestjs";
import BillingService from "../billing/billing.service";
import { AuthGuard } from "../auth/auth.guard";
import { AuthContext, type IAuthContext } from "../auth/auth.decorator";

@Controller("/billing")
@UseGuards(AuthGuard)
class BillingController {
  private readonly billingService = new BillingService();

  @Get("credits")
  async getAvailableCredits(@AuthContext() authContext: IAuthContext) {
    return await this.billingService.getAvailableCredits(authContext.user.id);
  }
}

export default BillingController;

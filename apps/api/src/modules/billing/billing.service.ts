import { db } from "@/db";
import { userBalance } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Service } from "honestjs";

@Service()
class BillingService {
  async getAvailableCredits(userId: string) {
    const balance = await db.query.userBalance.findFirst({
      where: eq(userBalance.userId, userId),
    });

    if (!balance)
      return {
        credits: -1,
      };

    return {
      credits: balance.credits,
    };
  }
}
export default BillingService;

import { queryOptions } from "@tanstack/react-query";

import { USER_KEYS } from "@/config/query-keys";
import { authClient } from "@/lib/auth-client";

class AuthQueries {
  userSessionOptions() {
    return queryOptions({
      queryKey: [USER_KEYS.MY_PROFILE],
      queryFn: async () => {
        const session = await authClient.getSession();
        return session;
      },
      staleTime: 1000 * 10, // 10 seconds
    });
  }
}

export const authQueries = new AuthQueries();

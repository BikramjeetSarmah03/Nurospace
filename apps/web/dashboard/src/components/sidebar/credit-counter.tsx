import { useQuery } from "@tanstack/react-query";
import { CoinsIcon } from "lucide-react";
import CountUp from "react-countup";

import { billingApiUrls } from "@/features/billing/lib/api";
import { API } from "@/lib/api-client";
import Loader from "../common/loader";

export default function CreditsCounter() {
  const { data: creditsRes, isLoading } = useQuery({
    queryKey: ["CREDITS"],
    queryFn: async () => {
      const res = await API.get<{ credits: number }>(
        billingApiUrls.get_credits,
        {
          withCredentials: true,
        },
      );
      return res.data;
    },
    refetchInterval: 60 * 1000,
  });

  return (
    <div>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="flex justify-between items-center px-8">
          <CoinsIcon className="stroke-primary" />

          <CountUp
            duration={0.5}
            preserveValue
            end={creditsRes?.credits || 0}
            decimal={"0"}
          />
        </div>
      )}
    </div>
  );
}

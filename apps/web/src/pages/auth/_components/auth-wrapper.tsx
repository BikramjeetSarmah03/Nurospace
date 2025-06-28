import type { PropsWithChildren } from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

interface AuthWrapper extends PropsWithChildren {
  className?: string;
}

export default function AuthWrapper({ className, children }: AuthWrapper) {
  return (
    <div
      className={cn(
        "relative bg-background min-h-screen overflow-hidden rose-gradient",
        className,
      )}
    >
      <div className="-top-10 left-0 absolute bg-gradient-to-b from-rose-100 dark:from-rose-950 via-0% to-transparent rounded-b-full w-full h-1/2 blur" />
      <div className="-top-64 left-0 absolute bg-gradient-to-b from-primary/80 to-transparent blur-3xl rounded-full w-full h-1/2" />
      <div className="z-10 relative grid grid-cols-1 md:grid-cols-2 min-h-screen">
        <motion.div
          className="hidden md:flex flex-1 justify-center items-center space-y-8 p-8 text-center"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="space-y-6">
            <motion.h1
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="inline-block bg-clip-text bg-gradient-to-r from-rose-600 via-orange-300 to-blue-500 font-black text-transparent text-6xl"
            >
              Productify
            </motion.h1>

            <motion.h2
              className="font-medium text-xl md:text-3xl leading-tight tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            >
              The Ultimate Productivity App
            </motion.h2>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          className="flex flex-1 justify-center items-center p-8"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

import { motion } from "motion/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { toast } from "sonner";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { authClient } from "@/lib/auth-client";

const registerForm = z.object({
  name: z.string({ message: "Please enter name" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string(),
});

type IRegisterForm = z.infer<typeof registerForm>;

export default function RegisterForm() {
  const navigate = useNavigate();
  const form = useForm<IRegisterForm>({
    resolver: zodResolver(registerForm),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: IRegisterForm) => {
    try {
      const res = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (!res.data) throw Error(res.error.message);

      toast.success("Registered Successfully");
      navigate({ to: "/", replace: true });
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <Form {...form}>
      <motion.form
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Card className="bg-card/20 shadow-[0_10px_26px_#e0e0e0a1] dark:shadow-[0_14px_50px_-10px_var(--color-gray-900)] backdrop-blur-lg border-border/70 w-full max-w-md">
          <CardContent className="space-y-6 p-8">
            {/* Logo and Header */}
            <motion.div
              className="space-y-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
            >
              <div className="flex justify-center items-center space-x-2">
                <span className="font-bold text-2xl md:text-4xl tracking-tight">
                  Register
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                Create an account or log in to discover Productify and make more
                out of your time.
              </p>
            </motion.div>

            {/* Email Input */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="John Doe"
                        className="text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="example@example.com"
                        className="text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
            >
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="******"
                        className="text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Continue Button */}
            <div className="space-y-3">
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7, ease: "easeOut" }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className={buttonVariants({ className: "w-full" })}
              >
                Login <ArrowRightIcon />
              </motion.button>

              <div className="text-xs text-right hover:underline">
                <Link to="/">Forgot Password ?</Link>
              </div>
            </div>
            {/* Divider */}
            <motion.div
              className="relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8, ease: "easeOut" }}
            >
              <div className="absolute inset-0 flex items-center">
                <div className="border-t border-border w-full" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-2 text-muted-foreground">OR</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9, ease: "easeOut" }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="space-y-4"
            >
              <div className="gap-4 grid grid-cols-2">
                <Button
                  variant="secondary"
                  className="bg-foreground hover:bg-foreground/80 shadow-[0_4px_16px_var(--border)] dark:shadow-[0_4px_14px_var(--color-rose-700)] w-full text-background duration-300"
                >
                  <FaGoogle />

                  <span className="ml-2">Sign in with Google</span>
                </Button>
                <Button
                  variant="secondary"
                  className="bg-foreground hover:bg-foreground/80 shadow-[0_4px_16px_var(--border)] dark:shadow-[0_4px_14px_var(--color-rose-700)] w-full text-background duration-300"
                >
                  <FaGithub />

                  <span className="ml-2">Sign in with Github</span>
                </Button>
              </div>

              <Link
                className="float-right text-sm hover:underline"
                to="/auth/login"
              >
                Already have an account ? Login
              </Link>
            </motion.div>

            {/* Terms */}
            <motion.p
              className="mt-14 text-muted-foreground text-xs text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.0, ease: "easeOut" }}
            >
              By signing in you agree to our{" "}
              <Link
                to="/"
                className="text-muted-foreground hover:text-primary underline"
              >
                terms of service
              </Link>{" "}
              and{" "}
              <Link
                to="/"
                className="text-muted-foreground hover:text-primary underline"
              >
                privacy policy
              </Link>
              .
            </motion.p>
          </CardContent>
        </Card>
      </motion.form>
    </Form>
  );
}

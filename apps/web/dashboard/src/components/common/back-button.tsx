import { type LinkProps, useRouter } from "@tanstack/react-router";

import { Button, type ButtonProps } from "@/components/ui/button";

interface BackButtonProps extends ButtonProps {
  link?: LinkProps;
}

export const BackButton = ({ link, children, ...props }: BackButtonProps) => {
  const router = useRouter();

  const onClick = () => {
    if (link) {
      router.navigate(link);
    } else {
      router.history.back();
    }
  };

  return (
    <Button
      type="button"
      variant={props.variant || "outline"}
      {...props}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

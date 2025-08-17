interface PageHeaderProps {
  title: string;
  subTitle?: string;
  rightActions?: React.ReactNode;
}

export function PageHeader({ title, subTitle, rightActions }: PageHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="font-semibold text-2xl">{title}</h1>
        {subTitle && <p className="text-sm">{subTitle}</p>}
      </div>

      {rightActions}
    </div>
  );
}

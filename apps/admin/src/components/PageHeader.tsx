interface PageHeaderProps {
  title: string;
  description: string;
  eyebrow?: string;
}

export function PageHeader({ title, description, eyebrow = "Admin" }: PageHeaderProps) {
  return (
    <header className="page-header">
      <p>{eyebrow}</p>
      <h1>{title}</h1>
      <span>{description}</span>
    </header>
  );
}

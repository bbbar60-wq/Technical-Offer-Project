import { Button } from './ui/Button';
import { PlusCircle } from 'lucide-react';

type PageHeaderProps = {
  title: string;
  actionLabel: string;
  onActionClick: () => void;
};

export default function PageHeader({ title, actionLabel, onActionClick }: PageHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-slate-50">{title}</h1>
      <Button onClick={onActionClick}>
        <PlusCircle className="mr-2 h-5 w-5" />
        {actionLabel}
      </Button>
    </div>
  );
}

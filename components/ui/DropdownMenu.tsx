'use client';

import { Menu, Transition } from '@headlessui/react';
import { Fragment, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DropdownMenuProps {
  trigger: ReactNode;
  children: ReactNode;
}

export function DropdownMenu({ trigger, children }: DropdownMenuProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button as="div">{trigger}</Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-surface shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-slate-800 dark:ring-slate-700 dark:divide-slate-700">
          <div className="px-1 py-1">{children}</div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

interface DropdownMenuItemProps {
  onClick: () => void;
  children: ReactNode;
  className?: string;
}

export function DropdownMenuItem({ onClick, children, className }: DropdownMenuItemProps) {
  return (
    <Menu.Item>
      {({ active }) => (
        <button
          onClick={onClick}
          className={cn(
            'group flex w-full items-center rounded-md px-2 py-2 text-sm',
            active ? 'bg-primary text-white' : 'text-neutral-900 dark:text-slate-100',
            className
          )}
        >
          {children}
        </button>
      )}
    </Menu.Item>
  );
}

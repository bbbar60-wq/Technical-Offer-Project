'use client';

import { Dialog as HeadlessDialog, Transition } from '@headlessui/react';
import { Fragment, ReactNode } from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Dialog({ isOpen, onClose, title, children }: DialogProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <HeadlessDialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-fast"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-fast"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-fast"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-fast"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <HeadlessDialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-surface p-6 text-left align-middle shadow-xl transition-all dark:bg-slate-800 dark:border dark:border-slate-700">
                <HeadlessDialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-neutral-900 dark:text-slate-50 flex justify-between items-center"
                >
                  {title}
                  <button onClick={onClose} className="p-1 rounded-full hover:bg-muted dark:hover:bg-slate-700">
                    <X className="h-4 w-4" />
                  </button>
                </HeadlessDialog.Title>
                <div className="mt-4">{children}</div>
              </HeadlessDialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </HeadlessDialog>
    </Transition>
  );
}


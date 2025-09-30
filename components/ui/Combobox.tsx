'use client';

import { useState, Fragment } from 'react';
import { Combobox as HeadlessCombobox, Transition } from '@headlessui/react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function Combobox({ options, value, onChange, placeholder }: ComboboxProps) {
  const [query, setQuery] = useState('');

  const filteredOptions =
    query === ''
      ? options
      : options.filter((option) =>
          option.label
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(query.toLowerCase().replace(/\s+/g, ''))
        );

  const selectedLabel = options.find(opt => opt.value === value)?.label || '';

  return (
    <HeadlessCombobox value={value} onChange={onChange}>
      <div className="relative">
        <div className="relative w-full cursor-default overflow-hidden rounded-md bg-surface text-left border focus-within:outline-none focus-within:ring-2 focus-within:ring-primary dark:bg-slate-700 dark:border-slate-600">
          <HeadlessCombobox.Input
            className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-neutral-900 focus:ring-0 bg-transparent dark:text-slate-50"
            displayValue={() => selectedLabel}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
          />
          <HeadlessCombobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </HeadlessCombobox.Button>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery('')}
        >
          <HeadlessCombobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-surface py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10 dark:bg-slate-800 dark:ring-slate-600">
            {filteredOptions.length === 0 && query !== '' ? (
              <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-slate-300">
                Nothing found.
              </div>
            ) : (
              filteredOptions.map((option) => (
                <HeadlessCombobox.Option
                  key={option.value}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-primary text-white' : 'text-neutral-900 dark:text-slate-100'
                    }`
                  }
                  value={option.value}
                >
                  {({ selected, active }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {option.label}
                      </span>
                      {selected ? (
                        <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-primary'}`}>
                          <Check className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </HeadlessCombobox.Option>
              ))
            )}
          </HeadlessCombobox.Options>
        </Transition>
      </div>
    </HeadlessCombobox>
  );
}

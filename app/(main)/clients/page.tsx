'use client';

import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { Client } from '@/types';
import { useClients } from '@/hooks/useClients';
import { DataTable } from '@/components/DataTable';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/Button';
import ClientModal from '@/components/modals/ClientModal';

export default function ClientsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
  const { clients, isLoading, deleteClient } = useClients();

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingClient(undefined);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(undefined);
  };

  const columns: ColumnDef<Client>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'address', header: 'Address' },
    { accessorKey: 'contactNumber', header: 'Contact' },
    {
      id: 'actions',
      cell: ({ row }) => {
        const client = row.original;
        return (
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(client)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-danger" onClick={() => deleteClient(client.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (isLoading) return <div>Loading clients...</div>;

  return (
    <div>
      <PageHeader title="Clients" actionLabel="Add Client" onActionClick={handleAddNew} />
      <DataTable columns={columns} data={clients} />
      <ClientModal isOpen={isModalOpen} onClose={closeModal} client={editingClient} />
    </div>
  );
}
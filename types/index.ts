// A unique ID for our mock data
let lastId = 0;
export const newId = () => `id_${Date.now()}_${++lastId}`;

export type Product = {
  id: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  material: string;
  voltage: string;
};

export type Client = {
  id: string;
  name: string;
  address: string;
  contactNumber: string;
};

export type ProjectStatus = 'Draft' | 'Submitted' | 'Win';

export type Project = {
  id: string;
  projectName: string;
  projectNo: string;
  lastRev: string;
  preparedBy: string;
  date: string;
  status: ProjectStatus;
  clientId: string;
  revisions: Revision[];
};

export type Device = {
  id: string;
  name: string;
  model: string;
  brand: string;
  qty: number;
  deviations?: Deviation[];
};

export type Revision = {
    revNo: string;
    devices: Device[];
};

export type Deviation = {
  id: string;
  clientRequest: string;
  vendorReply: string;
};

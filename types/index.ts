// A unique ID for our mock data
let lastId = 0;
export const newId = () => `id_${Date.now()}_${++lastId}`;

// Use bracket notation for keys with spaces or special chars
export type Product = {
  id: string;
  Category?: string;
  Name?: string;
  TYPE?: string;
  Range?: string;
  Brand?: string;
  Model?: string;
  body_material?: string;
  ip_rating?: string;
  SIL?: string;
  Protocol?: string;
  "Hazardous Classification"?: string;
  Voltage?: string;
  technical_specs?: string;
  img?: string;
  "Tag Number"?: string;
  "Datasheet "?: string; // Keep original header, even with space
  Inastaltions?: string;
};

export type Client = {
  id: string;
  name: string;
  address: string;
  contactNumber: string;
  logo?: string; // <-- ADDED THIS FIELD
};

export type Accessory = {
  id: string;
  name: string;
  partNo: string;
  qty: number;
};

export type Deviation = {
  id: string;
  clientRequest: string;
  vendorReply: string;
};

export type GeneralDeviation = {
  id: string;
  author: string;
  date: string;
  deviation: string;
};

export type UploadedFile = {
  id: string;
  name: string;
  url: string; // Store Blob URL or mock path
  uploadedBy: string;
  date: string;
};

export type Device = {
  id: string;
  name: string; // Should match Product Name
  model: string; // Should match Product Model
  brand: string; // Should match Product Brand
  qtyMain: number;
  qtySpare: number;
  deviations?: Deviation[];
  accessories?: Accessory[];
  productDetails: Product; // Full product details
};

export type Revision = {
    revNo: string;
    devices: Device[];
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
  generalDeviations?: GeneralDeviation[];
  uploadedFiles?: UploadedFile[];
};

// --- NEW TYPE for Test Tools ---
export type TestTool = {
  id: string;
  name: string;
  model: string;
  picture: string; // Store filename or path
};
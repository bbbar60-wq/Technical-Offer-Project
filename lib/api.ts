import { Product, Client, Project, Device, newId, Revision } from '@/types';

// --- Helper Functions to simulate API calls ---
const simulateNetwork = async (delay = 500) => new Promise(res => setTimeout(res, delay));

const getFromStorage = <T>(key: string): T[] => {
  if (typeof window === 'undefined') return [];
  const storedValue = localStorage.getItem(key);
  return storedValue ? JSON.parse(storedValue) : [];
};

const saveToStorage = <T>(key: string, data: T[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// --- Products API ---
const MOCK_PRODUCTS: Omit<Product, 'id'>[] = [
    { name: 'Pressure Transmitter', category: 'Instrumentation', brand: 'Rosemount', model: '3051S', material: 'Stainless Steel', voltage: '24VDC' },
    { name: 'Gate Valve', category: 'Valves', brand: 'Cameron', model: 'WKM 370D5', material: 'Carbon Steel', voltage: 'N/A' },
    { name: 'Centrifugal Pump', category: 'Pumps', brand: 'Flowserve', model: 'D824', material: 'Cast Iron', voltage: '480V' },
    { name: 'Control Valve', category: 'Valves', brand: 'Fisher', model: 'EZ', material: 'Stainless Steel', voltage: '24VDC' },
    { name: 'Temperature Sensor', category: 'Instrumentation', brand: 'Endress+Hauser', model: 'TMT182', material: 'Stainless Steel', voltage: '24VDC' },
];

// This function will seed the localStorage with mock data on the first run
const getInitialProducts = () => {
  if (typeof window !== 'undefined' && !localStorage.getItem('products')) {
    const initialProductsWithIds = MOCK_PRODUCTS.map(p => ({ ...p, id: newId() }));
    localStorage.setItem('products', JSON.stringify(initialProductsWithIds));
  }
  return getFromStorage<Product>('products');
}

export const getProducts = async (): Promise<Product[]> => {
  await simulateNetwork(200);
  return getInitialProducts();
};

// --- Re-added CRUD functions for Products ---
export const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
  await simulateNetwork();
  const products = getInitialProducts();
  const newProduct: Product = { ...productData, id: newId() };
  saveToStorage('products', [...products, newProduct]);
  return newProduct;
};

export const updateProduct = async (product: Product): Promise<Product> => {
  await simulateNetwork();
  let products = getInitialProducts();
  products = products.map(p => (p.id === product.id ? product : p));
  saveToStorage('products', products);
  return product;
};

export const deleteProduct = async (productId: string): Promise<{ id: string }> => {
  await simulateNetwork();
  let products = getInitialProducts();
  products = products.filter(p => p.id !== productId);
  saveToStorage('products', products);
  return { id: productId };
};


// --- Clients API (Unchanged) ---
export const getClients = async (): Promise<Client[]> => {
    await simulateNetwork();
    return getFromStorage<Client>('clients');
};

export const addClient = async (clientData: Omit<Client, 'id'>): Promise<Client> => {
    await simulateNetwork();
    const clients = getFromStorage<Client>('clients');
    const newClient: Client = { ...clientData, id: newId() };
    const updatedClients = [...clients, newClient];
    saveToStorage('clients', updatedClients);
    return newClient;
};

export const updateClient = async (client: Client): Promise<Client> => {
    await simulateNetwork();
    let clients = getFromStorage<Client>('clients');
    clients = clients.map(c => (c.id === client.id ? client : c));
    saveToStorage('clients', clients);
    return client;
};

export const deleteClient = async (clientId: string): Promise<{ id: string }> => {
    await simulateNetwork();
    let clients = getFromStorage<Client>('clients');
    clients = clients.filter(c => c.id !== clientId);
    saveToStorage('clients', clients);
    return { id: clientId };
};


// --- Projects API (Unchanged) ---
const initialProjects: Project[] = [
  { id: 'proj_1', projectName: 'City Center Tower', projectNo: 'SGA-001-2025', lastRev: '01', preparedBy: 'John Doe', date: '2025-09-15', status: 'Submitted', clientId: 'client_1', revisions: [{ revNo: '00', devices: [] }, { revNo: '01', devices: [] }] },
  { id: 'proj_2', projectName: 'Coastal Refinery', projectNo: 'SGA-002-2025', lastRev: '00', preparedBy: 'Jane Smith', date: '2025-09-22', status: 'Draft', clientId: 'client_2', revisions: [{ revNo: '00', devices: [] }] },
  { id: 'proj_3', projectName: 'National Airport Expansion', projectNo: 'SGA-003-2025', lastRev: '02', preparedBy: 'John Doe', date: '2025-08-01', status: 'Win', clientId: 'client_1', revisions: [{ revNo: '00', devices: [] }, { revNo: '01', devices: [] }, { revNo: '02', devices: [] }] },
];

const getInitialProjects = () => {
  if (typeof window !== 'undefined' && !localStorage.getItem('projects')) {
    localStorage.setItem('projects', JSON.stringify(initialProjects));
  }
  return getFromStorage<Project>('projects');
}

export const getProjects = async (): Promise<Project[]> => {
  await simulateNetwork();
  return getInitialProjects();
};

export const getProjectById = async (id: string): Promise<Project | undefined> => {
    await simulateNetwork();
    const projects = getInitialProjects();
    return projects.find(p => p.id === id);
}

export const addProject = async (projectData: Omit<Project, 'id' | 'revisions'>): Promise<Project> => {
    await simulateNetwork();
    const projects = getFromStorage<Project>('projects');
    const newProject: Project = {
        ...projectData,
        id: newId(),
        revisions: [{ revNo: '00', devices: [] }]
    };
    const updatedProjects = [...projects, newProject];
    saveToStorage('projects', updatedProjects);
    return newProject;
};

export const addDevicesToRevision = async (
    projectId: string,
    revNo: string,
    devices: Device[]
): Promise<Project> => {
    await simulateNetwork();
    let projects = getFromStorage<Project>('projects');
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) throw new Error('Project not found');
    const project = projects[projectIndex];
    const revisionIndex = project.revisions.findIndex(r => r.revNo === revNo);
    if (revisionIndex === -1) throw new Error('Revision not found');
    devices.forEach(newDevice => {
        const existingDeviceIndex = project.revisions[revisionIndex].devices.findIndex(d => d.id === newDevice.id);
        if (existingDeviceIndex > -1) {
            project.revisions[revisionIndex].devices[existingDeviceIndex].qty += newDevice.qty;
        } else {
            project.revisions[revisionIndex].devices.push(newDevice);
        }
    });
    projects[projectIndex] = project;
    saveToStorage('projects', projects);
    return project;
};

export const updateDeviceInRevision = async (
    projectId: string,
    revNo: string,
    updatedDevice: Device
): Promise<Project> => {
    await simulateNetwork();
    let projects = getFromStorage<Project>('projects');
    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');
    const revision = project.revisions.find(r => r.revNo === revNo);
    if (!revision) throw new Error('Revision not found');
    const deviceIndex = revision.devices.findIndex(d => d.id === updatedDevice.id);
    if (deviceIndex === -1) throw new Error('Device not found');
    revision.devices[deviceIndex] = updatedDevice;
    saveToStorage('projects', projects);
    return project;
};

export const revUpProject = async (projectId: string): Promise<Project> => {
    await simulateNetwork();
    const projects = getFromStorage<Project>('projects');
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) throw new Error('Project not found');
    const project = projects[projectIndex];
    const latestRev = project.revisions.sort((a, b) => b.revNo.localeCompare(a.revNo))[0];
    const latestRevNo = parseInt(latestRev.revNo, 10);
    const newRevNo = String(latestRevNo + 1).padStart(2, '0');
    const newRevision: Revision = JSON.parse(JSON.stringify(latestRev));
    newRevision.revNo = newRevNo;
    project.revisions.push(newRevision);
    project.lastRev = newRevNo;
    projects[projectIndex] = project;
    saveToStorage('projects', projects);
    return project;
};


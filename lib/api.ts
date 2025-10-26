import {
  Product, Client, Project, Device, newId, Revision,
  GeneralDeviation, UploadedFile, Accessory, TestTool // <-- Added TestTool
} from '@/types';
import * as XLSX from 'xlsx'; // Import xlsx library

// --- Helper Functions ---
const simulateNetwork = async (delay = 500) => new Promise(res => setTimeout(res, delay));

const getFromStorage = <T>(key: string): T[] => {
  if (typeof window === 'undefined') return [];
  const storedValue = localStorage.getItem(key);
  try {
    return storedValue ? JSON.parse(storedValue) : [];
  } catch (error) {
    console.error(`Error parsing localStorage key "${key}":`, error);
    return []; // Return empty array on error
  }
};

const saveToStorage = <T>(key: string, data: T[]) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
       console.error(`Error saving to localStorage key "${key}":`, error);
    }
  }
};

// --- Products API ---
const MOCK_PRODUCTS_CSV = `Category,Name,TYPE,Range,Brand,Model,body_material,ip_rating,SIL,Protocol,Hazardous Classification,Voltage,technical_specs,img,Tag Number,Datasheet ,Inastaltions
Flame Detector,Flame Detector,IR4,IR:3-5 μm,Simin Gaman Aria/Iran,SFD-1000R-Y-Y,"Body Aluminum Die-cast Epoxy Coated",IP66,SIL 2,Conventional,"Ex d IIC, T6","18-30 VDC","Manufacturer: Simin Gaman Aria/Iran\nModel: SFD-1000R\nAmbient Temperature: -20 to +60 ᵒC",SFD-1000.jpg,Tag No.: FD-XXX,,
Smoke Detector,Smoke Detector,Optical,,Hochiki/Japan,SOC-E3N,ABS,IP42,,Conventional,,,"Manufacturer: Hochiki/Japan\nModel: SOC-E3N\nAmbient Temperature: -10 to +50 ᵒC",SOC-E3N.jpg,Tag No.: SD-XXX,,
Heat Detector,Heat Detector,Rate of Rise,"58 ᵒC",Hochiki/Japan,DFE-135,ABS,IP42,,Conventional,,,"Manufacturer: Hochiki/Japan\nModel: DFE-135\nAmbient Temperature: -10 to +50 ᵒC",DFE-135.jpg,Tag No.: HD-XXX,,
Gas Detector,Gas Detector,Catalytic,"0-100% LEL",Simin Gaman Aria/Iran,SGD-1000I-M-Y-Y,"Body Aluminum Die-cast Epoxy Coated",IP66,SIL 2,"4-20 mA","Ex d IIC, T6","18-30 VDC","Manufacturer: Simin Gaman Aria/Iran\nModel: SGD-1000I\nAmbient Temperature: -20 to +60 ᵒC",SGD-1000I.jpg,Tag No.: GD-XXX,,
Manual Call Point,Manual Call Point,Push Button,,Simin Gaman Aria/Iran,SGA-1000I,"Body Aluminum Die-cast Epoxy Coated",IP66,,Conventional,"Ex d IIC, T6","18-30 VDC","Manufacturer: Simin Gaman Aria/Iran\nModel: SGA-1000I\nAmbient Temperature: -20 to +60 ᵒC",SGA-1000I.jpg,Tag No.: MCP-XXX,,
Sounder,Sounder,Electronic,,Simin Gaman Aria/Iran,SGA-2000S,"Body Aluminum Die-cast Epoxy Coated",IP66,,Conventional,"Ex d IIC, T6","18-30 VDC","Manufacturer: Simin Gaman Aria/Iran\nModel: SGA-2000S\nAmbient Temperature: -20 to +60 ᵒC",SGA-2000S.jpg,Tag No.: SO-XXX,,
Strobe,Strobe Light,Xenon,,Simin Gaman Aria/Iran,SGA-2000F,"Body Aluminum Die-cast Epoxy Coated",IP66,,Conventional,"Ex d IIC, T6","18-30 VDC","Manufacturer: Simin Gaman Aria/Iran\nModel: SGA-2000F\nAmbient Temperature: -20 to +60 ᵒC",SGA-2000F.jpg,Tag No.: ST-XXX,,`;

// Simple CSV to JSON parser
function csvToJSON(csv: string): any[] {
  const lines = csv.trim().split('\n');
  const result = [];
  // Use the first line for headers, clean them up
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

  for (let i = 1; i < lines.length; i++) {
      if (!lines[i]) continue;

      const obj: any = {};
      // This regex handles quotes and commas inside fields
      const currentline = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];

      if (currentline.length !== headers.length) {
          console.warn(`Skipping line ${i + 1}: Expected ${headers.length} fields, found ${currentline.length}`);
          continue; // Skip lines that don't match the header count
      }

      for (let j = 0; j < headers.length; j++) {
          let value = (currentline[j] || '').trim(); // Ensure value exists
          // Remove surrounding quotes
          if (value.startsWith('"') && value.endsWith('"')) {
              value = value.substring(1, value.length - 1);
          }
          // Replace escaped quotes
          value = value.replace(/""/g, '"');
          // Assign to object using the header as key
          if (headers[j]) { // Ensure header exists
              obj[headers[j]] = value;
          }
      }
      result.push(obj);
  }
  return result;
}

const getInitialProducts = () => {
  if (typeof window !== 'undefined') {
    const storedProducts = localStorage.getItem('products');
    if (!storedProducts) {
      const productsFromCSV = csvToJSON(MOCK_PRODUCTS_CSV) as Omit<Product, 'id'>[];
      const initialProductsWithIds = productsFromCSV.map(p => ({ ...p, id: newId() }));
      saveToStorage('products', initialProductsWithIds); // Use saveToStorage for safety
      return initialProductsWithIds;
    }
    return getFromStorage<Product>('products'); // Use getFromStorage for safety
  }
  return [];
}

export const getProducts = async (): Promise<Product[]> => {
  await simulateNetwork(200);
  return getInitialProducts();
};

export const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
  await simulateNetwork();
  const products = getInitialProducts();
  const newProduct: Product = { ...productData, id: newId() };
  saveToStorage('products', [...products, newProduct]);
  return newProduct;
};

// NEW: Bulk add products (for Excel import)
export const addBulkProducts = async (productsData: Omit<Product, 'id'>[]): Promise<Product[]> => {
    await simulateNetwork(1000); // Simulate longer processing
    const currentProducts = getInitialProducts();
    const newProducts = productsData.map(p => ({ ...p, id: newId() }));
    const updatedProducts = [...currentProducts, ...newProducts];
    saveToStorage('products', updatedProducts);
    return newProducts;
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

// --- Mock Accessories API ---
const MOCK_ACCESSORIES: Accessory[] = [
  { id: 'acc_1', name: 'Mounting Bracket', partNo: 'BRK-001', qty: 1 },
  { id: 'acc_2', name: 'Weather Shield', partNo: 'WSH-002', qty: 1 },
  { id: 'acc_3', name: '3-Valve Manifold', partNo: 'MAN-003', qty: 1 },
];

export const getAccessories = async (): Promise<Accessory[]> => {
  await simulateNetwork(100);
  // Simulate fetching from storage if needed, for now just return mock
  return MOCK_ACCESSORIES;
}

// --- Clients API ---
export const getClients = async (): Promise<Client[]> => {
    await simulateNetwork();
    return getFromStorage<Client>('clients');
};

export const addClient = async (clientData: Omit<Client, 'id'>): Promise<Client> => {
    await simulateNetwork();
    const clients = getFromStorage<Client>('clients');
    const newClient: Client = { ...clientData, id: newId() };
    saveToStorage('clients', [...clients, newClient]);
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

export const addBulkClients = async (clientsData: Omit<Client, 'id'>[]): Promise<Client[]> => {
    await simulateNetwork(1000);
    const currentClients = getFromStorage<Client>('clients');
    const newClients = clientsData.map(c => ({ ...c, id: newId() }));
    const updatedClients = [...currentClients, ...newClients];
    saveToStorage('clients', updatedClients);
    return newClients;
};

// --- Projects API ---
const initialProjects: Project[] = [
  { id: 'proj_1', projectName: 'City Center Tower', projectNo: 'SGA-001-2025', lastRev: '01', preparedBy: 'John Doe', date: '2025-09-15', status: 'Submitted', clientId: 'client_1', revisions: [{ revNo: '00', devices: [] }, { revNo: '01', devices: [] }], generalDeviations: [], uploadedFiles: [] },
  { id: 'proj_2', projectName: 'Coastal Refinery', projectNo: 'SGA-002-2025', lastRev: '00', preparedBy: 'Jane Smith', date: '2025-09-22', status: 'Draft', clientId: 'client_2', revisions: [{ revNo: '00', devices: [] }], generalDeviations: [], uploadedFiles: [] },
  { id: 'proj_3', projectName: 'National Airport Expansion', projectNo: 'SGA-003-2025', lastRev: '02', preparedBy: 'John Doe', date: '2025-08-01', status: 'Win', clientId: 'client_1', revisions: [{ revNo: '00', devices: [] }, { revNo: '01', devices: [] }, { revNo: '02', devices: [] }], generalDeviations: [], uploadedFiles: [] },
];

const getInitialProjects = () => {
  if (typeof window !== 'undefined') {
    const storedProjects = localStorage.getItem('projects');
    if (!storedProjects) {
      saveToStorage('projects', initialProjects); // Use safe save
      return initialProjects;
    }
    return getFromStorage<Project>('projects'); // Use safe get
  }
  return [];
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

export const addProject = async (projectData: Omit<Project, 'id' | 'revisions' | 'generalDeviations' | 'uploadedFiles'>): Promise<Project> => {
    await simulateNetwork();
    const projects = getFromStorage<Project>('projects');
    const newProject: Project = {
        ...projectData,
        id: newId(),
        revisions: [{ revNo: '00', devices: [] }],
        generalDeviations: [],
        uploadedFiles: []
    };
    saveToStorage('projects', [...projects, newProject]);
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
    const project = { ...projects[projectIndex] }; // Clone project
    const revisionIndex = project.revisions.findIndex(r => r.revNo === revNo);
    if (revisionIndex === -1) throw new Error('Revision not found');

    // Ensure devices array exists and clone it
    const currentDevices = [...(project.revisions[revisionIndex].devices || [])];

    devices.forEach(newDevice => {
        const existingDeviceIndex = currentDevices.findIndex(d => d.id === newDevice.id);
        if (existingDeviceIndex > -1) {
            // If device exists, update its quantity
            const existingDevice = { ...currentDevices[existingDeviceIndex] }; // Clone device
            existingDevice.qtyMain += newDevice.qtyMain;
            existingDevice.qtySpare += newDevice.qtySpare;
            currentDevices[existingDeviceIndex] = existingDevice;
        } else {
            // Otherwise, add the new device
            currentDevices.push({ ...newDevice }); // Clone new device
        }
    });

    // Update the revision with the new devices list
    project.revisions[revisionIndex] = { ...project.revisions[revisionIndex], devices: currentDevices };
    projects[projectIndex] = project; // Update the projects array
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
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) throw new Error('Project not found');

    const project = { ...projects[projectIndex] }; // Clone project
    const revisionIndex = project.revisions.findIndex(r => r.revNo === revNo);
    if (revisionIndex === -1) throw new Error('Revision not found');

    const devices = [...(project.revisions[revisionIndex].devices || [])]; // Clone devices
    const deviceIndex = devices.findIndex(d => d.id === updatedDevice.id);
    if (deviceIndex === -1) throw new Error('Device not found');

    // Replace the old device with the updated one (ensure it's a clone)
    devices[deviceIndex] = { ...updatedDevice };
    project.revisions[revisionIndex] = { ...project.revisions[revisionIndex], devices }; // Update revision
    projects[projectIndex] = project; // Update projects array

    saveToStorage('projects', projects);
    return project;
};

export const revUpProject = async (projectId: string): Promise<Project> => {
    await simulateNetwork();
    const projects = getFromStorage<Project>('projects');
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) throw new Error('Project not found');

    const project = { ...projects[projectIndex] }; // Clone project
    // Ensure revisions array exists and is cloned
    project.revisions = [...(project.revisions || [])];

    // Find the latest revision
    const latestRev = project.revisions.sort((a, b) => b.revNo.localeCompare(a.revNo))[0];
    if (!latestRev) { // Handle case with no revisions yet (shouldn't happen with current addProject)
        throw new Error("No revisions found to rev up from.");
    }
    const latestRevNo = parseInt(latestRev.revNo, 10);

    // Calculate the new revision number
    const newRevNo = String(latestRevNo + 1).padStart(2, '0');

    // Deep copy the latest revision's data. JSON stringify/parse is simple and safe.
    const newRevision: Revision = JSON.parse(JSON.stringify(latestRev));
    newRevision.revNo = newRevNo;

    // Add the new revision and update the lastRev property
    project.revisions.push(newRevision);
    project.lastRev = newRevNo;

    projects[projectIndex] = project;
    saveToStorage('projects', projects);
    return project;
};

// --- NEW API FUNCTIONS ---

export const addGeneralDeviation = async (
    projectId: string,
    deviation: Omit<GeneralDeviation, 'id'>
): Promise<Project> => {
    await simulateNetwork();
    const projects = getFromStorage<Project>('projects');
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) throw new Error('Project not found');

    const project = { ...projects[projectIndex] }; // Clone
    project.generalDeviations = [...(project.generalDeviations || [])]; // Clone or init

    project.generalDeviations.push({ ...deviation, id: newId() });

    projects[projectIndex] = project;
    saveToStorage('projects', projects);
    return project;
}

export const addUploadedFile = async (
    projectId: string,
    file: Omit<UploadedFile, 'id' | 'url'>
): Promise<Project> => {
    await simulateNetwork();
    const projects = getFromStorage<Project>('projects');
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) throw new Error('Project not found');

    const project = { ...projects[projectIndex] }; // Clone
    project.uploadedFiles = [...(project.uploadedFiles || [])]; // Clone or init

    // Simulate a file URL. In a real app, this would come from a file storage service.
    const newFile: UploadedFile = {
      ...file,
      id: newId(),
      // Use Blob URL for mock download - more realistic than just a string
      url: URL.createObjectURL(new Blob(["Simulated PDF content for " + file.name]))
    };

    project.uploadedFiles.push(newFile);

    projects[projectIndex] = project;
    saveToStorage('projects', projects);
    return project;
}

// NEW: Copy devices from one revision to another
export const copyRevisionDevices = async (
    targetProjectId: string,
    targetRevNo: string,
    sourceProjectId: string,
    sourceRevNo: string
): Promise<Project> => {
    await simulateNetwork(1500); // Simulate longer processing

    let projects = getFromStorage<Project>('projects'); // Get the whole array

    // Find source data
    const sourceProject = projects.find(p => p.id === sourceProjectId);
    if (!sourceProject) throw new Error("Source project not found");
    const sourceRevision = sourceProject.revisions.find(r => r.revNo === sourceRevNo);
    if (!sourceRevision) throw new Error("Source revision not found");

    // Find target project index
    const targetProjectIndex = projects.findIndex(p => p.id === targetProjectId);
    if (targetProjectIndex === -1) throw new Error("Target project not found");

    // Work on a clone of the target project
    const targetProject = { ...projects[targetProjectIndex] };
    targetProject.revisions = [...targetProject.revisions]; // Clone revisions array

    const targetRevisionIndex = targetProject.revisions.findIndex(r => r.revNo === targetRevNo);
    if (targetRevisionIndex === -1) throw new Error("Target revision not found");

    // Deep copy devices using JSON parse/stringify for safety
    const copiedDevices: Device[] = JSON.parse(JSON.stringify(sourceRevision.devices || []));

    // Simple approach: Replace all existing devices in target revision
    targetProject.revisions[targetRevisionIndex] = {
      ...targetProject.revisions[targetRevisionIndex], // Keep revNo etc.
      devices: copiedDevices // Replace devices
    };

    // Update the projects array with the modified target project
    projects[targetProjectIndex] = targetProject;
    saveToStorage('projects', projects); // Save the entire updated array

    return targetProject; // Return the updated target project
};

// --- NEW: Test Tools API ---
const TEST_TOOLS_STORAGE_KEY = 'testTools';

export const getTestTools = async (): Promise<TestTool[]> => {
    await simulateNetwork();
    return getFromStorage<TestTool>(TEST_TOOLS_STORAGE_KEY);
};

export const addTestTool = async (toolData: Omit<TestTool, 'id'>): Promise<TestTool> => {
    await simulateNetwork();
    const tools = getFromStorage<TestTool>(TEST_TOOLS_STORAGE_KEY);
    const newTool: TestTool = { ...toolData, id: newId() };
    const updatedTools = [...tools, newTool];
    saveToStorage(TEST_TOOLS_STORAGE_KEY, updatedTools);
    return newTool;
};

export const addBulkTestTools = async (toolsData: Omit<TestTool, 'id'>[]): Promise<TestTool[]> => {
    await simulateNetwork(1000);
    const currentTools = getFromStorage<TestTool>(TEST_TOOLS_STORAGE_KEY);
    const newTools = toolsData.map(t => ({ ...t, id: newId() }));
    const updatedTools = [...currentTools, ...newTools];
    saveToStorage(TEST_TOOLS_STORAGE_KEY, updatedTools);
    return newTools;
};

export const updateTestTool = async (tool: TestTool): Promise<TestTool> => {
    await simulateNetwork();
    let tools = getFromStorage<TestTool>(TEST_TOOLS_STORAGE_KEY);
    tools = tools.map(t => (t.id === tool.id ? tool : t));
    saveToStorage(TEST_TOOLS_STORAGE_KEY, tools);
    return tool;
};

export const deleteTestTool = async (toolId: string): Promise<{ id: string }> => {
    await simulateNetwork();
    let tools = getFromStorage<TestTool>(TEST_TOOLS_STORAGE_KEY);
    tools = tools.filter(t => t.id !== toolId);
    saveToStorage(TEST_TOOLS_STORAGE_KEY, tools);
    return { id: toolId };
};

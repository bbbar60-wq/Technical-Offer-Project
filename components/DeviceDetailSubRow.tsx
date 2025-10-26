import { Device } from "@/types";
import { FileText, Download } from 'lucide-react';

interface DeviceDetailSubRowProps {
  device: Device;
}

// Helper function to safely access product details
const getProductDetail = (productDetails: any, key: string) => {
  if (!productDetails) return 'N/A';
  return productDetails[key] || 'N/A';
};

export default function DeviceDetailSubRow({ device }: DeviceDetailSubRowProps) {
  // Safely access product details with fallbacks
  const productDetails = device.productDetails || {};

  return (
    <div className="p-6 bg-muted/30 dark:bg-slate-700/30 border-t dark:border-slate-600">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1: Basic Info & Quantities */}
        <div className="space-y-4">
          <h5 className="font-semibold text-lg dark:text-slate-100 border-b pb-2 dark:border-slate-600">
            Basic Information
          </h5>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="font-medium dark:text-slate-300">Product Name:</span>
              <span className="dark:text-slate-100">{device.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium dark:text-slate-300">Model:</span>
              <span className="dark:text-slate-100">{device.model || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium dark:text-slate-300">Brand:</span>
              <span className="dark:text-slate-100">{device.brand || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium dark:text-slate-300">Qty Main:</span>
              <span className="dark:text-slate-100 font-bold">{device.qtyMain || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium dark:text-slate-300">Qty Spare:</span>
              <span className="dark:text-slate-100 font-bold">{device.qtySpare || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium dark:text-slate-300">Total Qty:</span>
              <span className="dark:text-slate-100 font-bold text-primary">
                {(device.qtyMain || 0) + (device.qtySpare || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Column 2: Technical Specifications */}
        <div className="space-y-4">
          <h5 className="font-semibold text-lg dark:text-slate-100 border-b pb-2 dark:border-slate-600">
            Technical Specifications
          </h5>
          <div className="space-y-2 text-sm">
            <div><strong className="dark:text-slate-300">Category:</strong> <span className="dark:text-slate-100">{getProductDetail(productDetails, 'Category')}</span></div>
            <div><strong className="dark:text-slate-300">Type:</strong> <span className="dark:text-slate-100">{getProductDetail(productDetails, 'TYPE')}</span></div>
            <div><strong className="dark:text-slate-300">Range:</strong> <span className="dark:text-slate-100">{getProductDetail(productDetails, 'Range')}</span></div>
            <div><strong className="dark:text-slate-300">Body Material:</strong> <span className="dark:text-slate-100">{getProductDetail(productDetails, 'body_material')}</span></div>
            <div><strong className="dark:text-slate-300">IP Rating:</strong> <span className="dark:text-slate-100">{getProductDetail(productDetails, 'ip_rating')}</span></div>
            <div><strong className="dark:text-slate-300">SIL Rating:</strong> <span className="dark:text-slate-100">{getProductDetail(productDetails, 'SIL')}</span></div>
            <div><strong className="dark:text-slate-300">Protocol:</strong> <span className="dark:text-slate-100">{getProductDetail(productDetails, 'Protocol')}</span></div>
            <div><strong className="dark:text-slate-300">Hazardous Classification:</strong> <span className="dark:text-slate-100">{getProductDetail(productDetails, 'Hazardous Classification')}</span></div>
            <div><strong className="dark:text-slate-300">Voltage:</strong> <span className="dark:text-slate-100">{getProductDetail(productDetails, 'Voltage')}</span></div>
            <div><strong className="dark:text-slate-300">Tag Number:</strong> <span className="dark:text-slate-100">{getProductDetail(productDetails, 'Tag Number')}</span></div>
          </div>

          {productDetails.technical_specs && (
            <div className="mt-4">
              <strong className="dark:text-slate-300 text-sm">Technical Specs:</strong>
              <p className="text-sm mt-1 dark:text-slate-100 bg-white dark:bg-slate-600 p-2 rounded border dark:border-slate-500">
                {productDetails.technical_specs}
              </p>
            </div>
          )}
        </div>

        {/* Column 3: Accessories & Deviations */}
        <div className="space-y-6">
          {/* Accessories */}
          <div>
            <h5 className="font-semibold text-lg dark:text-slate-100 border-b pb-2 dark:border-slate-600 mb-3">
              Accessories ({device.accessories?.length || 0})
            </h5>
            {device.accessories && device.accessories.length > 0 ? (
              <div className="space-y-2">
                {device.accessories.map(acc => (
                  <div key={acc.id} className="flex justify-between items-center p-2 bg-white dark:bg-slate-600 rounded border dark:border-slate-500">
                    <div>
                      <div className="font-medium dark:text-slate-100">{acc.name}</div>
                      <div className="text-xs text-neutral-600 dark:text-slate-400">{acc.partNo}</div>
                    </div>
                    <div className="font-bold text-primary dark:text-primary-300">
                      {acc.qty}x
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 dark:text-slate-400 text-sm">No accessories added.</p>
            )}
          </div>

          {/* Deviations */}
          <div>
            <h5 className="font-semibold text-lg dark:text-slate-100 border-b pb-2 dark:border-slate-600 mb-3">
              Deviations ({device.deviations?.length || 0})
            </h5>
            {device.deviations && device.deviations.length > 0 ? (
              <div className="space-y-3">
                {device.deviations.map(dev => (
                  <div key={dev.id} className="p-3 bg-white dark:bg-slate-600 rounded border dark:border-slate-500">
                    <div className="mb-2">
                      <strong className="dark:text-slate-300 text-sm">Client Request:</strong>
                      <p className="text-sm dark:text-slate-100 mt-1">{dev.clientRequest}</p>
                    </div>
                    <div>
                      <strong className="dark:text-slate-300 text-sm">Vendor Reply:</strong>
                      <p className="text-sm dark:text-slate-100 mt-1">{dev.vendorReply}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 dark:text-slate-400 text-sm">No deviations added.</p>
            )}
          </div>
        </div>
      </div>

      {/* Documentation Links */}
      {(productDetails['Datasheet '] || productDetails.Inastaltions) && (
        <div className="mt-6 pt-4 border-t dark:border-slate-600">
          <h5 className="font-semibold text-lg dark:text-slate-100 mb-3">Documentation</h5>
          <div className="flex gap-4">
            {productDetails['Datasheet '] && (
              <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-600 rounded border dark:border-slate-500">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm dark:text-slate-100">Datasheet</span>
                <Download className="w-3 h-3 text-neutral-400" />
              </div>
            )}
            {productDetails.Inastaltions && (
              <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-600 rounded border dark:border-slate-500">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm dark:text-slate-100">Installation Guide</span>
                <Download className="w-3 h-3 text-neutral-400" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
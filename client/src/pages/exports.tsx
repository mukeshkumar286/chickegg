import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { DownloadIcon, FileTextIcon, BarChartIcon, DollarSignIcon, EggIcon, HeartPulseIcon, ClipboardListIcon, BookmarkIcon } from "lucide-react";

const ExportDataPage = () => {
  const [activeTab, setActiveTab] = useState("financial");
  const [dataFormat, setDataFormat] = useState("csv");
  const [dateRange, setDateRange] = useState("30");
  const { toast } = useToast();
  
  // Mock export function
  const handleExport = (dataType: string) => {
    toast({
      title: "Export initiated",
      description: `${dataType} data is being prepared for export in ${dataFormat.toUpperCase()} format.`,
    });
    
    // In a real app, this would trigger an API request to generate the export file
    setTimeout(() => {
      toast({
        title: "Export complete",
        description: `Your ${dataType} data export is ready for download.`,
      });
    }, 1500);
  };
  
  // Financial Data Query
  const { data: financialData, isLoading: isLoadingFinancial } = useQuery({
    queryKey: ['/api/financials'],
  });
  
  // Production Data Query
  const { data: productionData, isLoading: isLoadingProduction } = useQuery({
    queryKey: ['/api/production'],
  });
  
  // Health Data Query
  const { data: healthData, isLoading: isLoadingHealth } = useQuery({
    queryKey: ['/api/health'],
  });
  
  // Maintenance Data Query
  const { data: maintenanceData, isLoading: isLoadingMaintenance } = useQuery({
    queryKey: ['/api/tasks'],
  });
  
  // Research Notes Query
  const { data: researchData, isLoading: isLoadingResearch } = useQuery({
    queryKey: ['/api/notes'],
  });
  
  // Inventory Data Query
  const { data: inventoryData, isLoading: isLoadingInventory } = useQuery({
    queryKey: ['/api/inventory'],
  });
  
  const exportOptions = [
    {
      id: "financial",
      title: "Financial Data",
      description: "Export income, expenses, investments and capital data",
      icon: <DollarSignIcon className="h-5 w-5" />,
      dataCount: financialData?.length || 0,
      isLoading: isLoadingFinancial
    },
    {
      id: "production",
      title: "Production Data",
      description: "Export egg production metrics and quality data",
      icon: <EggIcon className="h-5 w-5" />,
      dataCount: productionData?.length || 0,
      isLoading: isLoadingProduction
    },
    {
      id: "health",
      title: "Health Records",
      description: "Export chicken health and mortality data",
      icon: <HeartPulseIcon className="h-5 w-5" />,
      dataCount: healthData?.length || 0, 
      isLoading: isLoadingHealth
    },
    {
      id: "maintenance",
      title: "Maintenance Tasks",
      description: "Export task records and completion status",
      icon: <ClipboardListIcon className="h-5 w-5" />,
      dataCount: maintenanceData?.length || 0,
      isLoading: isLoadingMaintenance
    },
    {
      id: "research",
      title: "Research Notes",
      description: "Export research findings and observations",
      icon: <BookmarkIcon className="h-5 w-5" />,
      dataCount: researchData?.length || 0,
      isLoading: isLoadingResearch
    },
    {
      id: "inventory",
      title: "Inventory Data",
      description: "Export inventory levels and transaction history",
      icon: <BarChartIcon className="h-5 w-5" />,
      dataCount: inventoryData?.length || 0,
      isLoading: isLoadingInventory
    }
  ];
  
  const getDataPreview = (tabId: string) => {
    let data;
    
    switch(tabId) {
      case "financial":
        data = financialData;
        if (data && data.length > 0) {
          return data.slice(0, 5).map((item: any) => ({
            Date: format(new Date(item.date), 'MMM d, yyyy'),
            Type: item.type,
            Category: item.category,
            Amount: `$${item.amount.toFixed(2)}`,
            Description: item.description || '-'
          }));
        }
        break;
      case "production":
        data = productionData;
        if (data && data.length > 0) {
          return data.slice(0, 5).map((item: any) => ({
            Date: format(new Date(item.date), 'MMM d, yyyy'),
            'Total Eggs': item.eggCount,
            'Grade A': item.gradeA || 0,
            'Grade B': item.gradeB || 0,
            Broken: item.broken || 0,
            Batch: item.batchId || '-'
          }));
        }
        break;
      case "health":
        data = healthData;
        if (data && data.length > 0) {
          return data.slice(0, 5).map((item: any) => ({
            Date: format(new Date(item.date), 'MMM d, yyyy'),
            Batch: item.batchId,
            Mortality: item.mortalityCount || 0,
            Diagnosis: item.diagnosis || '-',
            Treatment: item.treatment || '-'
          }));
        }
        break;
      case "maintenance":
        data = maintenanceData;
        if (data && data.length > 0) {
          return data.slice(0, 5).map((item: any) => ({
            Title: item.title,
            Category: item.category,
            Priority: item.priority,
            'Due Date': item.dueDate ? format(new Date(item.dueDate), 'MMM d, yyyy') : '-',
            Status: item.completed ? 'Completed' : 'Pending'
          }));
        }
        break;
      case "research":
        data = researchData;
        if (data && data.length > 0) {
          return data.slice(0, 5).map((item: any) => ({
            Title: item.title,
            Date: format(new Date(item.date), 'MMM d, yyyy'),
            Category: item.category,
            Tags: item.tags ? item.tags.join(', ') : '-',
            ContentPreview: item.content.substring(0, 50) + '...'
          }));
        }
        break;
      case "inventory":
        data = inventoryData;
        if (data && data.length > 0) {
          return data.slice(0, 5).map((item: any) => ({
            Item: item.name,
            Category: item.category,
            Quantity: `${item.quantity} ${item.unit}`,
            'Reorder Level': item.reorderLevel || '-',
            'Last Updated': format(new Date(item.lastUpdated), 'MMM d, yyyy')
          }));
        }
        break;
    }
    
    return [];
  };
  
  const getActiveExportOption = () => {
    return exportOptions.find(option => option.id === activeTab);
  };
  
  const activeOption = getActiveExportOption();
  const previewData = getDataPreview(activeTab);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-800">Export Data</h2>
        <p className="text-neutral-600">Generate and download farm data reports</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Options Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Data Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab} 
                orientation="vertical" 
                className="space-y-1"
              >
                <TabsList className="flex flex-col h-auto items-stretch bg-transparent space-y-1">
                  {exportOptions.map((option) => (
                    <TabsTrigger 
                      key={option.id} 
                      value={option.id}
                      className="justify-start text-left py-3 px-4 mb-1 data-[state=active]:bg-primary-50 data-[state=active]:text-primary-700 data-[state=active]:shadow-none"
                    >
                      <div className="flex items-center">
                        <div className="mr-3 text-primary-600">
                          {option.icon}
                        </div>
                        <div>
                          <div className="font-medium">{option.title}</div>
                          <div className="text-xs text-neutral-500">
                            {option.isLoading ? 'Loading...' : `${option.dataCount} records`}
                          </div>
                        </div>
                      </div>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Export Options */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Export Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block text-neutral-700">Format</label>
                <Select value={dataFormat} onValueChange={setDataFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block text-neutral-700">Date Range</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="180">Last 6 months</SelectItem>
                    <SelectItem value="365">Last 12 months</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                className="w-full mt-4 bg-primary-600 hover:bg-primary-700"
                onClick={() => handleExport(activeOption?.title || '')}
                disabled={activeOption?.isLoading}
              >
                <DownloadIcon className="mr-2 h-4 w-4" />
                Export {activeOption?.title}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Preview Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Data Preview</CardTitle>
                <div className="text-sm text-neutral-500">
                  {activeOption?.isLoading ? 
                    'Loading...' : 
                    `Showing ${Math.min(previewData.length, 5)} of ${activeOption?.dataCount || 0} records`
                  }
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {activeOption?.isLoading ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mx-auto mb-4"></div>
                  <p>Loading {activeOption.title}...</p>
                </div>
              ) : previewData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        {Object.keys(previewData[0]).map((key) => (
                          <th key={key} className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, index) => (
                        <tr key={index} className="border-b hover:bg-neutral-50">
                          {Object.values(row).map((value: any, i) => (
                            <td key={i} className="px-4 py-3 text-sm text-neutral-700">
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16">
                  <FileTextIcon className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                  <p className="text-neutral-500">No {activeOption?.title.toLowerCase()} available for preview</p>
                  <p className="text-sm text-neutral-400 mt-1">Select a different data source or time range</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Export History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md divide-y">
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">Financial Data Export</p>
                    <p className="text-sm text-neutral-500">CSV • 120 records</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{format(new Date(Date.now() - 3600000), 'MMM d, yyyy h:mm a')}</p>
                    <Button variant="link" size="sm" className="h-auto p-0 text-primary-600">
                      <DownloadIcon className="h-3.5 w-3.5 mr-1" /> Download
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">Production Data Export</p>
                    <p className="text-sm text-neutral-500">Excel • 85 records</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{format(new Date(Date.now() - 86400000), 'MMM d, yyyy h:mm a')}</p>
                    <Button variant="link" size="sm" className="h-auto p-0 text-primary-600">
                      <DownloadIcon className="h-3.5 w-3.5 mr-1" /> Download
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">Health Records Export</p>
                    <p className="text-sm text-neutral-500">PDF • 42 records</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{format(new Date(Date.now() - 172800000), 'MMM d, yyyy h:mm a')}</p>
                    <Button variant="link" size="sm" className="h-auto p-0 text-primary-600">
                      <DownloadIcon className="h-3.5 w-3.5 mr-1" /> Download
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExportDataPage;

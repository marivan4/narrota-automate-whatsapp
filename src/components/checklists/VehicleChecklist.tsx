
import React, { useState, useEffect } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Printer, Download, Save } from "lucide-react";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

// Declare the autotable type for jsPDF
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Types for our checklist system
type CheckOption = 'bom' | 'medio' | 'ruim' | 'sim' | 'nao' | 'na';

interface ChecklistCategory {
  title: string;
  orientation?: 'vertical' | 'horizontal';
  subCategories?: {
    title: string;
    items: ChecklistItem[];
  }[];
  items?: ChecklistItem[];
  optionType: 'condition' | 'boolean';
}

interface ChecklistItem {
  id: string;
  text: string;
  selected?: CheckOption | null;
}

interface VehicleInfo {
  name: string;
  vehicle: string;
  date: string;
  company: string;
}

interface VehicleChecklistProps {
  vehicleType: 'car' | 'motorcycle';
  onSave?: (data: any) => void;
}

const VehicleChecklist: React.FC<VehicleChecklistProps> = ({ vehicleType, onSave }) => {
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>({
    name: '',
    vehicle: '',
    date: new Date().toISOString().split('T')[0],
    company: ''
  });

  const [checklist, setChecklist] = useState<ChecklistCategory[]>([]);
  
  useEffect(() => {
    // Load the appropriate checklist based on vehicle type
    setChecklist(vehicleType === 'car' ? carChecklist : motorcycleChecklist);
  }, [vehicleType]);

  const handleVehicleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVehicleInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChecklistChange = (categoryIndex: number, subCategoryIndex: number | null, itemIndex: number, value: CheckOption) => {
    const updatedChecklist = [...checklist];
    
    if (subCategoryIndex !== null) {
      // Item is in a subcategory
      const currentSelection = updatedChecklist[categoryIndex].subCategories![subCategoryIndex].items[itemIndex].selected;
      updatedChecklist[categoryIndex].subCategories![subCategoryIndex].items[itemIndex].selected = 
        currentSelection === value ? null : value;
    } else {
      // Item is directly in the category
      const currentSelection = updatedChecklist[categoryIndex].items![itemIndex].selected;
      updatedChecklist[categoryIndex].items![itemIndex].selected = 
        currentSelection === value ? null : value;
    }
    
    setChecklist(updatedChecklist);
  };

  const saveChecklist = () => {
    if (!vehicleInfo.name || !vehicleInfo.vehicle) {
      toast.error("Por favor, preencha o nome e o veículo.");
      return;
    }

    const checklistData = {
      vehicleInfo,
      checklist,
      vehicleType,
      timestamp: new Date().toISOString()
    };

    // Save functionality would be implemented here
    if (onSave) {
      onSave(checklistData);
    }

    toast.success("Checklist salvo com sucesso!");
  };

  const generatePDF = () => {
    if (!vehicleInfo.name || !vehicleInfo.vehicle) {
      toast.error("Por favor, preencha o nome e o veículo antes de gerar o PDF.");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const vehicleImageSrc = vehicleType === 'car' 
      ? '/lovable-uploads/d0ca1880-7d85-4e92-9d03-6a2295043964.png'
      : '/lovable-uploads/26b56829-dc7d-473a-8418-335cb3345fe8.png';

    // Title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 128);
    doc.text(`Checklist de Inspeção - ${vehicleType === 'car' ? 'Carro' : 'Moto'}`, pageWidth / 2, 15, { align: 'center' });
    
    // Vehicle information
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Nome: ${vehicleInfo.name}`, 15, 30);
    doc.text(`Veículo: ${vehicleInfo.vehicle}`, 15, 40);
    doc.text(`Data: ${vehicleInfo.date}`, pageWidth - 15, 30, { align: 'right' });
    doc.text(`Empresa: ${vehicleInfo.company}`, pageWidth - 15, 40, { align: 'right' });

    // Add vehicle image
    try {
      doc.addImage(vehicleImageSrc, 'PNG', pageWidth / 2 - 40, 45, 80, 40, '', 'FAST');
    } catch (error) {
      console.error('Failed to add image to PDF:', error);
    }

    let yPosition = 95;

    // Process each category
    checklist.forEach((category, catIndex) => {
      // Add category title
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.setFillColor(0, 0, 128);
      doc.rect(15, yPosition, pageWidth - 30, 10, 'F');
      doc.text(category.title, pageWidth / 2, yPosition + 7, { align: 'center' });
      yPosition += 15;

      // Handle the different layout structures
      if (category.orientation === 'vertical' && category.subCategories) {
        category.subCategories.forEach(subCat => {
          // Add subcategory header
          doc.setFontSize(12);
          doc.setTextColor(255, 255, 255);
          doc.setFillColor(0, 0, 180);
          doc.rect(15, yPosition, pageWidth - 30, 8, 'F');
          doc.text(subCat.title, pageWidth / 2, yPosition + 6, { align: 'center' });
          yPosition += 12;

          // Create a table for the items
          const tableData = subCat.items.map(item => [
            item.text,
            item.selected === 'sim' ? 'X' : '',
            item.selected === 'nao' ? 'X' : '',
            item.selected === 'na' ? 'X' : ''
          ]);

          const tableHeaders = [['Item', 'Sim', 'Não', 'N/A']];

          doc.autoTable({
            startY: yPosition,
            head: tableHeaders,
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [230, 230, 250], textColor: [0, 0, 128] },
            styles: { fontSize: 10 },
            columnStyles: {
              0: { cellWidth: pageWidth - 90 },
              1: { cellWidth: 20, halign: 'center' },
              2: { cellWidth: 20, halign: 'center' },
              3: { cellWidth: 20, halign: 'center' }
            },
            margin: { left: 15, right: 15 }
          });

          yPosition = (doc as any).lastAutoTable.finalY + 10;
        });
      } else if (category.optionType === 'condition' && category.items) {
        // Create a table for condition-based items (Bom/Médio/Ruim)
        const tableData = category.items.map(item => [
          item.text,
          item.selected === 'bom' ? 'X' : '',
          item.selected === 'medio' ? 'X' : '',
          item.selected === 'ruim' ? 'X' : ''
        ]);

        const tableHeaders = [['Item', 'Bom', 'Médio', 'Ruim']];

        doc.autoTable({
          startY: yPosition,
          head: tableHeaders,
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [230, 230, 250], textColor: [0, 0, 128] },
          styles: { fontSize: 10 },
          columnStyles: {
            0: { cellWidth: pageWidth - 90 },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 20, halign: 'center' },
            3: { cellWidth: 20, halign: 'center' }
          },
          margin: { left: 15, right: 15 }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 10;
      }

      // Check if we need a new page
      if (yPosition > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        yPosition = 15;
      }
    });

    // Add signature line
    yPosition = Math.max(yPosition, doc.internal.pageSize.getHeight() - 40);
    doc.setDrawColor(0);
    doc.line(30, yPosition, pageWidth - 30, yPosition);
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text("Assinatura do Responsável", pageWidth / 2, yPosition + 10, { align: 'center' });

    // Save the PDF
    doc.save(`checklist_${vehicleType}_${vehicleInfo.name}_${new Date().toISOString().slice(0,10)}.pdf`);
    toast.success("PDF gerado com sucesso!");
  };

  // Render functions for checklist items
  const renderConditionCheckboxes = (categoryIndex: number, itemIndex: number, item: ChecklistItem, subCategoryIndex: number | null = null) => (
    <>
      <td className="text-left p-2 border-b border-slate-200 text-gray-800 dark:text-white">{item.text}</td>
      <td className="p-2 text-center border-b border-slate-200">
        <Checkbox 
          checked={item.selected === 'bom'} 
          onCheckedChange={() => handleChecklistChange(categoryIndex, subCategoryIndex, itemIndex, 'bom')} 
        />
      </td>
      <td className="p-2 text-center border-b border-slate-200">
        <Checkbox 
          checked={item.selected === 'medio'} 
          onCheckedChange={() => handleChecklistChange(categoryIndex, subCategoryIndex, itemIndex, 'medio')} 
        />
      </td>
      <td className="p-2 text-center border-b border-slate-200">
        <Checkbox 
          checked={item.selected === 'ruim'} 
          onCheckedChange={() => handleChecklistChange(categoryIndex, subCategoryIndex, itemIndex, 'ruim')} 
        />
      </td>
    </>
  );

  const renderBooleanCheckboxes = (categoryIndex: number, itemIndex: number, item: ChecklistItem, subCategoryIndex: number | null = null) => (
    <>
      <td className="text-left p-2 border-b border-slate-200 text-gray-800 dark:text-white">{item.text}</td>
      <td className="p-2 text-center border-b border-slate-200">
        <Checkbox 
          checked={item.selected === 'sim'} 
          onCheckedChange={() => handleChecklistChange(categoryIndex, subCategoryIndex, itemIndex, 'sim')} 
        />
      </td>
      <td className="p-2 text-center border-b border-slate-200">
        <Checkbox 
          checked={item.selected === 'nao'} 
          onCheckedChange={() => handleChecklistChange(categoryIndex, subCategoryIndex, itemIndex, 'nao')} 
        />
      </td>
      <td className="p-2 text-center border-b border-slate-200">
        <Checkbox 
          checked={item.selected === 'na'} 
          onCheckedChange={() => handleChecklistChange(categoryIndex, subCategoryIndex, itemIndex, 'na')} 
        />
      </td>
    </>
  );

  return (
    <div className="container mx-auto py-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Checklist de Inspeção - {vehicleType === 'car' ? 'Carro' : 'Moto'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block mb-2 font-semibold text-gray-800 dark:text-white">Nome</label>
              <Input 
                name="name"
                value={vehicleInfo.name}
                onChange={handleVehicleInfoChange}
                className="border-2 border-blue-800"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-800 dark:text-white">Data</label>
              <Input 
                type="date"
                name="date"
                value={vehicleInfo.date}
                onChange={handleVehicleInfoChange}
                className="border-2 border-blue-800"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-800 dark:text-white">Veículo</label>
              <Input 
                name="vehicle"
                value={vehicleInfo.vehicle}
                onChange={handleVehicleInfoChange}
                className="border-2 border-blue-800"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-800 dark:text-white">Empresa</label>
              <Input 
                name="company"
                value={vehicleInfo.company}
                onChange={handleVehicleInfoChange}
                className="border-2 border-blue-800"
              />
            </div>
          </div>

          <div className="mt-4 mb-6">
            <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-white">Marque com um círculo a área do veículo afetada</h3>
            <div className="flex justify-center p-4 bg-gray-50 rounded-md">
              <img 
                src={vehicleType === 'car' 
                  ? '/lovable-uploads/d0ca1880-7d85-4e92-9d03-6a2295043964.png' 
                  : '/lovable-uploads/26b56829-dc7d-473a-8418-335cb3345fe8.png'} 
                alt={`Diagrama de ${vehicleType === 'car' ? 'Carro' : 'Moto'}`}
                className="max-h-60 object-contain"
              />
            </div>
          </div>
          
          {checklist.map((category, categoryIndex) => (
            <div key={`category-${categoryIndex}`} className="mb-6">
              <div className="bg-navy-900 text-white font-semibold p-2 mb-2">
                {category.title}
              </div>
              
              {category.optionType === 'condition' && category.items && (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="text-left p-2 w-1/2 text-gray-700">Item</th>
                      <th className="p-2 text-center text-gray-700">Bom</th>
                      <th className="p-2 text-center text-gray-700">Médio</th>
                      <th className="p-2 text-center text-gray-700">Ruim</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.items.map((item, itemIndex) => (
                      <tr key={item.id} className={itemIndex % 2 === 0 ? 'bg-slate-100' : 'bg-white'}>
                        {renderConditionCheckboxes(categoryIndex, itemIndex, item)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              
              {category.orientation === 'vertical' && category.subCategories && (
                category.subCategories.map((subCategory, subCategoryIndex) => (
                  <div key={`subcategory-${categoryIndex}-${subCategoryIndex}`} className="mb-4">
                    <div className="bg-blue-800 text-white font-medium p-1 mb-1">
                      {subCategory.title}
                    </div>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-blue-50">
                          <th className="text-left p-2 w-1/2 text-gray-700">Item</th>
                          <th className="p-2 text-center text-gray-700">Sim</th>
                          <th className="p-2 text-center text-gray-700">Não</th>
                          <th className="p-2 text-center text-gray-700">N/A</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subCategory.items.map((item, itemIndex) => (
                          <tr key={item.id} className={itemIndex % 2 === 0 ? 'bg-slate-100' : 'bg-white'}>
                            {renderBooleanCheckboxes(categoryIndex, itemIndex, item, subCategoryIndex)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))
              )}
            </div>
          ))}
          
          <div className="flex flex-wrap gap-4 justify-end mt-6">
            <Button onClick={saveChecklist} className="bg-blue-800">
              <Save className="mr-2 h-4 w-4" />
              Salvar Checklist
            </Button>
            <Button onClick={generatePDF} className="bg-blue-800">
              <Printer className="mr-2 h-4 w-4" />
              Gerar PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Car Checklist Configuration
const carChecklist: ChecklistCategory[] = [
  {
    title: "Condições Gerais",
    optionType: "condition",
    items: [
      { id: "ext-1", text: "Limpeza Externa", selected: null },
      { id: "int-1", text: "Limpeza Interna", selected: null },
      { id: "pneu-1", text: "Pneus", selected: null },
      { id: "estepe-1", text: "Estepe", selected: null },
      { id: "caca-1", text: "Caçamba", selected: null }
    ]
  },
  {
    title: "Luzes Traseiras",
    orientation: "vertical",
    optionType: "boolean",
    subCategories: [
      {
        title: "Da placa",
        items: [
          { id: "placa-1", text: "Da placa", selected: null }
        ]
      },
      {
        title: "Direita",
        items: [
          { id: "luz-dir-1", text: "Luz", selected: null },
          { id: "re-dir-1", text: "Luz de ré", selected: null },
          { id: "freio-dir-1", text: "Luz de freio", selected: null },
          { id: "seta-dir-1", text: "Seta", selected: null }
        ]
      },
      {
        title: "Esquerda",
        items: [
          { id: "luz-esq-1", text: "Luz", selected: null },
          { id: "re-esq-1", text: "Luz de ré", selected: null },
          { id: "freio-esq-1", text: "Luz de freio", selected: null },
          { id: "seta-esq-1", text: "Seta", selected: null }
        ]
      }
    ]
  },
  {
    title: "Luzes Dianteiras",
    orientation: "vertical",
    optionType: "boolean",
    subCategories: [
      {
        title: "Da placa",
        items: [
          { id: "placa-d-1", text: "Da placa", selected: null }
        ]
      },
      {
        title: "Direita",
        items: [
          { id: "farol-alto-dir", text: "Farol alto", selected: null },
          { id: "farol-baixo-dir", text: "Farol baixo", selected: null },
          { id: "seta-dir-d", text: "Seta", selected: null },
          { id: "neblina-dir", text: "Neblina", selected: null }
        ]
      },
      {
        title: "Esquerda",
        items: [
          { id: "farol-alto-esq", text: "Farol alto", selected: null },
          { id: "farol-baixo-esq", text: "Farol baixo", selected: null },
          { id: "seta-esq-d", text: "Seta", selected: null },
          { id: "neblina-esq", text: "Neblina", selected: null }
        ]
      }
    ]
  },
  {
    title: "Segurança",
    orientation: "vertical",
    optionType: "boolean",
    subCategories: [
      {
        title: "",
        items: [
          { id: "alarme", text: "Alarme", selected: null },
          { id: "buzina", text: "Buzina", selected: null },
          { id: "chave-roda", text: "Chave de Roda", selected: null },
          { id: "cintos", text: "Cintos", selected: null },
          { id: "documentos", text: "Documentos", selected: null },
          { id: "extintor", text: "Extintor", selected: null },
          { id: "limpadores", text: "Limpadores", selected: null },
          { id: "macaco", text: "Macaco", selected: null },
          { id: "painel", text: "Painel", selected: null },
          { id: "retrovisor-interno", text: "Retrovisor Interno", selected: null },
          { id: "retrovisor-direito", text: "Retrovisor Direito", selected: null },
          { id: "retrovisor-esquerdo", text: "Retrovisor Esquerdo", selected: null },
          { id: "travas", text: "Travas", selected: null },
          { id: "triangulo", text: "Triângulo", selected: null }
        ]
      }
    ]
  },
  {
    title: "Motor",
    orientation: "vertical",
    optionType: "boolean",
    subCategories: [
      {
        title: "",
        items: [
          { id: "acelerador", text: "Acelerador", selected: null },
          { id: "agua-limpador", text: "Água do limpador", selected: null },
          { id: "agua-radiador", text: "Água do radiador", selected: null },
          { id: "embreagem", text: "Embreagem", selected: null },
          { id: "freio", text: "Freio", selected: null },
          { id: "freio-mao", text: "Freio de mão", selected: null },
          { id: "oleo-freio", text: "Óleo do freio", selected: null },
          { id: "oleo-motor", text: "Óleo do motor", selected: null },
          { id: "tanque-partida", text: "Tanque de partida", selected: null }
        ]
      }
    ]
  }
];

// Motorcycle Checklist Configuration
const motorcycleChecklist: ChecklistCategory[] = [
  {
    title: "Condições Gerais",
    optionType: "condition",
    items: [
      { id: "ext-1-m", text: "Limpeza Externa", selected: null },
      { id: "int-1-m", text: "Limpeza Interna", selected: null },
      { id: "pneu-1-m", text: "Pneus", selected: null },
      { id: "bau-1-m", text: "Caixa bau", selected: null }
    ]
  },
  {
    title: "Luzes Dianteiras",
    orientation: "vertical",
    optionType: "boolean",
    subCategories: [
      {
        title: "Da placa",
        items: [
          { id: "placa-d-1-m", text: "Da placa", selected: null }
        ]
      },
      {
        title: "Direita",
        items: [
          { id: "farol-alto-dir-m", text: "Farol alto", selected: null },
          { id: "farol-baixo-dir-m", text: "Farol baixo", selected: null },
          { id: "seta-dir-d-m", text: "Seta", selected: null },
          { id: "neblina-dir-m", text: "Neblina", selected: null }
        ]
      },
      {
        title: "Esquerda",
        items: [
          { id: "farol-alto-esq-m", text: "Farol alto", selected: null },
          { id: "farol-baixo-esq-m", text: "Farol baixo", selected: null },
          { id: "seta-esq-d-m", text: "Seta", selected: null },
          { id: "neblina-esq-m", text: "Neblina", selected: null }
        ]
      }
    ]
  },
  {
    title: "Luzes Traseiras",
    orientation: "vertical",
    optionType: "boolean",
    subCategories: [
      {
        title: "Da placa",
        items: [
          { id: "placa-t-1-m", text: "Da placa", selected: null }
        ]
      },
      {
        title: "Direita",
        items: [
          { id: "luz-dir-t-m", text: "Luz", selected: null },
          { id: "seta-dir-t-m", text: "Seta", selected: null }
        ]
      },
      {
        title: "Esquerda",
        items: [
          { id: "luz-esq-t-m", text: "Luz", selected: null },
          { id: "seta-esq-t-m", text: "Seta", selected: null }
        ]
      }
    ]
  },
  {
    title: "Segurança",
    orientation: "vertical",
    optionType: "boolean",
    subCategories: [
      {
        title: "",
        items: [
          { id: "alarme-m", text: "Alarme", selected: null },
          { id: "buzina-m", text: "Buzina", selected: null },
          { id: "cavalete-m", text: "Cavalete lateral", selected: null },
          { id: "documentos-m", text: "Documentos", selected: null },
          { id: "painel-m", text: "Painel", selected: null },
          { id: "pedal-m-m", text: "Pedal motorista", selected: null },
          { id: "pedal-p-m", text: "Pedal passageiro", selected: null },
          { id: "retrovisor-d-m", text: "Retrovisor direito", selected: null },
          { id: "retrovisor-e-m", text: "Retrovisor esquerdo", selected: null },
          { id: "travas-m", text: "Travas", selected: null },
          { id: "triangulo-m", text: "Triângulo", selected: null }
        ]
      }
    ]
  },
  {
    title: "Motor",
    orientation: "vertical",
    optionType: "boolean",
    subCategories: [
      {
        title: "",
        items: [
          { id: "acelerador-m", text: "Acelerador", selected: null },
          { id: "agua-limpador-m", text: "Água do limpador", selected: null },
          { id: "agua-radiador-m", text: "Água do radiador", selected: null },
          { id: "embreagem-m", text: "Embreagem", selected: null },
          { id: "freio-m", text: "Freio", selected: null },
          { id: "freio-mao-m", text: "Freio de mão", selected: null },
          { id: "oleo-freio-m", text: "Óleo do freio", selected: null },
          { id: "oleo-motor-m", text: "Óleo do moto", selected: null },
          { id: "tanque-partida-m", text: "Tanque de partida", selected: null }
        ]
      }
    ]
  }
];

export default VehicleChecklist;

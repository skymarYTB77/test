import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Download, Upload, FileJson, FileArchive, ChevronDown, Trash2 } from 'lucide-react';
import { exportGlobalData, importGlobalData, type GlobalData } from '../utils/dataExport';
import { importRestaurants } from '../store/restaurantSlice';
import '../styles/DataManager.css';

interface DataManagerProps {
  visibleData: any[];
  acceptedData: any[];
  rejectedData: any[];
  appointments: any[];
  tasks: any[];
  onImport: (data: GlobalData) => void;
}

export function DataManager({
  visibleData,
  acceptedData,
  rejectedData,
  appointments,
  tasks,
  onImport
}: DataManagerProps) {
  const dispatch = useDispatch();
  const [message, setMessage] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const exportButtonRef = useRef<HTMLButtonElement>(null);
  const importButtonRef = useRef<HTMLLabelElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const importMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node) &&
          exportButtonRef.current && !exportButtonRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
      if (importMenuRef.current && !importMenuRef.current.contains(event.target as Node) &&
          importButtonRef.current && !importButtonRef.current.contains(event.target as Node)) {
        setShowImportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showTemporaryMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleExportZip = async () => {
    try {
      const data: GlobalData = {
        restaurants: {
          visible: visibleData,
          accepted: acceptedData,
          rejected: rejectedData
        },
        calendar: appointments,
        tasks: tasks
      };

      const blob = await exportGlobalData(data);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `export_complet_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showTemporaryMessage('Export complet réussi !');
      setShowExportMenu(false);
    } catch (error) {
      showTemporaryMessage('Erreur lors de l\'export');
      console.error('Export error:', error);
    }
  };

  const handleExportCsv = () => {
    const currentData = visibleData;
    if (currentData.length === 0) {
      showTemporaryMessage("Aucune donnée à exporter");
      return;
    }
    
    const headers = Object.keys(currentData[0]);
    const csv = [
      headers.join(';'),
      ...currentData.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          return value.toString().includes(';') ? `"${value}"` : value;
        }).join(';')
      )
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `export_csv_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showTemporaryMessage(`${currentData.length} fiches exportées en CSV !`);
    setShowExportMenu(false);
  };

  const handleImportZip = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await importGlobalData(file);
      onImport(data);
      showTemporaryMessage('Import complet réussi !');
      setShowImportMenu(false);
    } catch (error) {
      showTemporaryMessage('Erreur lors de l\'import');
      console.error('Import error:', error);
    }
  };

  const handleImportCsv = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const rows = text.split('\n');
        const headers = rows[0].split(';').map(h => h.trim());
        
        const importedData = rows.slice(1)
          .filter(row => row.trim())
          .map(row => {
            const values = row.split(';');
            const restaurant: any = {
              status: 'visible'
            };
            
            headers.forEach((header, index) => {
              if (values[index]) {
                restaurant[header] = values[index].trim();
              }
            });

            return restaurant;
          });

        if (importedData.length > 0) {
          await dispatch(importRestaurants(importedData));
          showTemporaryMessage(`${importedData.length} fiches importées depuis le CSV !`);
        }
      } catch (error) {
        console.error('Error importing CSV:', error);
        showTemporaryMessage('Erreur lors de l\'import CSV');
      }
    };
    reader.readAsText(file);
    setShowImportMenu(false);
  };

  return (
    <div className="fixed-bottom-buttons">
      <div className="button-container">
        <button 
          className="delete-all-button"
          onClick={() => setShowDeleteConfirmation(true)}
        >
          <Trash2 size={16} />
          <span>Supprimer tout</span>
        </button>

        <div className="export-options">
          <button 
            ref={exportButtonRef}
            className="export-button"
            onClick={() => setShowExportMenu(!showExportMenu)}
          >
            <Download size={16} />
            <span>Exporter</span>
            <ChevronDown size={16} />
          </button>
          {showExportMenu && (
            <div ref={exportMenuRef} className="export-menu">
              <button onClick={handleExportCsv} className="menu-item">
                <FileJson size={16} />
                <span>Exporter en CSV</span>
              </button>
              <button onClick={handleExportZip} className="menu-item">
                <FileArchive size={16} />
                <span>Exporter tout (ZIP)</span>
              </button>
            </div>
          )}
        </div>

        <div className="import-options">
          <button
            ref={importButtonRef as React.RefObject<HTMLButtonElement>}
            className="import-button"
            onClick={() => setShowImportMenu(!showImportMenu)}
          >
            <Upload size={16} />
            <span>Importer</span>
            <ChevronDown size={16} />
          </button>
          {showImportMenu && (
            <div ref={importMenuRef} className="import-menu">
              <input
                type="file"
                id="import-csv"
                accept=".csv"
                onChange={handleImportCsv}
                style={{ display: 'none' }}
              />
              <label htmlFor="import-csv" className="menu-item">
                <FileJson size={16} />
                <span>Importer CSV</span>
              </label>

              <input
                type="file"
                id="import-zip"
                accept=".zip"
                onChange={handleImportZip}
                style={{ display: 'none' }}
              />
              <label htmlFor="import-zip" className="menu-item">
                <FileArchive size={16} />
                <span>Importer ZIP</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirmation && (
        <div className="modal">
          <div className="modal-content delete-confirmation-modal">
            <h3>Confirmation de suppression</h3>
            <p>Êtes-vous sûr de vouloir supprimer toutes les données ?</p>
            <p>Cette action est irréversible !</p>
            <div className="delete-confirmation-actions">
              <button 
                className="cancel-delete"
                onClick={() => setShowDeleteConfirmation(false)}
              >
                Annuler
              </button>
              <button 
                className="confirm-delete"
                onClick={() => {
                  onImport({
                    restaurants: { visible: [], accepted: [], rejected: [] },
                    calendar: [],
                    tasks: []
                  });
                  setShowDeleteConfirmation(false);
                  showTemporaryMessage('Toutes les données ont été supprimées !');
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className="data-message">
          {message}
        </div>
      )}
    </div>
  );
}
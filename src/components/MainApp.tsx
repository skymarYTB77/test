import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Download, Upload, Trash2, Save, X, Check, X as XIcon, ChevronLeft, ChevronRight, Plus, Edit2, Search, Undo2, Redo2, LogOut } from 'lucide-react';
import { OpeningStatus } from './OpeningStatus';
import { Classification } from './Classification';
import { Calendar } from './Calendar';
import { TaskManager } from './TaskManager';
import { DataManager } from './DataManager';
import { GeminiChat } from './GeminiChat';
import { ApiKeyManager } from './ApiKeyManager';
import { CategorySelector } from './CategorySelector';
import { RootState } from '../store/store';
import {
  fetchRestaurants,
  addRestaurant,
  deleteRestaurant,
  moveRestaurant,
  updateRestaurant,
  setInitialData,
  undo,
  redo
} from '../store/restaurantSlice';

interface Restaurant {
  id?: string;
  Nom: string;
  Étoiles: string;
  "Nombre d'Avis": string;
  Type: string;
  Adresse: string;
  Téléphone: string;
  "Lien Site Web": string;
  "Horaires d'ouverture"?: string;
  Classification?: string;
  Note?: string;
  lat?: number;
  lng?: number;
  category: 'Restaurants' | 'Hôtels';
  status: 'visible' | 'accepted' | 'rejected';
  [key: string]: string | number | undefined;
}

function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function MainApp() {
  const dispatch = useDispatch();
  const currentCategory = useSelector((state: RootState) => state.category.currentCategory);
  const { 
    visibleData, 
    acceptedData, 
    rejectedData, 
    past, 
    future,
    loading,
    error 
  } = useSelector((state: RootState) => state.restaurants);
  const [message, setMessage] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [currentDatabase, setCurrentDatabase] = useState<'visible' | 'accepted' | 'rejected'>('visible');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState<string>('');
  const [currentNoteIndex, setCurrentNoteIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [mockRestaurant, setMockRestaurant] = useState<Restaurant>({
    Nom: "Le Bistrot Parisien",
    Étoiles: "4.5 étoiles",
    "Nombre d'Avis": "128",
    Type: "Restaurant français",
    Adresse: "123 Rue de Paris, 75001 Paris",
    Téléphone: "01 23 45 67 89",
    "Lien Site Web": "https://example.com",
    "Horaires d'ouverture": "Lun-Ven: 12h-14h30, 19h-22h30; Sam-Dim: 12h-15h, 19h-23h",
    Classification: "Prospect A",
    status: 'visible',
    category: currentCategory,
    lat: 48.8566,
    lng: 2.3522
  });

  const defaultFields = [
    "Nom",
    "Étoiles",
    "Nombre d'Avis",
    "Type",
    "Adresse",
    "Téléphone",
    "Lien Site Web",
    "Horaires d'ouverture",
    "Classification"
  ];
  
  const [customFields, setCustomFields] = useState<string[]>([]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    dispatch(fetchRestaurants(currentCategory));
  }, [dispatch, currentCategory]);

  const showTemporaryMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 2000);
  };

  const checkStorageLimit = () => {
    const totalSize = new Blob([
      JSON.stringify(visibleData),
      JSON.stringify(acceptedData),
      JSON.stringify(rejectedData)
    ]).size;
    
    const storageLimit = 5 * 1024 * 1024;
    const percentageUsed = (totalSize / storageLimit) * 100;
    
    return {
      used: totalSize,
      limit: storageLimit,
      percentage: percentageUsed,
      usedMB: (totalSize / (1024 * 1024)).toFixed(2),
      limitMB: (storageLimit / (1024 * 1024)).toFixed(2)
    };
  };

  const addCustomField = () => {
    if (!newFieldName.trim()) {
      showTemporaryMessage("Le nom du champ ne peut pas être vide !");
      return;
    }

    if (defaultFields.includes(newFieldName) || customFields.includes(newFieldName)) {
      showTemporaryMessage("Ce champ existe déjà !");
      return;
    }

    setCustomFields([...customFields, newFieldName]);
    setNewFieldName('');
    setShowAddFieldModal(false);
    showTemporaryMessage("Nouveau champ ajouté !");
  };

  const saveRestaurant = () => {
    const storageInfo = checkStorageLimit();
    if (storageInfo.percentage >= 90) {
      showTemporaryMessage("Attention: Espace de stockage presque plein!");
      return;
    }

    const isDuplicate = [...visibleData, ...acceptedData, ...rejectedData].some(fiche => 
      fiche.Nom === mockRestaurant.Nom && fiche.Adresse === mockRestaurant.Adresse
    );
    
    if (isDuplicate) {
      showTemporaryMessage("Cette fiche existe déjà !");
      return;
    }

    const restaurantToSave = {
      ...mockRestaurant,
      status: 'visible' as const,
      lat: mockRestaurant.lat || 48.8566 + (Math.random() - 0.5) * 0.05,
      lng: mockRestaurant.lng || 2.3522 + (Math.random() - 0.5) * 0.05
    };

    dispatch(addRestaurant(restaurantToSave));
    showTemporaryMessage(`Fiche sauvegardée ! (${visibleData.length + 1})`);
  };

  const handleDeleteRestaurant = (id: string, database: 'visible' | 'accepted' | 'rejected') => {
    dispatch(deleteRestaurant(id, database, currentCategory));
    showTemporaryMessage("Fiche supprimée !");
  };

  const handleMoveRestaurant = (restaurant: Restaurant, fromStatus: 'visible' | 'accepted' | 'rejected', toStatus: 'visible' | 'accepted' | 'rejected') => {
    dispatch(moveRestaurant(restaurant, fromStatus, toStatus));
    showTemporaryMessage(`Fiche ${toStatus === 'accepted' ? 'acceptée' : toStatus === 'rejected' ? 'rejetée' : 'restaurée'} !`);
  };

  const deleteAllData = () => {
    dispatch(setInitialData({ visible: [], accepted: [], rejected: [] }));
    setSelectedRestaurant(null);
    showTemporaryMessage("Toutes les données ont été supprimées !");
    setShowDeleteModal(false);
  };

  const selectRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setMockRestaurant(restaurant);
  };

  const changeDatabase = (direction: 'next' | 'prev') => {
    const order = ['visible', 'accepted', 'rejected'];
    const currentIndex = order.indexOf(currentDatabase);
    const newIndex = direction === 'next' ? 
      (currentIndex + 1) % 3 : 
      (currentIndex - 1 + 3) % 3;
    setCurrentDatabase(order[newIndex] as 'visible' | 'accepted' | 'rejected');
  };

  const getCurrentData = () => {
    const data = currentDatabase === 'accepted' ? acceptedData :
                currentDatabase === 'rejected' ? rejectedData :
                visibleData;

    if (!searchQuery) return data.map(item => ({
      ...item,
      id: item.id || generateUniqueId()
    }));

    return data.filter(restaurant => 
      Object.values(restaurant).some(value => 
        value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    ).map(item => ({
      ...item,
      id: item.id || generateUniqueId()
    }));
  };

  const getDatabaseTitle = () => {
    return currentDatabase === 'accepted' ? "Base de données acceptée" :
           currentDatabase === 'rejected' ? "Base de données rejetée" :
           "Base de données en attente";
  };

  const handleGlobalImport = (data: any) => {
    dispatch(setInitialData({
      visible: data.restaurants.visible,
      accepted: data.restaurants.accepted,
      rejected: data.restaurants.rejected
    }));
    setAppointments(data.calendar);
    setTasks(data.tasks);
  };

  const handleUndo = () => {
    if (past.length > 0) {
      dispatch(undo());
      showTemporaryMessage("Action annulée");
    }
  };

  const handleRedo = () => {
    if (future.length > 0) {
      dispatch(redo());
      showTemporaryMessage("Action rétablie");
    }
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = text.split('\n');
        const headers = rows[0].split(';').map(h => h.trim());
        
        const importedData = rows.slice(1)
          .filter(row => row.trim())
          .map(row => {
            const values = row.split(';');
            const restaurant: Partial<Restaurant> = {
              status: 'visible' as const,
              category: currentCategory
            };
            
            headers.forEach((header, index) => {
              if (values[index]) {
                restaurant[header] = values[index].trim();
              }
            });

            return restaurant as Restaurant;
          });

        if (importedData.length > 0) {
          dispatch(setInitialData({
            visible: importedData,
            accepted: [],
            rejected: []
          }));
          showTemporaryMessage(`${importedData.length} fiches importées depuis le CSV !`);
        }
      } catch (error) {
        console.error('Error importing CSV:', error);
        showTemporaryMessage('Erreur lors de l\'import CSV');
      }
    };
    reader.readAsText(file);
    setShowImportModal(false);
  };

  const exportData = (isComplete: boolean) => {
    try {
      const currentData = getCurrentData();
      if (currentData.length === 0) {
        showTemporaryMessage("Aucune donnée à exporter");
        return;
      }
      
      const headers = Object.keys(currentData[0])
        .filter(key => !['id', 'status'].includes(key));
      
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
      link.download = `export_${currentDatabase}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showTemporaryMessage(`${currentData.length} fiches exportées en CSV !`);
      setShowExportModal(false);
    } catch (error) {
      console.error('Export error:', error);
      showTemporaryMessage('Erreur lors de l\'export');
    }
  };

  const storageInfo = checkStorageLimit();

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="flex items-center gap-2">
          <h1>Gestionnaire de Fiches de</h1>
          <CategorySelector />
        </div>
        <div className="header-actions">
          <button 
            className={`undo-button ${past.length === 0 ? 'disabled' : ''}`}
            onClick={handleUndo}
            disabled={past.length === 0}
          >
            <Undo2 size={20} />
          </button>
          <button 
            className={`redo-button ${future.length === 0 ? 'disabled' : ''}`}
            onClick={handleRedo}
            disabled={future.length === 0}
          >
            <Redo2 size={20} />
          </button>
          <div className="storage-indicator" style={{
            color: storageInfo.percentage > 80 ? '#ff4444' : 
                   storageInfo.percentage > 60 ? '#ffaa00' : '#ffffff'
          }}>
            {visibleData.length} fiches en attente, {acceptedData.length} acceptées, {rejectedData.length} rejetées ({storageInfo.usedMB}/{storageInfo.limitMB} MB)
          </div>
          <div className="flex items-center gap-4">
            <ApiKeyManager />
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="main-layout">
        <div className="restaurant-preview sticky-preview">
          <div className="preview-header">
            <h2>{selectedRestaurant ? "Détails de la fiche sélectionnée" : "Aperçu de la fiche"}</h2>
            <div className="preview-actions">
              <button 
                className="preview-button"
                onClick={() => setShowAddFieldModal(true)}
              >
                <Plus size={16} />
                <span>Ajouter un champ</span>
              </button>
              <button 
                className="preview-button save"
                onClick={saveRestaurant}
              >
                <Save size={16} />
                <span>Sauvegarder</span>
              </button>
            </div>
          </div>
          <div className="restaurant-card">
            {[...defaultFields, ...customFields].map((field) => (
              <div key={field} className="restaurant-field">
                <div className="field-header">
                  <label>{field}:</label>
                </div>
                <input 
                  type="text" 
                  value={mockRestaurant[field] || ""} 
                  onChange={(e) => setMockRestaurant({...mockRestaurant, [field]: e.target.value})}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="database-section">
          <div className="database-header">
            <div className="database-navigation">
              <button className="nav-button" onClick={() => changeDatabase('prev')}>
                <ChevronLeft size={20} />
              </button>
              <h3>{getDatabaseTitle()}</h3>
              <button className="nav-button" onClick={() => changeDatabase('next')}>
                <ChevronRight size={20} />
              </button>
            </div>
            
            <div className="search-bar">
              <input
                type="text"
                className="search-input"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search size={20} className="search-icon" />
            </div>
          </div>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Restaurant</th>
                  <th>Étoiles</th>
                  <th>Nombre d'Avis</th>
                  <th>Type</th>
                  <th>Adresse</th>
                  <th>Téléphone</th>
                  <th>Site Web</th>
                  <th>Horaires</th>
                  <th>Classification</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {getCurrentData().map((restaurant) => (
                  <tr 
                    key={restaurant.id} 
                    className={selectedRestaurant?.id === restaurant.id ? "selected-row" : ""}
                    onClick={() => selectRestaurant(restaurant)}
                  >
                    <td>
                      <div className="restaurant-name-cell">
                        <span className="restaurant-name">{restaurant.Nom}</span>
                        <div className="action-cell">
                          <button 
                            className="delete-item-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRestaurant(restaurant.id!, currentDatabase);
                            }}
                            title="Supprimer"
                          >
                            <Trash2 size={14} />
                          </button>
                          
                          {currentDatabase === 'visible' && (
                            <>
                              <button 
                                className="accept-item-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveRestaurant(restaurant, 'visible', 'accepted');
                                }}
                                title="Accepter"
                              >
                                <Check size={14} />
                              </button>
                              <button 
                                className="reject-item-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveRestaurant(restaurant, 'visible', 'rejected');
                                }}
                                title="Rejeter"
                              >
                                <XIcon size={14} />
                              </button>
                            </>
                          )}
                          
                          {currentDatabase === 'accepted' && (
                            <button 
                              className="reject-item-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveRestaurant(restaurant, 'accepted', 'rejected');
                              }}
                              title="Rejeter"
                            >
                              <XIcon size={14} />
                            </button>
                          )}
                          
                          {currentDatabase === 'rejected' && (
                            <button 
                              className="accept-item-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveRestaurant(restaurant, 'rejected', 'accepted');
                              }}
                              title="Accepter"
                            >
                              <Check size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{restaurant.Étoiles}</td>
                    <td>{restaurant["Nombre d'Avis"]}</td>
                    <td>{restaurant.Type}</td>
                    <td>{restaurant.Adresse}</td>
                    <td>{restaurant.Téléphone}</td>
                    <td>
                      <a 
                        href={restaurant["Lien Site Web"]} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {restaurant["Lien Site Web"]}
                      </a>
                    </td>
                    <td>
                      <OpeningStatus openingHours={restaurant["Horaires d'ouverture"]} />
                    </td>
                    <td>
                      <Classification
                        value={restaurant.Classification || ''}
                        onChange={(value) => {
                          dispatch(updateRestaurant(
                            { ...restaurant, Classification: value },
                            currentDatabase
                          ));
                        }}
                      />
                    </td>
                    <td 
                      className="note-cell"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingNote(restaurant.Nom);
                        setTempNote(restaurant.Note || '');
                        setCurrentNoteIndex(restaurant.id!);
                        setShowNoteModal(true);
                      }}
                    >
                      <div className="note-display">
                        {restaurant.Note || <Edit2 size={14} />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <DataManager
          visibleData={visibleData}
          acceptedData={acceptedData}
          rejectedData={rejectedData}
          appointments={appointments}
          tasks={tasks}
          onImport={handleGlobalImport}
        />
      </div>

      {message && (
        <div className="temporary-message">
          {message}
        </div>
      )}

      {showExportModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-modal" onClick={() => setShowExportModal(false)}>
              <X size={24} />
            </span>
            <h3>Choisissez le type d'exportation</h3>
            <button 
              className="export-option-button"
              onClick={() => exportData(false)}
            >
              Exportation basique
            </button>
            <button 
              className="export-option-button"
              onClick={() => exportData(true)}
            >
              Exportation complète
            </button>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-modal" onClick={() => setShowImportModal(false)}>
              <X size={24} />
            </span>
            <h3>Importer des données</h3>
            <div className="import-options">
              <div className="import-option">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  id="file-import"
                />
                <label htmlFor="file-import" className="import-option-button">
                  Sélectionner un fichier
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-modal" onClick={() => setShowDeleteModal(false)}>
              <X size={24} />
            </span>
            <h3>Options de suppression</h3>
            <button 
              className="delete-option-button"
              onClick={deleteAllData}
            >
              Supprimer tout
            </button>
          </div>
        </div>
      )}

      {showAddFieldModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-modal" onClick={() => setShowAddFieldModal(false)}>
              <X size={24} />
            </span>
            <h3>Ajouter un nouveau champ</h3>
            <div className="field-input">
              <input
                type="text"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                placeholder="Nom du champ"
                className="custom-field-input"
              />
              <button 
                className="add-field-confirm"
                onClick={addCustomField}
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {showNoteModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-modal" onClick={() => {
              setShowNoteModal(false);
              setEditingNote(null);
              setTempNote('');
              setCurrentNoteIndex(null);
            }}>
              <X size={24} />
            </span>
            <h3>Ajouter une note</h3>
            <div className="note-input">
              <textarea
                value={tempNote}
                onChange={(e) => setTempNote(e.target.value)}
                placeholder="Écrivez votre note ici..."
                className="note-textarea"
                rows={4}
              />
            </div>
            <div className="note-actions">
              <button 
                className="cancel-note"
                onClick={() => {
                  setShowNoteModal(false);
                  setEditingNote(null);
                  setTempNote('');
                  setCurrentNoteIndex(null);
                }}
              >
                Annuler
              </button>
              <button 
                className="save-note"
                onClick={() => {
                  if (currentNoteIndex) {
                    const restaurant = getCurrentData().find(r => r.id === currentNoteIndex);
                    if (restaurant) {
                      dispatch(updateRestaurant(
                        { ...restaurant, Note: tempNote },
                        currentDatabase
                      ));
                    }
                    setShowNoteModal(false);
                    setEditingNote(null);
                    setTempNote('');
                    setCurrentNoteIndex(null);
                    showTemporaryMessage('Note enregistrée !');
                  }
                }}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg">
          {error}
        </div>
      )}

      <Calendar />
      <TaskManager />
      <GeminiChat
        onAddTask={(task) => {
          // Implement task addition logic
        }}
        onAddAppointment={(appointment) => {
          // Implement appointment addition logic
        }}
        onUpdateNote={(id, note) => {
          // Implement note update logic
        }}
        onUpdateClassification={(id, classification) => {
          // Implement classification update logic
        }}
        onDeleteRestaurant={(id) => {
          // Implement restaurant deletion logic
        }}
      />
    </div>
  );
}

export default MainApp;
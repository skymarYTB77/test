import JSZip from 'jszip';

export interface GlobalData {
  restaurants: {
    visible: any[];
    accepted: any[];
    rejected: any[];
  };
  calendar: any[];
  tasks: any[];
}

export const exportGlobalData = async (data: GlobalData): Promise<Blob> => {
  const zip = new JSZip();

  // Créer un dossier pour chaque type de données
  const restaurantsFolder = zip.folder('restaurants');
  const calendarFolder = zip.folder('calendar');
  const tasksFolder = zip.folder('tasks');

  // Ajouter les fichiers de restaurants
  if (restaurantsFolder) {
    restaurantsFolder.file('visible.json', JSON.stringify(data.restaurants.visible, null, 2));
    restaurantsFolder.file('accepted.json', JSON.stringify(data.restaurants.accepted, null, 2));
    restaurantsFolder.file('rejected.json', JSON.stringify(data.restaurants.rejected, null, 2));
  }

  // Ajouter le fichier du calendrier
  if (calendarFolder) {
    calendarFolder.file('appointments.json', JSON.stringify(data.calendar, null, 2));
  }

  // Ajouter le fichier des tâches
  if (tasksFolder) {
    tasksFolder.file('tasks.json', JSON.stringify(data.tasks, null, 2));
  }

  // Ajouter un fichier manifest
  zip.file('manifest.json', JSON.stringify({
    version: '1.0',
    exportDate: new Date().toISOString(),
    contentSummary: {
      restaurants: {
        visible: data.restaurants.visible.length,
        accepted: data.restaurants.accepted.length,
        rejected: data.restaurants.rejected.length
      },
      calendar: data.calendar.length,
      tasks: data.tasks.length
    }
  }, null, 2));

  // Générer le fichier ZIP
  return await zip.generateAsync({ type: 'blob' });
};

export const importGlobalData = async (file: File): Promise<GlobalData> => {
  const zip = new JSZip();
  const contents = await zip.loadAsync(file);
  const data: GlobalData = {
    restaurants: {
      visible: [],
      accepted: [],
      rejected: []
    },
    calendar: [],
    tasks: []
  };

  // Vérifier le manifest
  const manifestFile = contents.file('manifest.json');
  if (!manifestFile) {
    throw new Error('Format de fichier invalide : manifest.json manquant');
  }

  // Charger les données des restaurants
  const visibleFile = contents.file('restaurants/visible.json');
  const acceptedFile = contents.file('restaurants/accepted.json');
  const rejectedFile = contents.file('restaurants/rejected.json');

  if (visibleFile) {
    const content = await visibleFile.async('string');
    data.restaurants.visible = JSON.parse(content);
  }
  if (acceptedFile) {
    const content = await acceptedFile.async('string');
    data.restaurants.accepted = JSON.parse(content);
  }
  if (rejectedFile) {
    const content = await rejectedFile.async('string');
    data.restaurants.rejected = JSON.parse(content);
  }

  // Charger les données du calendrier
  const calendarFile = contents.file('calendar/appointments.json');
  if (calendarFile) {
    const content = await calendarFile.async('string');
    data.calendar = JSON.parse(content);
  }

  // Charger les données des tâches
  const tasksFile = contents.file('tasks/tasks.json');
  if (tasksFile) {
    const content = await tasksFile.async('string');
    data.tasks = JSON.parse(content);
  }

  return data;
};
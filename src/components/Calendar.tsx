import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isLeapYear, addMonths, subMonths, startOfWeek, endOfWeek, addDays, startOfDay, endOfDay, eachHourOfInterval, isSameHour, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Clock, Check, Eye, Trash2 } from 'lucide-react';
import '../styles/Calendar.css';

interface Appointment {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
}

export function Calendar() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newAppointment, setNewAppointment] = useState<Partial<Appointment>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  useEffect(() => {
    const savedAppointments = localStorage.getItem('calendar_appointments');
    if (savedAppointments) {
      setAppointments(JSON.parse(savedAppointments));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('calendar_appointments', JSON.stringify(appointments));
  }, [appointments]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const workingHours = Array.from({ length: 12 }, (_, i) => i + 8); // 8h à 19h

  const handlePrevPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, -7));
    }
  };

  const handleNextPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 7));
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setNewAppointment({
      date: format(date, 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '10:00'
    });
    setShowAppointmentModal(true);
  };

  const showTemporaryMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveAppointment = () => {
    if (!newAppointment.title?.trim()) {
      showTemporaryMessage('Veuillez entrer un titre pour le rendez-vous');
      return;
    }

    if (!newAppointment.date || !newAppointment.startTime || !newAppointment.endTime) {
      showTemporaryMessage('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const appointment: Appointment = {
      id: Date.now().toString(),
      title: newAppointment.title,
      date: newAppointment.date,
      startTime: newAppointment.startTime,
      endTime: newAppointment.endTime,
      description: newAppointment.description
    };

    setAppointments(prev => [...prev, appointment]);
    setShowAppointmentModal(false);
    setNewAppointment({});
    showTemporaryMessage('Rendez-vous ajouté avec succès !');
  };

  const deleteAppointment = (appointmentId: string) => {
    setAppointments(prev => prev.filter(app => app.id !== appointmentId));
    showTemporaryMessage('Rendez-vous supprimé !');
  };

  const exportCalendar = () => {
    const dataStr = JSON.stringify(appointments, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `calendar_export_${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showTemporaryMessage('Calendrier exporté avec succès !');
  };

  const importCalendar = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        setAppointments(prev => [...prev, ...importedData]);
        showTemporaryMessage('Calendrier importé avec succès !');
      } catch (error) {
        showTemporaryMessage('Erreur lors de l\'importation du calendrier');
        console.error('Error importing calendar data:', error);
      }
    };
    reader.readAsText(file);
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(app => app.date === format(date, 'yyyy-MM-dd'));
  };

  const getAppointmentsForHour = (date: Date, hour: number) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(app => {
      if (app.date !== dateStr) return false;
      const appHour = parseInt(app.startTime.split(':')[0], 10);
      return appHour === hour;
    });
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'month' ? 'week' : 'month');
  };

  return (
    <>
      <button className="calendar-toggle" onClick={() => setIsOpen(!isOpen)}>
        <CalendarIcon size={20} />
      </button>

      {isOpen && (
        <div className="calendar-overlay">
          <div className="calendar-container">
            <div className="calendar-header">
              <button onClick={handlePrevPeriod}>
                <ChevronLeft size={20} />
              </button>
              <h2>{format(currentDate, viewMode === 'month' ? 'MMMM yyyy' : "'Semaine du' dd MMMM yyyy", { locale: fr })}</h2>
              <button onClick={handleNextPeriod}>
                <ChevronRight size={20} />
              </button>
              <button className="view-mode-toggle" onClick={toggleViewMode}>
                <Eye size={20} />
              </button>
              <button className="close-calendar" onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {viewMode === 'month' ? (
              <>
                <div className="calendar-weekdays">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                    <div key={day} className="weekday">{day}</div>
                  ))}
                </div>

                <div className="calendar-days">
                  {days.map(day => {
                    const dayAppointments = getAppointmentsForDate(day);
                    return (
                      <div
                        key={day.toString()}
                        className={`calendar-day ${!isSameMonth(day, currentDate) ? 'other-month' : ''} ${isSameDay(day, new Date()) ? 'today' : ''}`}
                        onClick={() => handleDateClick(day)}
                      >
                        <span className="day-number">{format(day, 'd')}</span>
                        {dayAppointments.map(app => (
                          <div 
                            key={app.id} 
                            className="day-appointment"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="appointment-title">{app.title}</span>
                            <button 
                              className="delete-appointment"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteAppointment(app.id);
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="week-view">
                <div className="week-header">
                  <div className="hour-column">Heure</div>
                  {weekDays.map(day => (
                    <div 
                      key={day.toString()} 
                      className={`day-column ${isSameDay(day, new Date()) ? 'today' : ''}`}
                    >
                      {format(day, 'EEE dd', { locale: fr })}
                    </div>
                  ))}
                </div>
                <div className="week-grid">
                  {workingHours.map(hour => (
                    <div key={hour} className="hour-row">
                      <div className="hour-label">{`${hour}:00`}</div>
                      {weekDays.map(day => {
                        const hourAppointments = getAppointmentsForHour(day, hour);
                        return (
                          <div 
                            key={`${day}-${hour}`} 
                            className="time-slot"
                            onClick={() => {
                              const date = day;
                              setSelectedDate(date);
                              setNewAppointment({
                                date: format(date, 'yyyy-MM-dd'),
                                startTime: `${hour.toString().padStart(2, '0')}:00`,
                                endTime: `${(hour + 1).toString().padStart(2, '0')}:00`
                              });
                              setShowAppointmentModal(true);
                            }}
                          >
                            {hourAppointments.map(app => (
                              <div 
                                key={app.id} 
                                className="week-appointment"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="appointment-header">
                                  <span className="appointment-time">
                                    {app.startTime} - {app.endTime}
                                  </span>
                                  <button 
                                    className="delete-appointment"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteAppointment(app.id);
                                    }}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                                <span className="appointment-title">
                                  {app.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="calendar-actions">
              <input
                type="file"
                id="import-calendar"
                accept=".json"
                onChange={importCalendar}
                style={{ display: 'none' }}
              />
              <label htmlFor="import-calendar" className="import-button">
                Importer
              </label>
              <button onClick={exportCalendar}>Exporter</button>
            </div>
          </div>
        </div>
      )}

      {showAppointmentModal && (
        <div className="modal">
          <div className="modal-content calendar-modal">
            <button className="close-modal" onClick={() => setShowAppointmentModal(false)}>
              <X size={24} />
            </button>
            <h3>Nouveau rendez-vous</h3>
            <div className="appointment-form">
              <div className="form-group">
                <label>Titre <span className="required">*</span></label>
                <input
                  type="text"
                  value={newAppointment.title || ''}
                  onChange={e => setNewAppointment({ ...newAppointment, title: e.target.value })}
                  placeholder="Titre du rendez-vous"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Début <span className="required">*</span></label>
                  <input
                    type="time"
                    value={newAppointment.startTime || ''}
                    onChange={e => setNewAppointment({ ...newAppointment, startTime: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Fin <span className="required">*</span></label>
                  <input
                    type="time"
                    value={newAppointment.endTime || ''}
                    onChange={e => setNewAppointment({ ...newAppointment, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newAppointment.description || ''}
                  onChange={e => setNewAppointment({ ...newAppointment, description: e.target.value })}
                  placeholder="Description (optionnelle)"
                />
              </div>
              <div className="appointment-actions">
                <button onClick={() => setShowAppointmentModal(false)}>Annuler</button>
                <button onClick={handleSaveAppointment} className="save-appointment">
                  <Check size={16} />
                  <span>Enregistrer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className="calendar-message">
          {message}
        </div>
      )}
    </>
  );
}
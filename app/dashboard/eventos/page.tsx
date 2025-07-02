"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import {
  eventsService,
  CalendarEventResponse,
  EventCreateRequest,
  EventUpdateRequest,
  RecurrenceType,
} from "@/services/events.service";

// Componente principal da página de eventos
export default function EventosPage() {
  // --- STATE MANAGEMENT ---
  const [events, setEvents] = useState<CalendarEventResponse[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- MODAL E FORMULÁRIO STATE ---
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<
    Partial<EventCreateRequest & { time: string; finishTime: string }>
  >({});
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  // --- LÓGICA DO CALENDÁRIO ---
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEventResponse[]>();
    events.forEach((event) => {
      event.occurrences.forEach((occurrence) => {
        const dateKey = new Date(occurrence.start).toISOString().split("T")[0];
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)?.push(event);
      });
    });
    return map;
  }, [events]);

  const calendarGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = Array.from(
      { length: lastDayOfMonth.getDate() },
      (_, i) => new Date(year, month, i + 1)
    );
    const startingDayOfWeek = firstDayOfMonth.getDay();
    return Array(startingDayOfWeek).fill(null).concat(daysInMonth);
  }, [currentDate]);

  // --- DATA FETCHING ---
  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const eventsData = await eventsService.getCalendarEvents(year, month);
      setEvents(eventsData);
    } catch (err) {
      console.error("Erro ao carregar eventos:", err);
      setError("Não foi possível carregar os eventos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  // --- HANDLERS ---
  const handlePrevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  const handleNextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEventId(null);
  };

  const handleModalClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      handleCloseModal();
    }
  };

  const handleOpenCreateModal = (date?: Date) => {
    const selectedDate = date || new Date();
    setEditingEventId(null);
    setFormData({
      title: "",
      description: "",
      location: "",
      date: selectedDate.toISOString().split("T")[0],
      time: "19:00",
      finishDate: selectedDate.toISOString().split("T")[0],
      finishTime: "21:00",
      requiresParticipantList: false,
      recurrenceType: RecurrenceType.None,
      frequency: 1,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = async (eventId: number, occurrenceDate: Date) => {
    setEditingEventId(eventId);
    setFormLoading(true);
    setShowModal(true);
    try {
      const eventData = await eventsService.getEventById(eventId);

      const originalStartDate = new Date(eventData.date);
      const originalFinishDate = new Date(eventData.finishDate);
      const startTime = originalStartDate.toTimeString().substring(0, 5);
      const finishTime = originalFinishDate.toTimeString().substring(0, 5);

      const duration =
        originalFinishDate.getTime() - originalStartDate.getTime();
      const occurrenceEndDate = new Date(
        new Date(
          `${occurrenceDate.toISOString().split("T")[0]}T${startTime}:00.000Z`
        ).getTime() + duration
      );

      setFormData({
        title: eventData.title,
        description: eventData.description,
        location: eventData.location,
        date: occurrenceDate.toISOString().split("T")[0],
        time: startTime,
        finishDate: occurrenceEndDate.toISOString().split("T")[0],
        finishTime: finishTime,
        requiresParticipantList: eventData.requiresParticipantList,
        recurrenceType:
          eventData.recurrence?.recurrenceType ?? RecurrenceType.None,
        frequency: eventData.recurrence?.frequency ?? 1,
      });
    } catch (err) {
      setError("Falha ao carregar dados para edição.");
      handleCloseModal();
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const realValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: realValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);
    if (!formData.date || !formData.time || !formData.finishTime) {
      setError("Data e hora são obrigatórias.");
      setFormLoading(false);
      return;
    }

    const startDateISO = new Date(
      `${formData.date}T${formData.time}:00.000Z`
    ).toISOString();
    const finishDateISO = new Date(
      `${formData.finishDate || formData.date}T${formData.finishTime}:00.000Z`
    ).toISOString();

    const commonPayload = {
      title: formData.title || "",
      description: formData.description || "",
      date: startDateISO,
      finishDate: finishDateISO,
      location: formData.location || "",
      requiresParticipantList: formData.requiresParticipantList || false,
      recurrenceType: Number(formData.recurrenceType),
      frequency: Number(formData.frequency) || 1,
    };

    try {
      if (editingEventId) {
        const payload: EventUpdateRequest = {
          ...commonPayload,
          worshipTheme: "",
        };
        await eventsService.updateEvent(editingEventId, payload);
      } else {
        const payload: EventCreateRequest = commonPayload;
        await eventsService.createEvent(payload);
      }
      handleCloseModal();
      loadEvents();
    } catch (err) {
      console.error("Erro ao salvar o evento:", err);
      setError(
        "Não foi possível salvar o evento. Verifique os dados e tente novamente."
      );
    } finally {
      setFormLoading(false);
    }
  };

  // --- RENDERIZAÇÃO ---
  return (
    <div className="p-4 sm:p-6 lg:p-8 font-sans">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <svg
              className="h-6 w-6 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mx-4 w-48 text-center">
            {currentDate
              .toLocaleString("pt-BR", { month: "long", year: "numeric" })
              .toUpperCase()}
          </h1>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <svg
              className="h-6 w-6 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
        <button
          onClick={() => handleOpenCreateModal()}
          className="mt-4 sm:mt-0 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          Criar Evento
        </button>
      </div>

      {error && (
        <p className="text-center text-red-500 bg-red-100 p-3 rounded-lg mb-4">
          {error}
        </p>
      )}

      {/* Grid do Calendário */}
      <div className="grid grid-cols-7 border-t border-l border-gray-200 bg-white shadow-lg rounded-lg overflow-hidden">
        {[
          "Domingo",
          "Segunda",
          "Terça",
          "Quarta",
          "Quinta",
          "Sexta",
          "Sábado",
        ].map((day) => (
          <div
            key={day}
            className="text-center font-semibold text-gray-600 py-3 bg-gray-50 border-b border-r border-gray-200 text-sm sm:text-base"
          >
            {day}
          </div>
        ))}
        {calendarGrid.map((day, index) => {
          if (!day)
            return (
              <div
                key={index}
                className="min-h-[120px] border-b border-r border-gray-200 bg-gray-50"
              ></div>
            );

          const dateKey = day.toISOString().split("T")[0];
          const dayEvents = eventsByDate.get(dateKey) || [];

          return (
            <div
              key={index}
              className="min-h-[120px] flex flex-col p-2 border-b border-r border-gray-200 hover:bg-blue-50 transition-colors"
              onClick={() => handleOpenCreateModal(day)}
            >
              <div className="self-end font-semibold text-gray-700">
                {day.getDate()}
              </div>
              <div className="flex-grow space-y-1 mt-1">
                {dayEvents.map((event, eventIndex) => (
                  <div
                    key={`${event.id}-${eventIndex}`}
                    className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-md cursor-pointer hover:bg-blue-600 whitespace-nowrap overflow-hidden text-overflow-ellipsis"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditModal(event.id, day);
                    }}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
          onClick={handleModalClickOutside}
        >
          <div
            ref={modalRef}
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-full overflow-y-auto"
          >
            {formLoading ? (
              <div className="p-16 text-center">Carregando...</div>
            ) : (
              <>
                <div className="flex items-center justify-between p-5 border-b border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {editingEventId ? "Editar Evento" : "Criar Novo Evento"}
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 rounded-full hover:bg-gray-200"
                  >
                    <svg
                      className="h-6 w-6 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-1">
                      Título
                    </label>
                    <input
                      name="title"
                      value={formData.title || ""}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-1">
                      Descrição
                    </label>
                    <textarea
                      name="description"
                      value={formData.description || ""}
                      onChange={handleFormChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-1">
                      Local
                    </label>
                    <input
                      name="location"
                      value={formData.location || ""}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-1">
                        Data Início
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date || ""}
                        onChange={handleFormChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-1">
                        Hora Início
                      </label>
                      <input
                        type="time"
                        name="time"
                        value={formData.time || ""}
                        onChange={handleFormChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-1">
                        Data Fim
                      </label>
                      <input
                        type="date"
                        name="finishDate"
                        value={formData.finishDate || ""}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-1">
                        Hora Fim
                      </label>
                      <input
                        type="time"
                        name="finishTime"
                        value={formData.finishTime || ""}
                        onChange={handleFormChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <label className="block text-lg font-semibold text-gray-700 mb-2">
                      Recorrência
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <select
                          name="recurrenceType"
                          value={formData.recurrenceType}
                          onChange={handleFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value={RecurrenceType.None}>
                            Não se repete
                          </option>
                          <option value={RecurrenceType.Daily}>
                            Diariamente
                          </option>
                          <option value={RecurrenceType.Weekly}>
                            Semanalmente
                          </option>
                          <option value={RecurrenceType.Monthly}>
                            Mensalmente
                          </option>
                          <option value={RecurrenceType.Yearly}>
                            Anualmente
                          </option>
                        </select>
                      </div>
                      {formData.recurrenceType != RecurrenceType.None && (
                        <div>
                          <input
                            type="number"
                            name="frequency"
                            value={formData.frequency || 1}
                            min="1"
                            onChange={handleFormChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center pt-2">
                    <input
                      type="checkbox"
                      id="participantList"
                      name="requiresParticipantList"
                      checked={!!formData.requiresParticipantList}
                      onChange={handleFormChange}
                      className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="participantList"
                      className="ml-3 text-lg font-semibold text-gray-700"
                    >
                      Exigir lista de participantes?
                    </label>
                  </div>
                  <div className="flex justify-end pt-4 space-x-3">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-6 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                    >
                      {formLoading ? "Salvando..." : "Salvar Evento"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

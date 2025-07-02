"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import {
  eventsService,
  CalendarEventResponse,
  EventCreateRequest,
  EventUpdateRequest,
  RecurrenceType,
  EventType, // Importar o novo Enum
} from "@/services/events.service";

type CalendarView = "monthly" | "weekly" | "daily";

const getInitialView = (): CalendarView => {
  if (typeof window === "undefined") return "monthly";
  const savedView = localStorage.getItem("calendarView") as CalendarView;
  if (savedView && ["monthly", "weekly", "daily"].includes(savedView))
    return savedView;
  return window.innerWidth < 768 ? "weekly" : "monthly";
};

export default function EventosPage() {
  const [view, setView] = useState<CalendarView>("monthly");
  const [events, setEvents] = useState<CalendarEventResponse[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<
    Partial<EventCreateRequest & { time: string; finishTime: string }>
  >({});
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  const eventsByDate = useMemo(() => {
    const map = new Map<
      string,
      (CalendarEventResponse & { occurrence: { start: string; end: string } })[]
    >();
    events.forEach((event) => {
      event.occurrences.forEach((occurrence) => {
        const dateKey = new Date(occurrence.start).toISOString().split("T")[0];
        if (!map.has(dateKey)) map.set(dateKey, []);
        map.get(dateKey)?.push({ ...event, occurrence });
      });
    });
    return map;
  }, [events]);

  const dateGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    if (view === "monthly") {
      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);
      const daysInMonth = Array.from(
        { length: lastDayOfMonth.getDate() },
        (_, i) => new Date(year, month, i + 1)
      );
      const startingDayOfWeek = firstDayOfMonth.getDay();
      return Array(startingDayOfWeek).fill(null).concat(daysInMonth);
    }

    if (view === "weekly") {
      const firstDayOfWeek = new Date(currentDate);
      firstDayOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      return Array.from({ length: 7 }, (_, i) => {
        const day = new Date(firstDayOfWeek);
        day.setDate(day.getDate() + i);
        return day;
      });
    }

    if (view === "daily") return [new Date(currentDate)];
    return [];
  }, [currentDate, view]);

  useEffect(() => {
    const initialView = getInitialView();
    setView(initialView);
    setIsInitialLoad(false);
  }, []);

  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem("calendarView", view);
    }
  }, [view, isInitialLoad]);

  useEffect(() => {
    if (!isInitialLoad) {
      loadEvents();
    }
  }, [currentDate, isInitialLoad]);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const datesToFetch = [
        new Date(year, month - 1, 1),
        new Date(year, month, 1),
        new Date(year, month + 1, 1),
      ];

      const eventPromises = datesToFetch.map((date) =>
        eventsService.getCalendarEvents(date.getFullYear(), date.getMonth() + 1)
      );

      const eventsArrays = await Promise.all(eventPromises);
      const allEvents = eventsArrays.flat();

      const eventsMap = new Map<number, CalendarEventResponse>();
      allEvents.forEach((event) => {
        if (eventsMap.has(event.id)) {
          const existingEvent = eventsMap.get(event.id)!;
          const existingOccurrences = new Set(
            existingEvent.occurrences.map((o) => o.start)
          );
          event.occurrences.forEach((newOccurrence) => {
            if (!existingOccurrences.has(newOccurrence.start))
              existingEvent.occurrences.push(newOccurrence);
          });
        } else {
          eventsMap.set(event.id, {
            ...event,
            occurrences: [...event.occurrences],
          });
        }
      });

      setEvents(Array.from(eventsMap.values()));
    } catch (err) {
      console.error("Erro ao carregar eventos:", err);
      setError("Não foi possível carregar os eventos.");
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    const amount = direction === "prev" ? -1 : 1;
    if (view === "monthly") newDate.setMonth(newDate.getMonth() + amount, 1);
    else if (view === "weekly") newDate.setDate(newDate.getDate() + 7 * amount);
    else newDate.setDate(newDate.getDate() + amount);
    setCurrentDate(newDate);
  };

  const getHeaderText = () => {
    if (view === "monthly")
      return currentDate
        .toLocaleString("pt-BR", { month: "long", year: "numeric" })
        .toUpperCase();
    if (view === "weekly") {
      const startOfWeek = dateGrid[0] as Date;
      const endOfWeek = dateGrid[6] as Date;
      if (!startOfWeek || !endOfWeek) return "";
      const startMonth = startOfWeek.toLocaleString("pt-BR", {
        month: "short",
      });
      const endMonth = endOfWeek.toLocaleString("pt-BR", { month: "short" });
      if (startMonth === endMonth)
        return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} de ${endMonth}. de ${endOfWeek.getFullYear()}`;
      return `${startOfWeek.getDate()} de ${startMonth} - ${endOfWeek.getDate()} de ${endMonth} de ${endOfWeek.getFullYear()}`;
    }
    return currentDate.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEventId(null);
  };

  const handleModalClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node))
      handleCloseModal();
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
      eventType: EventType.General,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = async (eventId: number, occurrenceDate: Date) => {
    setEditingEventId(eventId);
    setFormLoading(true);
    setShowModal(true);
    try {
      const eventData: any = await eventsService.getEventById(eventId);
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
        eventType: eventData.eventType ?? EventType.General,
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
      eventType: Number(formData.eventType),
      worshipTheme: formData.worshipTheme || "",
    };

    try {
      if (editingEventId)
        await eventsService.updateEvent(
          editingEventId,
          commonPayload as EventUpdateRequest
        );
      else await eventsService.createEvent(commonPayload);
      handleCloseModal();
      loadEvents();
    } catch (err) {
      setError("Não foi possível salvar o evento.");
    } finally {
      setFormLoading(false);
    }
  };

  const ViewSwitcher = () => (
    <div className="flex bg-gray-200 rounded-lg p-1">
      {(["monthly", "weekly", "daily"] as CalendarView[]).map((viewName) => (
        <button
          key={viewName}
          onClick={() => setView(viewName)}
          className={`px-4 py-1 text-sm font-semibold rounded-md transition-colors capitalize ${
            view === viewName
              ? "bg-white text-blue-600 shadow"
              : "text-gray-600 hover:bg-gray-300"
          }`}
        >
          {viewName === "monthly"
            ? "Mês"
            : viewName === "weekly"
            ? "Semana"
            : "Dia"}
        </button>
      ))}
    </div>
  );

  const MonthlyView = () => (
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
          className="text-center font-semibold text-gray-600 py-3 bg-gray-50 border-b border-r border-gray-200 text-sm"
        >
          {day}
        </div>
      ))}
      {(dateGrid as (Date | null)[]).map((day, index) => {
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
                  className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-md cursor-pointer hover:bg-blue-600 whitespace-nowrap overflow-hidden text-ellipsis"
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
  );

  const AgendaView = ({ days }: { days: Date[] }) => (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
      <div className="divide-y divide-gray-200">
        {days.map((day) => {
          const dateKey = day.toISOString().split("T")[0];
          const dayEvents = eventsByDate.get(dateKey) || [];
          return (
            <div
              key={dateKey}
              className="p-4 hover:bg-blue-50 transition-colors cursor-pointer"
              onClick={() => handleOpenCreateModal(day)}
            >
              <h3 className="font-bold text-blue-700 mb-2">
                {day.toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </h3>
              {dayEvents.length > 0 ? (
                <div className="space-y-2">
                  {dayEvents
                    .sort(
                      (a, b) =>
                        new Date(a.occurrence.start).getTime() -
                        new Date(b.occurrence.start).getTime()
                    )
                    .map((event, eventIndex) => (
                      <div
                        key={`${event.id}-${eventIndex}`}
                        className="flex items-center bg-gray-100 p-3 rounded-lg cursor-pointer hover:bg-gray-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(event.id, day);
                        }}
                      >
                        <span className="font-bold text-gray-800 mr-4 w-16">
                          {new Date(event.occurrence.start).toLocaleTimeString(
                            "pt-BR",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {event.title}
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 italic px-3">
                  Nenhum evento agendado.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 font-sans">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex items-center">
          <button
            onClick={() => handleNavigate("prev")}
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
          <h1 className="text-xl font-bold text-gray-800 mx-4 text-center min-w-[280px]">
            {getHeaderText()}
          </h1>
          <button
            onClick={() => handleNavigate("next")}
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
        <div className="flex items-center gap-4">
          <ViewSwitcher />
          <button
            onClick={() => handleOpenCreateModal(currentDate)}
            className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            Criar Evento
          </button>
        </div>
      </div>

      {error && (
        <p className="text-center text-red-500 bg-red-100 p-3 rounded-lg mb-4">
          {error}
        </p>
      )}

      {loading ? (
        <div className="text-center p-10 font-semibold text-gray-500">
          Carregando Calendário...
        </div>
      ) : (
        <div>
          {view === "monthly" && <MonthlyView />}
          {(view === "weekly" || view === "daily") && (
            <AgendaView days={dateGrid as Date[]} />
          )}
        </div>
      )}

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
                      Tipo de Evento
                    </label>
                    <select
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={EventType.General}>Geral</option>
                      <option value={EventType.WorshipService}>Culto</option>
                      <option value={EventType.Meeting}>Reunião</option>
                    </select>
                  </div>

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

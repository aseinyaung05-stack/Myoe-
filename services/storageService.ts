
import { VoiceNote, Report, User } from "../types";

const STORAGE_KEYS = {
  NOTES: 'mm_ai_notes_',
  REPORTS: 'mm_ai_reports_',
  USER: 'mm_ai_current_user'
};

export const getNotes = (userId: string): VoiceNote[] => {
  const data = localStorage.getItem(`${STORAGE_KEYS.NOTES}${userId}`);
  return data ? JSON.parse(data) : [];
};

export const saveNote = (note: VoiceNote) => {
  const notes = getNotes(note.userId);
  const updated = [note, ...notes];
  localStorage.setItem(`${STORAGE_KEYS.NOTES}${note.userId}`, JSON.stringify(updated));
};

export const deleteNote = (userId: string, noteId: string) => {
  const notes = getNotes(userId);
  const updated = notes.filter(n => n.id !== noteId);
  localStorage.setItem(`${STORAGE_KEYS.NOTES}${userId}`, JSON.stringify(updated));
};

export const getReports = (userId: string): Report[] => {
  const data = localStorage.getItem(`${STORAGE_KEYS.REPORTS}${userId}`);
  return data ? JSON.parse(data) : [];
};

export const saveReport = (report: Report) => {
  const reports = getReports(report.userId);
  const updated = [report, ...reports];
  localStorage.setItem(`${STORAGE_KEYS.REPORTS}${report.userId}`, JSON.stringify(updated));
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.USER);
  return data ? JSON.parse(data) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
};

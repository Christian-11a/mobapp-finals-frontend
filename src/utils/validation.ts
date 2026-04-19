// ─── Validation Utilities ─────────────────────────────────────────────────────
import { VALIDATION } from '../constants';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (value: string): string | null => {
  if (!value.trim()) return VALIDATION.EMAIL_REQUIRED;
  if (!EMAIL_REGEX.test(value.trim())) return VALIDATION.EMAIL_INVALID;
  return null;
};

export const validatePassword = (value: string): string | null => {
  if (!value) return VALIDATION.PASSWORD_REQUIRED;
  return null;
};

export const validateRegisterPassword = (value: string): string | null => {
  if (!value) return VALIDATION.PASSWORD_REQUIRED;
  if (value.length < 8) return VALIDATION.PASSWORD_MIN_LENGTH;
  if (!/[A-Z]/.test(value)) return VALIDATION.PASSWORD_UPPERCASE;
  if (!/[0-9]/.test(value)) return VALIDATION.PASSWORD_NUMBER;
  return null;
};

export const validateConfirmPassword = (password: string, confirm: string): string | null => {
  if (!confirm) return VALIDATION.CONFIRM_PASSWORD_REQUIRED;
  if (confirm !== password) return VALIDATION.CONFIRM_PASSWORD_MISMATCH;
  return null;
};

export const validateFirstName = (value: string): string | null => {
  if (!value.trim()) return VALIDATION.FIRST_NAME_REQUIRED;
  if (value.trim().length < 2) return VALIDATION.FIRST_NAME_MIN;
  return null;
};

export const validateLastName = (value: string): string | null => {
  if (!value.trim()) return VALIDATION.LAST_NAME_REQUIRED;
  if (value.trim().length < 2) return VALIDATION.LAST_NAME_MIN;
  return null;
};

export const validatePhone = (value: string): string | null => {
  if (!value.trim()) return VALIDATION.PHONE_REQUIRED;
  if (!/^09\d{9}$/.test(value.trim())) return VALIDATION.PHONE_INVALID;
  return null;
};

export const validateCheckInDate = (value: string): string | null => {
  if (!value) return VALIDATION.CHECK_IN_REQUIRED;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (new Date(value) < today) return VALIDATION.CHECK_IN_PAST;
  return null;
};

export const validateCheckOutDate = (checkIn: string, checkOut: string): string | null => {
  if (!checkOut) return VALIDATION.CHECK_OUT_REQUIRED;
  if (new Date(checkOut) <= new Date(checkIn)) return VALIDATION.CHECK_OUT_BEFORE_CHECK_IN;
  return null;
};

export const validateGuestCount = (count: number, maxPeople: number): string | null => {
  if (count < 1) return VALIDATION.GUEST_COUNT_MIN;
  if (count > maxPeople) return VALIDATION.GUEST_COUNT_MAX;
  return null;
};

export const validateRoomPrice = (value: number): string | null => {
  if (!value || value <= 0) return VALIDATION.ROOM_PRICE_POSITIVE;
  return null;
};

export const validateRoomTitle = (value: string): string | null => {
  if (!value.trim()) return VALIDATION.ROOM_TITLE_REQUIRED;
  if (value.trim().length < 3) return VALIDATION.ROOM_TITLE_MIN;
  return null;
};

export const validateReviewRating = (rating: number): string | null => {
  if (!rating || rating < 1 || rating > 5) return VALIDATION.REVIEW_RATING_REQUIRED;
  return null;
};

export const validateReviewText = (value: string): string | null => {
  if (!value.trim()) return VALIDATION.REVIEW_TEXT_REQUIRED;
  if (value.trim().length < 10) return VALIDATION.REVIEW_TEXT_MIN;
  return null;
};

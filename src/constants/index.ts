// ─── Admin Credentials ────────────────────────────────────────────────────────
export const ADMIN_EMAIL = 'admin@hotel.com';
export const ADMIN_PASSWORD = 'Admin123!';

// ─── Validation Messages ──────────────────────────────────────────────────────
export const VALIDATION = {
  // Email
  EMAIL_REQUIRED: 'Email is required.',
  EMAIL_INVALID: 'Please enter a valid email address.',

  // Password (login)
  PASSWORD_REQUIRED: 'Password is required.',

  // Password (register)
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters.',
  PASSWORD_UPPERCASE: 'Password must contain at least one uppercase letter.',
  PASSWORD_NUMBER: 'Password must contain at least one number.',

  // Confirm password
  CONFIRM_PASSWORD_REQUIRED: 'Please confirm your password.',
  CONFIRM_PASSWORD_MISMATCH: 'Passwords do not match.',

  // Name
  FIRST_NAME_REQUIRED: 'First name is required.',
  FIRST_NAME_MIN: 'First name must be at least 2 characters.',
  LAST_NAME_REQUIRED: 'Last name is required.',
  LAST_NAME_MIN: 'Last name must be at least 2 characters.',
  PHONE_REQUIRED: 'Phone number is required.',
  PHONE_INVALID: 'Enter a valid PH mobile number (e.g., 09123456789).',

  // Dates
  CHECK_IN_REQUIRED: 'Check-in date is required.',
  CHECK_IN_PAST: 'Check-in date cannot be in the past.',
  CHECK_OUT_REQUIRED: 'Check-out date is required.',
  CHECK_OUT_BEFORE_CHECK_IN: 'Check-out date must be after check-in date.',

  // Guests
  GUEST_COUNT_MIN: 'At least 1 guest is required.',
  GUEST_COUNT_MAX: 'Exceeds maximum allowed guests for this room.',

  // Room (admin)
  ROOM_PRICE_POSITIVE: 'Price must be a positive number.',
  ROOM_TITLE_REQUIRED: 'Room title is required.',
  ROOM_TITLE_MIN: 'Room title must be at least 3 characters.',

  // Review
  REVIEW_RATING_REQUIRED: 'Please select a rating (1–5 stars).',
  REVIEW_TEXT_REQUIRED: 'Review text is required.',
  REVIEW_TEXT_MIN: 'Review must be at least 10 characters.',

  // Booking conflicts
  DUPLICATE_EMAIL: 'An account with this email already exists.',
  DOUBLE_BOOKING: 'This room is already booked for the selected dates.',
  CANCEL_ALREADY_CANCELLED: 'This booking is already cancelled.',
  REVIEW_ALREADY_EXISTS: 'You have already reviewed this booking.',

  // Auth
  INVALID_CREDENTIALS: 'Invalid email or password.',
  LOGIN_SUCCESS: 'Welcome back!',
  REGISTER_SUCCESS: 'Account created successfully!',
  LOGOUT_SUCCESS: 'You have been logged out.',

  // Generic
  BOOKING_SUCCESS: 'Booking confirmed!',
  BOOKING_CANCELLED: 'Booking cancelled.',
  BOOKING_RESCHEDULED: 'Booking rescheduled successfully.',
  REVIEW_SUBMITTED: 'Review submitted. Thank you!',
  REVIEW_DELETED: 'Review deleted.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  WRONG_CURRENT_PASSWORD: 'Current password is incorrect.',
};

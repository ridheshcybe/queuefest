// lib/middleware/auth.js
// No authentication – always returns a default user

const DEFAULT_USER = {
  id: 1,
  email: 'demo@clinic.com',
  clinicName: 'Demo Clinic',
};

export async function withAuth(request) {
  // Return a fake user – no token needed
  return { user: DEFAULT_USER, decoded: { userId: 1 } };
}
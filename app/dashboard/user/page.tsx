import { requireRole } from '@/lib/auth';
import DashboardClient from '../DashboardClient';

export default async function UserDashboard() {
  // Ensure only users can access this dashboard
  await requireRole(['user']);

  return <DashboardClient />;
}
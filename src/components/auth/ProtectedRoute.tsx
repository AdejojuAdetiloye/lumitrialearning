import { Navigate, useLocation } from "react-router-dom";
import { useAuth, type AppRole } from "@/contexts/AuthContext";

export function ProtectedRoute({
  children,
  role,
  roles,
}: {
  children: React.ReactNode;
  /** Single allowed role (legacy). */
  role?: AppRole;
  /** One of these roles may access the route. */
  roles?: AppRole[];
}) {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: loc }} replace />;
  }
  if (roles && roles.length > 0) {
    if (!roles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  } else if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

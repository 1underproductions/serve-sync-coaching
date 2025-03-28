
import { ReactNode } from "react";
import Navbar from "./Navbar";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-6">{children}</main>
      <footer className="bg-muted py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ServeSync. All rights reserved.</p>
          <p className="mt-1">Professional Tennis Coaching Management Platform</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

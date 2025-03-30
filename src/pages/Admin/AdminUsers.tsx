
import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Search, UserCheck, UserX, Shield, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

// Mock user data for demonstration
const mockUsers = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "user", status: "active", joinDate: "Jul 15, 2023" },
  { id: 2, name: "Sarah Williams", email: "sarah@example.com", role: "user", status: "active", joinDate: "Aug 2, 2023" },
  { id: 3, name: "Michael Johnson", email: "michael@example.com", role: "user", status: "inactive", joinDate: "Jun 10, 2023" },
  { id: 4, name: "Emma Brown", email: "emma@example.com", role: "user", status: "active", joinDate: "Sep 5, 2023" },
  { id: 5, name: "Admin User", email: "admin@example.com", role: "admin", status: "active", joinDate: "Jan 1, 2023" },
];

const AdminUsers = () => {
  const [users, setUsers] = useState(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStatusChange = (userId: number, newStatus: "active" | "inactive") => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, status: newStatus } : user
      )
    );
    
    toast({
      title: "User status updated",
      description: `User ${userId} is now ${newStatus}`,
    });
  };

  const handleRoleChange = (userId: number, newRole: "user" | "admin") => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
    
    toast({
      title: "User role updated",
      description: `User ${userId} is now an ${newRole}`,
    });
  };

  return (
    <AdminLayout>
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search users..."
                className="pl-10"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <Button>
              <User className="h-4 w-4 mr-2" />
              Add New User
            </Button>
          </div>

          <div className="rounded-md border">
            <div className="grid grid-cols-12 bg-muted p-4 font-medium">
              <div className="col-span-4">User</div>
              <div className="col-span-2 text-center">Role</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-2">Joined</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="grid grid-cols-12 p-4 border-t items-center"
                >
                  <div className="col-span-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-tennis-green-100 flex items-center justify-center mr-3">
                        <span className="font-medium text-tennis-green-800">
                          {user.name.split(" ").map((n) => n[0]).join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 text-center">
                    {user.role === "admin" ? (
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-tennis-green-100 text-tennis-green-800">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </div>
                    ) : (
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <User className="h-3 w-3 mr-1" />
                        User
                      </div>
                    )}
                  </div>
                  <div className="col-span-2 text-center">
                    {user.status === "active" ? (
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <UserCheck className="h-3 w-3 mr-1" />
                        Active
                      </div>
                    ) : (
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <UserX className="h-3 w-3 mr-1" />
                        Inactive
                      </div>
                    )}
                  </div>
                  <div className="col-span-2 text-sm">{user.joinDate}</div>
                  <div className="col-span-2 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View profile</DropdownMenuItem>
                        <DropdownMenuItem>Send message</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleRoleChange(user.id, user.role === "admin" ? "user" : "admin")}>
                          {user.role === "admin" ? "Remove admin role" : "Make admin"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(user.id, user.status === "active" ? "inactive" : "active")}>
                          {user.status === "active" ? "Deactivate user" : "Activate user"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No users found matching your search criteria
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminUsers;

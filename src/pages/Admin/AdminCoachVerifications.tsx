
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, CheckCircle, XCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCoachVerifications } from "@/hooks/useCoachVerifications";
import { useState } from "react";

const AdminCoachVerifications = () => {
  const { verifications, isLoading, updateVerification } = useCoachVerifications();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState<string>("");

  if (isLoading) {
    return (
      <AdminLayout title="Coach Verifications">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-tennis-green-600"></div>
        </div>
      </AdminLayout>
    );
  }

  const filteredVerifications =
    verifications?.filter(
      (v: any) =>
        v.coach?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        v.coach?.email?.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

  return (
    <AdminLayout
      title="Coach Verifications"
      description="View and manage coach verification status"
    >
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="relative w-full md:w-64">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search coaches..."
                className="pl-3"
              />
            </div>
          </div>
          <div className="overflow-x-auto rounded-md border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left">Coach</th>
                  <th className="px-6 py-3 text-center">Verified</th>
                  <th className="px-6 py-3 text-center">Documents</th>
                  <th className="px-6 py-3">Notes</th>
                  <th className="px-6 py-3">Last Updated</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVerifications.length > 0 ? (
                  filteredVerifications.map((v: any) => (
                    <tr key={v.id} className="border-t hover:bg-muted/40">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {v.coach?.avatar_url ? (
                            <img
                              src={v.coach.avatar_url}
                              alt={v.coach.full_name || "Coach"}
                              className="h-10 w-10 rounded-full mr-3"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-tennis-green-100 flex items-center justify-center mr-3">
                              <Shield className="text-tennis-green-800" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">
                              {v.coach?.full_name || "N/A"}
                            </div>
                            <div className="text-xs text-muted-foreground">{v.coach?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {v.is_verified ? (
                          <span className="inline-flex items-center text-green-700">
                            <CheckCircle className="h-5 w-5 mr-1" /> Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-red-700">
                            <XCircle className="h-5 w-5 mr-1" /> No
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {v.documents_submitted ? (
                          <span className="text-green-600 font-medium">Submitted</span>
                        ) : (
                          <span className="text-gray-400">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {editingId === v.id ? (
                          <div className="flex items-center space-x-2">
                            <Input
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              className="w-48"
                            />
                            <Button
                              size="sm"
                              onClick={() => {
                                updateVerification.mutate({
                                  id: v.id,
                                  is_verified: v.is_verified,
                                  notes: editNotes,
                                });
                                setEditingId(null);
                              }}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            <span>{v.notes || <span className="italic text-gray-400">No notes</span>}</span>
                            <Button
                              size="xs"
                              variant="ghost"
                              className="ml-2"
                              onClick={() => {
                                setEditingId(v.id);
                                setEditNotes(v.notes || "");
                              }}
                            >
                              Edit
                            </Button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {v.updated_at
                          ? new Date(v.updated_at).toLocaleString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant={v.is_verified ? "secondary" : "success"}
                          size="sm"
                          className="mr-2"
                          onClick={() =>
                            updateVerification.mutate({
                              id: v.id,
                              is_verified: !v.is_verified,
                            })
                          }
                        >
                          {v.is_verified ? "Revoke" : "Verify"}
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-6 py-8 text-center text-muted-foreground" colSpan={6}>
                      No coach verifications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminCoachVerifications;

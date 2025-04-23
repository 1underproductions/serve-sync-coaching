
import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { ArticleEditor } from "@/components/admin/blog/ArticleEditor";
import { ArticleList } from "@/components/admin/blog/ArticleList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AdminContent() {
  const [showEditor, setShowEditor] = useState(false);

  return (
    <AdminLayout 
      title="Content Library" 
      description="Manage blog articles and content"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button
            onClick={() => setShowEditor(!showEditor)}
          >
            {showEditor ? (
              "View Articles"
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                New Article
              </>
            )}
          </Button>
        </div>

        {showEditor ? (
          <ArticleEditor />
        ) : (
          <ArticleList />
        )}
      </div>
    </AdminLayout>
  );
}

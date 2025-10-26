import AuthGuardProvider from "@/app/_providers/auth-guard-provider";
import { ArticleEditorForm } from "./article-editor-form";

export default async function ArticleCreatePage() {
  return (
    <AuthGuardProvider>
      <ArticleEditorForm />
    </AuthGuardProvider>
  );
}

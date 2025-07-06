import { useWorkspaceModal } from "@/hooks/use-workspace-modal";

import Modal from "@/components/ui/modal";

export default function CreateWorkspaceModal() {
  const workspaceModal = useWorkspaceModal();

  return (
    <Modal
      title="Create Workspace"
      description="Create your workspace or organize"
      isOpen={workspaceModal.isOpen}
      onClose={workspaceModal.onClose}
    >
      Create You workspace
    </Modal>
  );
}

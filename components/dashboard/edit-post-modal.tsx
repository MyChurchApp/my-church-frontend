"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface EditPostModalProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  editPostContent: string
  setEditPostContent: (content: string) => void
  isSavingEdit: boolean
  handleSaveEdit: () => void
}

export function EditPostModal({
  isOpen,
  setIsOpen,
  editPostContent,
  setEditPostContent,
  isSavingEdit,
  handleSaveEdit,
}: EditPostModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Publicação</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Textarea
              placeholder="Edite sua publicação..."
              value={editPostContent}
              onChange={(e) => setEditPostContent(e.target.value)}
              rows={5}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSaveEdit} disabled={isSavingEdit || !editPostContent.trim()}>
            {isSavingEdit ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

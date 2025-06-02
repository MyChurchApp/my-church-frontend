"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface DeletePostDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  isDeletingPost: boolean
  confirmDeletePost: () => void
}

export function DeletePostDialog({ isOpen, setIsOpen, isDeletingPost, confirmDeletePost }: DeletePostDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Tem certeza que deseja excluir esta publicação? Esta ação não pode ser desfeita.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={confirmDeletePost} disabled={isDeletingPost}>
            {isDeletingPost ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

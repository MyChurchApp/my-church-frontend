"use client"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LogIn, UserPlus } from "lucide-react"

interface AccountCheckModalProps {
  isOpen: boolean
  onClose: () => void
  planoId: string
}

export function AccountCheckModal({ isOpen, onClose, planoId }: AccountCheckModalProps) {
  const router = useRouter()

  const handleLogin = () => {
    router.push(`/login?plano=${planoId}&redirect=checkout`)
    onClose()
  }

  const handleSignup = () => {
    router.push(`/cadastro?plano=${planoId}`)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Já possui uma conta?</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Para continuar com o plano selecionado, informe se você já possui uma conta no MyChurch
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 py-4 sm:grid-cols-2">
          <div className="flex flex-col items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium">Já tenho conta</h3>
            <p className="text-sm text-muted-foreground text-center">Faça login para continuar com sua assinatura</p>
            <Button className="w-full mt-2" onClick={handleLogin}>
              Fazer login
            </Button>
          </div>

          <div className="flex flex-col items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium">Sou novo aqui</h3>
            <p className="text-sm text-muted-foreground text-center">Crie uma conta para começar a usar o MyChurch</p>
            <Button className="w-full mt-2" onClick={handleSignup}>
              Criar conta
            </Button>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-center gap-2">
          <Button variant="ghost" onClick={onClose}>
            Voltar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

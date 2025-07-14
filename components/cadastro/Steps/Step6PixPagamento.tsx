"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CopyIcon } from "lucide-react";
import Link from "next/link";

export function Step6_PixPagamento({ pixCheckout }: { pixCheckout: any }) {
  if (!pixCheckout) return <p>Erro ao carregar dados do PIX.</p>;

  return (
    <Card className="shadow-lg max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">
          Realize o Pagamento
        </CardTitle>
        <CardDescription className="text-base">
          Escaneie o QR Code ou use o Copia e Cola para ativar sua conta.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        {pixCheckout.pixQrCode && (
          <div className="flex justify-center">
            <img
              src={pixCheckout.pixQrCode}
              alt="QR Code PIX"
              className="w-64 h-64 rounded-lg"
            />
          </div>
        )}
        {pixCheckout.payload && (
          <div>
            <label className="text-sm font-medium">
              Chave PIX (Copia e Cola)
            </label>
            <div className="relative mt-2">
              <Input
                value={pixCheckout.payload}
                readOnly
                className="pr-12 h-11"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-9 w-9"
                onClick={() =>
                  navigator.clipboard.writeText(pixCheckout.payload)
                }
              >
                <CopyIcon />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-800/50 p-6">
        <Button asChild size="lg" className="w-full">
          <Link href="/login">Já Paguei, Ir para o Login</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PartyPopperIcon } from "lucide-react";
import Link from "next/link";

export function Step5_Confirmacao() {
  return (
    <Card className="text-center p-10">
      <CardContent>
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <PartyPopperIcon className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold">Cadastro Realizado!</h1>
        <p className="text-lg text-muted-foreground mt-4">
          Sua conta foi criada com sucesso. Seja bem-vindo(a) ao MyChurch!
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/login">Acessar Plataforma</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

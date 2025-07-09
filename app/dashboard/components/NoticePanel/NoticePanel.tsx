"use client";

import React, { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { worshipService } from "@/services/worship/worship";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, X, Image as ImageIcon } from "lucide-react";

export default function NoticePanel({ worshipId }: { worshipId: number }) {
  const [message, setMessage] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: sendNotice, isPending } = useMutation({
    mutationFn: () => {
      if (!message.trim()) throw new Error("A mensagem não pode estar vazia.");
      return worshipService.sendAdminNotice(worshipId, {
        message,
        imageBase64,
      });
    },
    onSuccess: () => {
      setMessage("");
      setImageBase64(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      alert("Aviso enviado com sucesso!");
    },
    onError: (err: any) => alert(`Erro ao enviar aviso: ${err.message}`),
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        // Limite de 2MB
        alert("A imagem é muito grande. O tamanho máximo é de 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageBase64((reader.result as string).split(",")[1]);
      };
      reader.onerror = () => alert("Não foi possível carregar a imagem.");
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Card className="border-0 shadow-none bg-transparent max-w-2xl mx-auto">
      <CardHeader className="px-1 pt-1">
        <CardTitle>Enviar Aviso Geral</CardTitle>
        <CardDescription>
          A mensagem e a imagem serão exibidas para todos que acompanham o
          culto.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-1 mt-4 space-y-4">
        <div className="grid w-full gap-1.5">
          <Label htmlFor="notice-message">Mensagem</Label>
          <Textarea
            id="notice-message"
            placeholder="Digite seu aviso aqui..."
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isPending}
            className="bg-white dark:bg-gray-900/50"
          />
        </div>

        {!imagePreview && (
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="picture">Anexar Imagem (Opcional)</Label>
            <Input
              id="picture"
              type="file"
              accept="image/png, image/jpeg"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={isPending}
              className="bg-white dark:bg-gray-900/50"
            />
          </div>
        )}

        {imagePreview && (
          <div className="relative w-full border rounded-lg p-2 bg-white dark:bg-gray-900/50">
            <img
              src={imagePreview}
              alt="Pré-visualização"
              className="w-full h-auto max-h-60 object-contain rounded-md"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-md"
              onClick={removeImage}
              disabled={isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-1 mt-4">
        <Button
          onClick={() => sendNotice()}
          disabled={!message.trim() || isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Send className="mr-2 h-5 w-5" />
          )}
          Enviar Aviso
        </Button>
      </CardFooter>
    </Card>
  );
}

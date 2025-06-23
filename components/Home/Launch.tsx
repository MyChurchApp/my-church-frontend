"use client";
import { useState, useEffect, useRef, useId } from "react";
import AOS from "aos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Countdown from "./Countdown";
import { useMutation } from "@tanstack/react-query";
import {
  preLaunchRegister,
  PreLaunchRegisterPayload,
} from "@/services/home/prelaunch";

function SuccessModal({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    const closeButton = modalRef.current?.querySelector("button");
    if (closeButton) {
      closeButton.focus();
    }

    const originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalBodyOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-gray-900 border border-green-500/50 rounded-lg p-8 m-4 max-w-sm w-full text-center shadow-2xl shadow-green-500/10"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-modal-title"
      >
        {children}
      </div>
    </div>
  );
}

export default function CountdownSection() {
  const formId = useId();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 50,
    });
  }, []);

  const [form, setForm] = useState<PreLaunchRegisterPayload>({
    name: "",
    email: "",
    phone: "",
    churchName: "",
    churchRole: "",
    comments: "",
  });

  const {
    mutate: submitRegister,
    isPending,
    isSuccess,
    isError,
    error,
  } = useMutation({
    mutationFn: preLaunchRegister,
    onSuccess: () => {
      setIsModalOpen(true);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitRegister(form);
  };

  return (
    <>
      <section
        id="launch"
        className="py-20 sm:py-32 text-white overflow-hidden"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-black mb-3"
              data-aos="fade-up"
            >
              A Revolução Começa Em...
            </h2>
            <p
              className="text-lg text-blue-200 mb-12"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              Lançamento Oficial: 15 de Julho de 2025
            </p>

            <div data-aos="fade-up" data-aos-delay="200">
              <Countdown targetDate="2025-07-15T00:00:00" />
            </div>

            <div
              className="max-w-lg mx-auto"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <p className="text-blue-200 my-10">
                Seja o primeiro a saber. Inscreva-se para receber uma
                notificação exclusiva e vantagens no lançamento.
              </p>

              <form onSubmit={handleSubmit}>
                <fieldset
                  disabled={isPending || isSuccess}
                  className="flex flex-col gap-3"
                >
                  <legend className="sr-only">
                    Formulário de inscrição para o pré-lançamento
                  </legend>
                  <div>
                    <label htmlFor={`${formId}-name`} className="sr-only">
                      Seu nome
                    </label>
                    <Input
                      id={`${formId}-name`}
                      name="name"
                      placeholder="Seu nome"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="bg-white/10 text-white placeholder:text-blue-200 border-0 focus-visible:ring-white"
                    />
                  </div>
                  <div>
                    <label htmlFor={`${formId}-email`} className="sr-only">
                      O seu melhor e-mail
                    </label>
                    <Input
                      id={`${formId}-email`}
                      name="email"
                      type="email"
                      placeholder="O seu melhor e-mail"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="bg-white/10 text-white placeholder:text-blue-200 border-0 focus-visible:ring-white"
                    />
                  </div>
                  <div>
                    <label htmlFor={`${formId}-phone`} className="sr-only">
                      Telefone
                    </label>
                    <Input
                      id={`${formId}-phone`}
                      name="phone"
                      placeholder="Telefone"
                      value={form.phone}
                      onChange={handleChange}
                      className="bg-white/10 text-white placeholder:text-blue-200 border-0 focus-visible:ring-white"
                    />
                  </div>
                  <div>
                    <label htmlFor={`${formId}-churchName`} className="sr-only">
                      Nome da igreja
                    </label>
                    <Input
                      id={`${formId}-churchName`}
                      name="churchName"
                      placeholder="Nome da igreja"
                      value={form.churchName}
                      onChange={handleChange}
                      className="bg-white/10 text-white placeholder:text-blue-200 border-0 focus-visible:ring-white"
                    />
                  </div>
                  <div>
                    <label htmlFor={`${formId}-churchRole`} className="sr-only">
                      Seu cargo na igreja
                    </label>
                    <Input
                      id={`${formId}-churchRole`}
                      name="churchRole"
                      placeholder="Seu cargo na igreja"
                      value={form.churchRole}
                      onChange={handleChange}
                      className="bg-white/10 text-white placeholder:text-blue-200 border-0 focus-visible:ring-white"
                    />
                  </div>
                  <div>
                    <label htmlFor={`${formId}-comments`} className="sr-only">
                      Deixe um comentário
                    </label>
                    <textarea
                      id={`${formId}-comments`}
                      name="comments"
                      placeholder="Deixe um comentário (opcional)"
                      value={form.comments}
                      onChange={handleChange}
                      rows={3}
                      className="bg-white/10 text-white placeholder:text-blue-200 border-0 focus-visible:ring-white p-3 rounded-md w-full text-sm resize-none"
                    />
                  </div>
                </fieldset>

                <div className="mt-5 h-14">
                  <Button
                    type="submit"
                    className="w-full h-full bg-white text-blue-600 hover:bg-blue-100 py-3 text-base font-bold transition-all duration-300 disabled:opacity-50"
                    disabled={isPending || isSuccess}
                  >
                    {isPending ? "Enviando..." : "Quero ser notificado!"}
                  </Button>
                  {isError && (
                    <div
                      role="alert"
                      className="text-red-400 font-semibold text-center text-sm mt-2"
                    >
                      {error instanceof Error
                        ? error.message
                        : "Ocorreu um erro. Tente novamente."}
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <SuccessModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2
          id="success-modal-title"
          className="text-2xl font-bold text-green-400 mb-2"
        >
          Inscrição Confirmada!
        </h2>
        <p className="text-blue-200 mb-6">
          Você está na lista. Avisaremos assim que o lançamento oficial
          acontecer. Obrigado pelo seu apoio!
        </p>
        <Button
          onClick={() => setIsModalOpen(false)}
          className="bg-green-500 text-white hover:bg-green-600 w-full"
        >
          Fechar
        </Button>
      </SuccessModal>
    </>
  );
}

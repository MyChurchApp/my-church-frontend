"use client";

import type React from "react";
import { useState, useRef } from "react";
import {
  Heart,
  CreditCard,
  QrCode,
  CheckCircle,
  AlertCircle,
  Copy,
  Loader2,
  Clock,
  Wallet,
  User,
  Info,
} from "lucide-react";
import {
  DonationResponse,
  donationService,
} from "@/services/donation/donation.service";
import type { DonationFormData } from "@/containers/donation/useDonation";
import Link from "next/link";
import Image from "next/image";

const Alert = ({ children }: { children: React.ReactNode }) => (
  <div
    role="alert"
    className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center"
  >
    <AlertCircle className="h-6 w-6 mr-3 flex-shrink-0" />
    <span className="block sm:inline">{children}</span>
  </div>
);

interface DonationComponentProps {
  formData: DonationFormData;
  updateFormData: (field: string, value: any) => void;
  isLoading: boolean;
  error: string | null;
  success: DonationResponse | null;
  submitDonation: () => Promise<boolean>;
  resetForm: () => void;
  clearError: () => void;
  clearSuccess: () => void;
}

export function DonationComponent({
  formData,
  updateFormData,
  isLoading,
  error,
  success,
  submitDonation,
  resetForm,
  clearSuccess,
}: DonationComponentProps) {
  const [copiedPix, setCopiedPix] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isSuccess = await submitDonation();
    if (!isSuccess) {
      setTimeout(() => {
        formRef.current?.focus();
      }, 100);
    }
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = donationService.formatCardNumber(value);
    updateFormData("creditCard.number", formatted);
  };

  const handleCpfCnpjChange = (value: string) => {
    const formatted = donationService.formatCpfCnpj(value);
    updateFormData("creditCardHolderInfo.cpfCnpj", formatted);
  };

  const handleCepChange = (value: string) => {
    const formatted = donationService.formatCep(value);
    updateFormData("creditCardHolderInfo.postalCode", formatted);
  };

  const handlePhoneChange = (value: string) => {
    const formatted = value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d)(\d{4})$/, "$1-$2");
    updateFormData("creditCardHolderInfo.phone", formatted);
  };

  const copyPixCode = async () => {
    if (success?.pixQrCode?.payload) {
      try {
        await navigator.clipboard.writeText(success.pixQrCode.payload);
        setCopiedPix(true);
        setTimeout(() => setCopiedPix(false), 2000);
      } catch (err) {
        console.error("Erro ao copiar código PIX:", err);
      }
    }
  };

  const handleNewDonation = () => {
    clearSuccess();
    resetForm();
  };

  const translateStatus = (status: string) => {
    const statusTranslations: { [key: string]: string } = {
      PENDING: "Pendente",
      CONFIRMED: "Confirmado",
      RECEIVED: "Recebido",
      OVERDUE: "Vencido",
      REFUNDED: "Reembolsado",
      RECEIVED_IN_CASH: "Recebido em Dinheiro",
      REFUND_REQUESTED: "Reembolso Solicitado",
      REFUND_IN_PROGRESS: "Reembolso em Andamento",
      CHARGEBACK_REQUESTED: "Estorno Solicitado",
      CHARGEBACK_DISPUTE: "Disputa de Estorno",
      AWAITING_CHARGEBACK_REVERSAL: "Aguardando Reversão de Estorno",
      DUNNING_REQUESTED: "Cobrança Solicitada",
      DUNNING_RECEIVED: "Cobrança Recebida",
      AWAITING_RISK_ANALYSIS: "Aguardando Análise de Risco",
    };
    return statusTranslations[status] || status;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div
          aria-live="polite"
          className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl text-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-[#1d5991] mx-auto" />
          <h3 className="text-xl font-semibold mt-4 text-gray-800">
            Processando sua doação...
          </h3>
          <p className="text-gray-600 mt-2">
            Aguarde enquanto processamos sua doação.
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <main className="min-h-screen bg-[#f0f2f5] py-8 px-4 flex items-center justify-center">
        <div className="w-full max-w-lg lg:max-w-xl bg-white p-6 sm:p-10 rounded-2xl shadow-xl text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mt-4">
            Obrigado!
          </h2>
          <p className="text-gray-600 mt-2 mb-6">
            Sua doação foi registrada com sucesso.
          </p>
          <div className="mt-6 bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Valor da doação</p>
            <p className="text-3xl font-bold text-gray-900">
              R${" "}
              {Number(success.value || formData.value).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="text-left space-y-2 my-6 text-gray-700">
            <p>
              <span className="font-medium text-gray-800">Finalidade:</span>{" "}
              {success.description || formData.description}
            </p>
            <p>
              <span className="font-medium text-gray-800">Status:</span>{" "}
              {translateStatus(success.status)}
            </p>
          </div>
          {formData.billingType === "PIX" && success.pixQrCode && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-2xl font-semibold text-gray-800 flex items-center justify-center">
                <QrCode className="h-8 w-8 text-[#1d5991] mr-3" />
                Pague com PIX
              </h3>
              <p className="text-gray-600 mt-2">
                Escaneie o QR Code abaixo com o app do seu banco.
              </p>
              <div className="my-4 inline-block bg-white p-2 rounded-lg border">
                <Image
                  src={`data:image/png;base64,${success.pixQrCode.encodedImage}`}
                  alt="QR Code PIX para pagamento"
                  width={200}
                  height={200}
                />
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-2">Ou copie o código:</p>
                <p className="text-xs text-gray-800 break-all font-mono bg-white p-2 rounded border">
                  {success.pixQrCode.payload}
                </p>
                <button
                  onClick={copyPixCode}
                  className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200 ease-in-out flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1d5991]"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copiedPix ? "Copiado!" : "Copiar Código"}
                </button>
              </div>
              {success.pixQrCode.expirationDate && (
                <div className="flex items-center justify-center text-sm text-gray-500 mt-3">
                  <Clock className="h-4 w-4 mr-1.5" />
                  Válido até:{" "}
                  {donationService.formatExpirationDate(
                    success.pixQrCode.expirationDate
                  )}
                </div>
              )}
            </div>
          )}
          {formData.billingType === "CREDIT_CARD" && success.paymentLink && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-2xl font-semibold text-gray-800 flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-[#1d5991] mr-3" />
                Finalize o Pagamento
              </h3>
              <p className="text-gray-600 my-4">
                Para concluir sua doação, clique no botão abaixo para ser
                redirecionado para um ambiente de pagamento seguro.
              </p>
              <a
                href={success.paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#1d5991] hover:bg-[#164269] text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 ease-in-out shadow-lg transform hover:scale-105 inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1d5991]"
              >
                Ir para Pagamento Seguro
              </a>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t">
            <button
              onClick={handleNewDonation}
              className="flex-1 w-full bg-[#1d5991] hover:bg-[#164269] text-white font-bold py-3 rounded-lg transition-colors duration-300 ease-in-out shadow-lg transform hover:scale-105 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1d5991]"
            >
              <Heart className="h-5 w-5 mr-2" />
              Fazer Nova Doação
            </button>
            <Link href="/dashboard" className="flex-1">
              <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-lg transition-colors duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400">
                Voltar ao Início
              </button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#f0f2f5] flex items-center justify-center p-4 sm:p-6 md:p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg md:max-w-2xl lg:max-w-6xl lg:flex">
        <aside className="hidden lg:flex flex-col justify-center p-12 bg-[#1d5991] text-white rounded-l-2xl w-2/5 flex-shrink-0">
          <Heart className="h-16 w-16 mb-6 opacity-80" />
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Faça a Diferença Hoje
          </h1>
          <p className="opacity-80 leading-relaxed">
            Sua contribuição é fundamental para continuarmos nosso trabalho e
            impactar vidas. Agradecemos imensamente seu coração generoso e sua
            disposição em ajudar.
          </p>
        </aside>

        <div className="flex-1 p-6 sm:p-8 lg:p-12 lg:overflow-y-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center lg:hidden">
            Finalizar Doação
          </h2>

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="space-y-8"
            noValidate
            tabIndex={-1}
          >
            {error && <Alert>{error}</Alert>}

            <fieldset className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="text-2xl font-semibold text-gray-800 flex items-center w-full mb-4">
                <Wallet className="h-8 w-8 text-[#1d5991] mr-3 flex-shrink-0" />
                <span>Detalhes da Doação</span>
              </div>
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="value"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Valor da Doação *
                  </label>
                  <input
                    type="number"
                    id="value"
                    placeholder="R$ 0,00"
                    step="0.01"
                    min="1"
                    required
                    value={formData.value}
                    onChange={(e) => updateFormData("value", e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 transition-colors duration-200 ease-in-out focus:border-[#1d5991] focus:outline-none focus:ring-2 focus:ring-[#1d5991]/50"
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Finalidade da Doação *
                  </label>
                  <input
                    id="description"
                    placeholder="Ex: Dízimo, Oferta, Missões..."
                    required
                    value={formData.description}
                    onChange={(e) =>
                      updateFormData("description", e.target.value)
                    }
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 transition-colors duration-200 ease-in-out focus:border-[#1d5991] focus:outline-none focus:ring-2 focus:ring-[#1d5991]/50"
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="text-2xl font-semibold text-gray-800 flex items-center w-full mb-4">
                <CreditCard className="h-8 w-8 text-[#1d5991] mr-3 flex-shrink-0" />
                <span>Método de Pagamento</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center p-4 rounded-lg border-2 border-gray-300 has-[:checked]:border-[#1d5991] has-[:checked]:bg-blue-50 cursor-pointer flex-1 transition-colors duration-200 ease-in-out">
                  <input
                    type="radio"
                    name="billingType"
                    value="CREDIT_CARD"
                    checked={formData.billingType === "CREDIT_CARD"}
                    onChange={() =>
                      updateFormData("billingType", "CREDIT_CARD")
                    }
                    className="h-5 w-5 text-[#1d5991] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1d5991]"
                  />
                  <span className="ml-3 text-lg font-medium text-gray-700">
                    Cartão de Crédito
                  </span>
                </label>
                <label className="flex items-center p-4 rounded-lg border-2 border-gray-300 has-[:checked]:border-[#1d5991] has-[:checked]:bg-blue-50 cursor-pointer flex-1 transition-colors duration-200 ease-in-out">
                  <input
                    type="radio"
                    name="billingType"
                    value="PIX"
                    checked={formData.billingType === "PIX"}
                    onChange={() => updateFormData("billingType", "PIX")}
                    className="h-5 w-5 text-[#1d5991] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1d5991]"
                  />
                  <span className="ml-3 text-lg font-medium text-gray-700">
                    Pix
                  </span>
                </label>
              </div>
            </fieldset>

            {formData.billingType === "CREDIT_CARD" && (
              <div className="space-y-8">
                <fieldset className="p-6 bg-gradient-to-br from-blue-600 to-[#1d5991] rounded-xl shadow-lg text-white">
                  <div className="text-2xl font-semibold flex items-center w-full mb-4">
                    <CreditCard className="h-8 w-8 mr-3 flex-shrink-0" />
                    <span>Dados do Cartão</span>
                  </div>
                  <div>
                    <div>
                      <label
                        htmlFor="holderName"
                        className="block text-sm font-medium mb-1 opacity-90"
                      >
                        Nome no Cartão *
                      </label>
                      <input
                        type="text"
                        id="holderName"
                        placeholder="Nome como está no cartão"
                        autoComplete="cc-name"
                        required
                        value={formData.creditCard.holderName}
                        onChange={(e) =>
                          updateFormData(
                            "creditCard.holderName",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 rounded-lg border-2 border-transparent focus:border-blue-400 bg-white/20 placeholder-white/70 focus:bg-white focus:text-gray-900 transition-colors duration-200 ease-in-out focus:outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="cardNumber"
                        className="block text-sm font-medium mb-1 opacity-90"
                      >
                        Número do Cartão *
                      </label>
                      <input
                        type="text"
                        id="cardNumber"
                        placeholder="0000 0000 0000 0000"
                        autoComplete="cc-number"
                        required
                        maxLength={19}
                        value={formData.creditCard.number}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border-2 border-transparent focus:border-blue-400 bg-white/20 placeholder-white/70 focus:bg-white focus:text-gray-900 transition-colors duration-200 ease-in-out focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label
                          htmlFor="expiryMonth"
                          className="block text-sm font-medium mb-1 opacity-90"
                        >
                          Mês *
                        </label>
                        <input
                          type="text"
                          id="expiryMonth"
                          placeholder="MM"
                          autoComplete="cc-exp-month"
                          required
                          maxLength={2}
                          value={formData.creditCard.expiryMonth}
                          onChange={(e) =>
                            updateFormData(
                              "creditCard.expiryMonth",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 rounded-lg border-2 border-transparent focus:border-blue-400 bg-white/20 placeholder-white/70 focus:bg-white focus:text-gray-900 transition-colors duration-200 ease-in-out focus:outline-none"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="expiryYear"
                          className="block text-sm font-medium mb-1 opacity-90"
                        >
                          Ano *
                        </label>
                        <input
                          type="text"
                          id="expiryYear"
                          placeholder="AAAA"
                          autoComplete="cc-exp-year"
                          required
                          maxLength={4}
                          value={formData.creditCard.expiryYear}
                          onChange={(e) =>
                            updateFormData(
                              "creditCard.expiryYear",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 rounded-lg border-2 border-transparent focus:border-blue-400 bg-white/20 placeholder-white/70 focus:bg-white focus:text-gray-900 transition-colors duration-200 ease-in-out focus:outline-none"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="ccv"
                          className="block text-sm font-medium mb-1 opacity-90"
                        >
                          CCV *
                        </label>
                        <input
                          type="text"
                          id="ccv"
                          placeholder="000"
                          autoComplete="cc-csc"
                          required
                          maxLength={4}
                          value={formData.creditCard.ccv}
                          onChange={(e) =>
                            updateFormData("creditCard.ccv", e.target.value)
                          }
                          aria-describedby="ccv-description"
                          className="w-full px-4 py-3 rounded-lg border-2 border-transparent focus:border-blue-400 bg-white/20 placeholder-white/70 focus:bg-white focus:text-gray-900 transition-colors duration-200 ease-in-out focus:outline-none"
                        />
                        <p
                          id="ccv-description"
                          className="text-xs text-white/70 mt-1.5 flex items-center gap-1.5"
                        >
                          <Info size={14} /> 3 ou 4 dígitos.
                        </p>
                      </div>
                    </div>
                  </div>
                </fieldset>

                <fieldset className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
                  <div className="text-2xl font-semibold text-gray-800 flex items-center w-full mb-4">
                    <User className="h-8 w-8 text-[#1d5991] mr-3 flex-shrink-0" />
                    <span>Dados do Portador</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
                    <div className="md:col-span-2">
                      <label
                        htmlFor="holderInfoName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        id="holderInfoName"
                        placeholder="Nome completo"
                        autoComplete="name"
                        required
                        value={formData.creditCardHolderInfo.name}
                        onChange={(e) =>
                          updateFormData(
                            "creditCardHolderInfo.name",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 transition-colors duration-200 ease-in-out focus:border-[#1d5991] focus:outline-none focus:ring-2 focus:ring-[#1d5991]/50"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        placeholder="email@exemplo.com"
                        autoComplete="email"
                        required
                        value={formData.creditCardHolderInfo.email}
                        onChange={(e) =>
                          updateFormData(
                            "creditCardHolderInfo.email",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 transition-colors duration-200 ease-in-out focus:border-[#1d5991] focus:outline-none focus:ring-2 focus:ring-[#1d5991]/50"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="cpfCnpj"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        CPF/CNPJ *
                      </label>
                      <input
                        type="text"
                        id="cpfCnpj"
                        placeholder="000.000.000-00"
                        required
                        value={formData.creditCardHolderInfo.cpfCnpj}
                        onChange={(e) => handleCpfCnpjChange(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 transition-colors duration-200 ease-in-out focus:border-[#1d5991] focus:outline-none focus:ring-2 focus:ring-[#1d5991]/50"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Telefone *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        placeholder="(11) 99999-9999"
                        autoComplete="tel"
                        required
                        maxLength={15}
                        value={formData.creditCardHolderInfo.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 transition-colors duration-200 ease-in-out focus:border-[#1d5991] focus:outline-none focus:ring-2 focus:ring-[#1d5991]/50"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="postalCode"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        CEP *
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        placeholder="00000-000"
                        autoComplete="postal-code"
                        required
                        maxLength={9}
                        value={formData.creditCardHolderInfo.postalCode}
                        onChange={(e) => handleCepChange(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 transition-colors duration-200 ease-in-out focus:border-[#1d5991] focus:outline-none focus:ring-2 focus:ring-[#1d5991]/50"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="addressNumber"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Número do Endereço *
                      </label>
                      <input
                        type="text"
                        id="addressNumber"
                        placeholder="123"
                        required
                        value={formData.creditCardHolderInfo.addressNumber}
                        onChange={(e) =>
                          updateFormData(
                            "creditCardHolderInfo.addressNumber",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 transition-colors duration-200 ease-in-out focus:border-[#1d5991] focus:outline-none focus:ring-2 focus:ring-[#1d5991]/50"
                      />
                    </div>
                  </div>
                </fieldset>
              </div>
            )}

            <div className="flex flex-col gap-4 pt-4 border-t">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1d5991] hover:bg-[#164269] text-white font-bold py-3.5 text-lg rounded-lg transition-colors duration-300 ease-in-out shadow-lg transform hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1d5991]/50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />{" "}
                    Processando...
                  </>
                ) : (
                  "Confirmar Doação"
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={isLoading}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3.5 text-lg rounded-lg transition-colors duration-300 ease-in-out disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gray-400/50"
              >
                Limpar Formulário
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

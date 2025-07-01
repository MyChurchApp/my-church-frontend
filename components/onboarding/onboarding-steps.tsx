"use client";

import {
  User,
  Mail,
  Home,
  Lock,
  KeyRound,
  PartyPopper,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { StepContainer, SubmitButton } from "./ui-components";
import { brazilianStates } from "@/app/utils/UFs/uf";

// STEP 1: Identificação
interface Step1Props {
  onSubmit: (values: { identifier: string }) => void;
  state: any | null;
  churchId: string;
  loading?: boolean;
}
export const Step1_Identify = ({
  onSubmit,
  state,
  churchId,
  loading,
}: Step1Props) => {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const identifier = (e.currentTarget.identifier as HTMLInputElement).value;
    onSubmit({ identifier });
  }
  return (
    <StepContainer title="Bem-vindo(a)!" icon={<UserCheck />}>
      <form onSubmit={handleSubmit} className="w-full space-y-8">
        <div>
          <label
            htmlFor="identifier"
            className="block text-md font-semibold text-gray-700 mb-2 text-center"
          >
            Digite seu CPF, E-Mail ou Celular para iniciar o cadastro
          </label>
          <input
            id="identifier"
            type="text"
            name="identifier"
            placeholder="000.000.000-00"
            className="input-style w-full p-4 text-center text-xl tracking-wider border-2"
            required
          />
        </div>
        <input type="hidden" name="churchId" value={churchId} />
        <SubmitButton
          label="Continuar"
          className="w-full text-lg font-bold py-4 px-6 rounded-lg text-white shadow-lg
                     bg-[linear-gradient(45deg,rgba(30,64,175,.95),rgba(59,130,246,.95))]
                     hover:brightness-110 transform hover:-translate-y-1 transition-all duration-300"
          disabled={loading}
        />
        {state?.status === "error" && (
          <p className="error-message text-center">{state.message}</p>
        )}
      </form>
    </StepContainer>
  );
};

// STEP 2: Validação da data de nascimento
interface Step2Props {
  onSubmit: (values: { birthDate: string }) => void;
  state: any;
  identifier: string;
  loading: boolean;
}

export const Step2_Validate = ({
  onSubmit,
  state,
  identifier,
  loading,
}: Step2Props) => {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const birthDate = (
      e.currentTarget.elements.namedItem("birthDate") as HTMLInputElement
    ).value;
    onSubmit({ birthDate });
  }

  return (
    <StepContainer
      title={`Confirme sua data de nascimento`}
      icon={<UserCheck />}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input type="hidden" name="identifier" value={identifier} />
        <input type="date" name="birthDate" className="input-style" required />
        <button type="submit" className="button-primary" disabled={loading}>
          {loading ? "Validando..." : "Validar"}
        </button>
        {state?.status === "error" && (
          <p className="error-message">{state.message}</p>
        )}
      </form>
    </StepContainer>
  );
};

// STEP 3: Criação de senha
interface Step3Props {
  onSubmit: (values: { password: string }) => void;
  state: any | null;
  activationHash: string;
  loading?: boolean;
}
export const Step3_Password = ({
  onSubmit,
  state,
  activationHash,
  loading,
}: Step3Props) => {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = (e.currentTarget.password as HTMLInputElement).value;
    onSubmit({ password });
  }
  return (
    <StepContainer title="Crie sua Senha" icon={<KeyRound />}>
      <p className="mb-6 text-center text-gray-600">
        Escolha uma senha segura para o aplicativo.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="activationHash" value={activationHash} />
        <input
          type="password"
          name="password"
          placeholder="Senha"
          className="input-style"
          required
        />
        <SubmitButton label="Finalizar Cadastro" disabled={loading} />
        {state?.status === "error" && (
          <p className="error-message">{state.message}</p>
        )}
      </form>
    </StepContainer>
  );
};

// STEP 4: Sucesso
export const Step4_Success = () => (
  <StepContainer
    title="Cadastro Concluído!"
    icon={<PartyPopper className="text-green-500" />}
  >
    <p className="mb-6 text-center text-gray-600">
      Seja bem-vindo(a)! Seu acesso foi liberado.
    </p>
    <button
      onClick={() => {
        window.location.href = "/login";
      }}
      className="button-primary"
    >
      Ir para o Login
    </button>
  </StepContainer>
);

// STEP Register (cadastro completo quando não encontra)
interface StepRegisterProps {
  onSubmit: (values: Record<string, string>) => void;
  state: any | null;
  churchId: string;
  cpf: string;
  loading?: boolean;
}
const labelClasses = "block text-base font-semibold text-slate-700 mb-2";
const inputClasses =
  "w-full p-3 text-lg text-slate-800 border-2 border-slate-300 rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 overflow-hidden text-ellipsis whitespace-nowrap";

export const Step_Register = ({
  onSubmit,
  state,
  churchId,
  cpf,
  loading,
}: StepRegisterProps) => {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    // Converte para objeto plano para enviar ao service
    const values: Record<string, string> = {};
    form.forEach((value, key) => {
      values[key] = String(value);
    });
    onSubmit(values);
  }

  return (
    <StepContainer title="Complete seu Cadastro" icon={<UserPlus />}>
      <p className="mb-8 text-center text-base text-gray-600">
        Não localizamos seu cadastro. Por favor, preencha seus dados para se
        tornar um membro.
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 max-h-[60vh] overflow-y-auto pr-2"
      >
        {/* --- Seção 1: Dados Pessoais --- */}
        <section className="space-y-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-700 border-b pb-2">
            <User size={20} className="text-blue-600" />
            Dados Pessoais
          </h2>
          <div>
            <label htmlFor="name" className={labelClasses}>
              Nome Completo
            </label>
            <input
              id="name"
              type="text"
              name="name"
              className={inputClasses}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="cpf" className={labelClasses}>
                CPF
              </label>
              <input
                id="cpf"
                type="text"
                name="cpf"
                value={cpf}
                readOnly
                className={`${inputClasses} bg-slate-100 cursor-not-allowed`}
              />
            </div>
            <div>
              <label htmlFor="birthDate" className={labelClasses}>
                Data de Nascimento
              </label>
              <input
                id="birthDate"
                type="date"
                name="birthDate"
                className={inputClasses}
                required
              />
            </div>
          </div>
        </section>
        {/* --- Seção 2: Contato --- */}
        <section className="space-y-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-700 border-b pb-2">
            <Mail size={20} className="text-blue-600" />
            Informações de Contato
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className={labelClasses}>
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                className={inputClasses}
                required
              />
            </div>
            <div>
              <label htmlFor="phoneNumber" className={labelClasses}>
                Celular
              </label>
              <input
                id="phoneNumber"
                type="tel"
                name="phoneNumber"
                className={inputClasses}
                required
              />
            </div>
          </div>
        </section>
        {/* --- Seção 3: Endereço --- */}
        <section className="space-y-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-700 border-b pb-2">
            <Home size={20} className="text-blue-600" />
            Endereço
          </h2>
          <input name="country" type="hidden" value="Brasil" />
          <input name="zipCode" type="hidden" value="00000-000" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="street" className={labelClasses}>
                Rua e Número
              </label>
              <input
                id="street"
                type="text"
                name="street"
                className={inputClasses}
                required
              />
            </div>
            <div>
              <label htmlFor="neighborhood" className={labelClasses}>
                Bairro
              </label>
              <input
                id="neighborhood"
                type="text"
                name="neighborhood"
                className={inputClasses}
                required
              />
            </div>
            <div>
              <label htmlFor="city" className={labelClasses}>
                Cidade
              </label>
              <input
                id="city"
                type="text"
                name="city"
                className={inputClasses}
                required
              />
            </div>
            <div>
              <label htmlFor="state" className={labelClasses}>
                Estado
              </label>
              <select
                id="state"
                name="state"
                className={inputClasses}
                defaultValue=""
                required
              >
                <option value="" disabled>
                  Selecione um estado
                </option>
                {brazilianStates.map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>
        {/* --- Seção 4: Segurança --- */}
        <section className="space-y-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-700 border-b pb-2">
            <Lock size={20} className="text-blue-600" />
            Segurança
          </h2>
          <div>
            <label htmlFor="password" className={labelClasses}>
              Crie uma Senha
            </label>
            <input
              id="password"
              type="password"
              name="password"
              className={inputClasses}
              required
            />
          </div>
        </section>
        <div className="pt-6">
          <SubmitButton
            label="Finalizar meu Cadastro"
            className="w-full text-lg font-bold py-4 px-6 rounded-lg text-white shadow-lg
                       bg-[linear-gradient(45deg,rgba(30,64,175,.95),rgba(59,130,246,.95))]
                       hover:brightness-110 transform hover:-translate-y-1 transition-all duration-300"
            disabled={loading}
          />
        </div>
        {state?.status === "error" && (
          <p className="error-message text-center p-4">{state.message}</p>
        )}
      </form>
    </StepContainer>
  );
};

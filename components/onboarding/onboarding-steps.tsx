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
import type { FormState } from "@/app/onboarding/actions";
import { brazilianStates } from "@/app/utils/UFs/uf";

// Tipos para as props, garantindo consistência
type ActionState = { status: string; message: string };
type ActionFn = (formData: FormData) => void;

interface Step1Props {
  action: ActionFn;
  state: ActionState;
  churchId: string;
}

export const Step1_Identify = ({ action, state, churchId }: Step1Props) => (
  <StepContainer title="Bem-vindo(a)!" icon={<UserCheck />}>
    <form action={action} className="w-full space-y-8">
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
      />

      {state.status === "error" && (
        <p className="error-message text-center">{state.message}</p>
      )}
    </form>
  </StepContainer>
);

interface Step2Props {
  action: ActionFn;
  state: ActionState;
  maskedName: string;
}

export const Step2_Validate = ({ action, state, maskedName }: Step2Props) => (
  <StepContainer title={`Olá, ${maskedName}!`} icon={<UserCheck />}>
    <p className="mb-6 text-center text-gray-600">
      Para confirmar, informe sua data de nascimento.
    </p>
    <form action={action} className="space-y-4">
      <input type="hidden" name="maskedName" value={maskedName} />
      <input type="date" name="birthDate" className="input-style" required />
      <SubmitButton label="Validar" />
      {state.status === "error" && (
        <p className="error-message">{state.message}</p>
      )}
    </form>
  </StepContainer>
);

interface Step3Props {
  action: ActionFn;
  state: ActionState;
  activationHash: string;
}

export const Step3_Password = ({
  action,
  state,
  activationHash,
}: Step3Props) => (
  <StepContainer title="Crie sua Senha" icon={<KeyRound />}>
    <p className="mb-6 text-center text-gray-600">
      Escolha uma senha segura para o aplicativo.
    </p>
    <form action={action} className="space-y-4">
      <input type="hidden" name="activationHash" value={activationHash} />
      <input
        type="password"
        name="password"
        placeholder="Senha"
        className="input-style"
        required
      />
      <SubmitButton label="Finalizar Cadastro" />
      {state.status === "error" && (
        <p className="error-message">{state.message}</p>
      )}
    </form>
  </StepContainer>
);

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

interface StepRegisterProps {
  action: ActionFn;
  state: any;
  churchId: string;
  cpf: string;
}

const labelClasses = "block text-base font-semibold text-slate-700 mb-2";
const inputClasses =
  "w-full p-3 text-lg text-slate-800 border-2 border-slate-300 rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 overflow-hidden text-ellipsis whitespace-nowrap";

interface StepRegisterProps {
  action: (formData: FormData) => void;
  state: any;
  churchId: string;
  cpf: string;
}

export const Step_Register = ({
  action,
  state,
  churchId,
  cpf,
}: StepRegisterProps) => (
  <StepContainer title="Complete seu Cadastro" icon={<UserPlus />}>
    <p className="mb-8 text-center text-base text-gray-600">
      Não localizamos seu cadastro. Por favor, preencha seus dados para se
      tornar um membro.
    </p>

    <form
      action={action}
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
            {/* Combinando as classes padrão com as de desabilitado */}
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
        />
      </div>
      {state.status === "error" && (
        <p className="error-message text-center p-4">{state.message}</p>
      )}
    </form>
  </StepContainer>
);

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
  CalendarDays,
  Smartphone,
  FileText,
} from "lucide-react";
import { StepContainer, SubmitButton } from "./ui-components";
import { brazilianStates } from "@/app/utils/UFs/uf";
import { useEffect, useRef, useState } from "react";

// Definição das Props (Interfaces)
interface Step1Props {
  onSubmit: (values: { identifier: string }) => void;
  state: any | null;
  churchId: string;
  loading?: boolean;
}

interface Step2Props {
  onSubmit: (values: { birthDate: string }) => void;
  state: any;
  identifier: string;
  loading: boolean;
}

interface Step3Props {
  onSubmit: (values: { password: string }) => void;
  state: any | null;
  activationHash: string;
  loading?: boolean;
}

interface StepRegisterProps {
  onSubmit: (values: Record<string, string>) => void;
  state: any | null;
  churchId: string;
  cpf: string;
  loading?: boolean;
}

// Objeto para configurar os placeholders e tipos do input
const identifierOptions = {
  cpf: {
    placeholder: "000.000.000-00",
    type: "tel",
    icon: <FileText className="w-5 h-5" />,
    label: "CPF",
  },
  email: {
    placeholder: "seu@email.com",
    type: "email",
    icon: <Mail className="w-5 h-5" />,
    label: "E-mail",
  },
  phone: {
    placeholder: "(00) 00000-0000",
    type: "tel",
    icon: <Smartphone className="w-5 h-5" />,
    label: "Celular",
  },
};

// STEP 1: Identificação
export const Step1_Identify = ({
  onSubmit,
  state,
  churchId,
  loading,
}: Step1Props) => {
  const [identifierType, setIdentifierType] = useState<
    "cpf" | "email" | "phone"
  >("cpf");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const identifier = (e.currentTarget.identifier as HTMLInputElement).value;
    onSubmit({ identifier });
  }

  const selectedOption = identifierOptions[identifierType];

  return (
    <StepContainer title="Bem-vindo(a)!" icon={<UserCheck />}>
      <form onSubmit={handleSubmit} className="w-full space-y-8">
        <div>
          <label className="block text-md font-semibold text-gray-700 mb-4 text-center">
            Selecione como você quer iniciar:
          </label>
          <div className="flex justify-center items-center gap-2 mb-6">
            {(
              Object.keys(identifierOptions) as Array<
                keyof typeof identifierOptions
              >
            ).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setIdentifierType(key)}
                className={`flex items-center gap-2 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${
                  identifierType === key
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {identifierOptions[key].icon}
                {identifierOptions[key].label}
              </button>
            ))}
          </div>

          <label
            htmlFor="identifier"
            className="block text-md font-semibold text-gray-700 mb-2 text-center"
          >
            Digite seu {selectedOption.label} para iniciar o cadastro
          </label>
          <input
            id="identifier"
            type={selectedOption.type}
            name="identifier"
            placeholder={selectedOption.placeholder}
            className="input-style w-full p-4 text-center text-xl tracking-wider border-2"
            required
            key={identifierType}
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
        {/* CORREÇÃO APLICADA AQUI */}
        {state?.status === "error" && (
          <p className="mt-2 text-sm font-medium text-red-600 text-center">
            {state.message}
          </p>
        )}
      </form>
    </StepContainer>
  );
};

// STEP 2: Validação da data de nascimento
export const Step2_Validate = ({
  onSubmit,
  state,
  identifier,
  loading,
}: Step2Props) => {
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElements = e.currentTarget.elements;

    const day = (
      formElements.namedItem("day") as HTMLInputElement
    ).value.padStart(2, "0");
    const month = (
      formElements.namedItem("month") as HTMLInputElement
    ).value.padStart(2, "0");
    const year = (formElements.namedItem("year") as HTMLInputElement).value;

    if (!day || !month || !year || year.length < 4) {
      alert("Por favor, preencha a data completa.");
      return;
    }

    const birthDate = `${year}-${month}-${day}`;
    onSubmit({ birthDate });
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length === 2) {
      monthRef.current?.focus();
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length === 2) {
      yearRef.current?.focus();
    }
  };

  return (
    <StepContainer title="Quase lá!" icon={<CalendarDays />}>
      <form className="w-full space-y-8" onSubmit={handleSubmit}>
        <input type="hidden" name="identifier" value={identifier} />
        <div className="text-center">
          <p className="text-gray-600 text-base">
            Para sua segurança, por favor, confirme sua data de nascimento.
          </p>
        </div>
        <div>
          <label className="block text-base font-semibold text-slate-700 mb-2 text-center">
            Data de Nascimento
          </label>
          <div className="flex items-center justify-center gap-2 md:gap-4">
            <input
              type="tel"
              name="day"
              placeholder="DD"
              maxLength={2}
              className="input-style-enhanced w-1/3 text-center text-2xl p-3"
              required
              onChange={handleDayChange}
            />
            <span className="text-2xl font-bold text-gray-300">/</span>
            <input
              ref={monthRef}
              type="tel"
              name="month"
              placeholder="MM"
              maxLength={2}
              className="input-style-enhanced w-1/3 text-center text-2xl p-3"
              required
              onChange={handleMonthChange}
            />
            <span className="text-2xl font-bold text-gray-300">/</span>
            <input
              ref={yearRef}
              type="tel"
              name="year"
              placeholder="AAAA"
              maxLength={4}
              className="input-style-enhanced w-1/3 text-center text-2xl p-3"
              required
            />
          </div>
        </div>
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full text-lg font-bold py-4 px-6 rounded-lg text-white shadow-lg
                        bg-[linear-gradient(45deg,rgba(30,64,175,.95),rgba(59,130,246,.95))]
                        hover:brightness-110 transform hover:-translate-y-1 transition-all duration-300"
          >
            {loading ? "Validando..." : "Validar"}
          </button>
        </div>
        {/* CORREÇÃO APLICADA AQUI */}
        {state?.status === "error" && (
          <p className="mt-2 text-sm font-medium text-red-600 text-center p-4">
            {state.message}
          </p>
        )}
      </form>
    </StepContainer>
  );
};

// STEP 3: Criação de senha
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
        <SubmitButton
          label="Finalizar Cadastro"
          disabled={loading}
          className="w-full text-lg font-bold py-4 px-6 rounded-lg text-white shadow-lg
                     bg-[linear-gradient(45deg,rgba(30,64,175,.95),rgba(59,130,246,.95))]
                     hover:brightness-110 transform hover:-translate-y-1 transition-all duration-300"
        />
        {/* CORREÇÃO APLICADA AQUI */}
        {state?.status === "error" && (
          <p className="mt-2 text-sm font-medium text-red-600 text-center">
            {state.message}
          </p>
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
      className="w-full text-lg font-bold py-4 px-6 rounded-lg text-white shadow-lg
      bg-[linear-gradient(45deg,rgba(30,64,175,.95),rgba(59,130,246,.95))]
      hover:brightness-110 transform hover:-translate-y-1 transition-all duration-300"
    >
      Ir para o Login
    </button>
  </StepContainer>
);

const labelClasses = "block text-base font-semibold text-slate-700 mb-2";
const inputClasses =
  "w-full p-3 text-lg text-slate-800 border-2 border-slate-300 rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 overflow-hidden text-ellipsis whitespace-nowrap";

// STEP de Registro
export function Step_Register({
  onSubmit,
  state,
  churchId,
  cpf,
  loading,
}: StepRegisterProps) {
  const [maritalStatus, setMaritalStatus] = useState("Solteiro");
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [allFieldsFilled, setAllFieldsFilled] = useState(false);

  function checkAllFields(e?: React.FormEvent<HTMLFormElement>) {
    let form: FormData;
    if (e) {
      form = new FormData(e.currentTarget);
    } else {
      const formElem = document.getElementById(
        "register-form"
      ) as HTMLFormElement | null;
      form = formElem ? new FormData(formElem) : new FormData();
    }
    let filled = true;
    for (let field of [
      "name",
      "cpf",
      "birthDate",
      "email",
      "phoneNumber",
      "street",
      "neighborhood",
      "city",
      "state",
      "zipCode",
      "password",
    ]) {
      if (!form.get(field)) filled = false;
    }
    if (password.length < 6 || password !== passwordAgain) filled = false;
    setAllFieldsFilled(filled);
  }

  useEffect(() => {
    checkAllFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password, passwordAgain, maritalStatus]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const values: Record<string, string> = {};
    form.forEach((value, key) => {
      values[key] = String(value);
    });
    values.maritalStatus = maritalStatus;
    values.churchId = churchId;
    onSubmit(values);
  }

  return (
    <StepContainer title="Complete seu Cadastro" icon={<UserPlus />}>
      <p className="mb-8 text-center text-base text-gray-600">
        Não localizamos seu cadastro. Por favor, preencha seus dados para se
        tornar um membro.
      </p>

      <form
        id="register-form"
        onSubmit={handleSubmit}
        onChange={checkAllFields}
        className="space-y-8 max-h-[60vh] overflow-y-auto pr-2"
        autoComplete="off"
      >
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
                className={inputClasses}
                required
                defaultValue={cpf}
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
          <div>
            <label htmlFor="maritalStatus" className={labelClasses}>
              Estado Civil
            </label>
            <select
              id="maritalStatus"
              name="maritalStatus"
              value={maritalStatus}
              className={inputClasses}
              onChange={(e) => setMaritalStatus(e.target.value)}
            >
              <option value="Solteiro">Solteiro</option>
              <option value="Casado">Casado</option>
              <option value="Divorciado">Divorciado</option>
              <option value="Viúvo">Viúvo</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
        </section>

        {/* Contato */}
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

        {/* Endereço */}
        <section className="space-y-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-700 border-b pb-2">
            <Home size={20} className="text-blue-600" />
            Endereço
          </h2>
          <input name="country" type="hidden" value="Brasil" />
          <input name="zipCode" type="hidden" value="00000-000" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="zipCode" className={labelClasses}>
                CEP
              </label>
              <input
                id="zipCode"
                type="text"
                name="zipCode"
                className={inputClasses}
                required
              />
            </div>
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

        {/* Segurança */}
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="passwordAgain" className={labelClasses}>
              Digite a senha novamente
            </label>
            <input
              id="passwordAgain"
              type="password"
              className={inputClasses}
              required
              value={passwordAgain}
              onChange={(e) => setPasswordAgain(e.target.value)}
            />
            {passwordAgain && password !== passwordAgain && (
              <p className="text-red-500 text-xs mt-1">
                As senhas não conferem.
              </p>
            )}
          </div>
        </section>

        <div className="pt-6">
          <button
            type="submit"
            className={`w-full text-lg font-bold py-4 px-6 rounded-lg text-white shadow-lg
                ${
                  !allFieldsFilled || loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[linear-gradient(45deg,rgba(30,64,175,.95),rgba(59,130,246,.95))] hover:brightness-110 transform hover:-translate-y-1 transition-all duration-300"
                }`}
            disabled={!allFieldsFilled || loading}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 mx-auto" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              "Finalizar meu Cadastro"
            )}
          </button>
        </div>
        {state?.status === "error" && (
          <p className="mt-2 text-sm font-medium text-red-600 text-center p-4">
            {state.message}
          </p>
        )}
      </form>
    </StepContainer>
  );
}

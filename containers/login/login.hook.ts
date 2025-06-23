import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { login as loginService } from "@/services/login/login";

interface UseLoginResult {
  identifier: string;
  password: string;
  showPassword: boolean;
  error: string;
  isLoading: boolean;
  togglePasswordVisibility: () => void;
  handleIdentifierChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export function useLogin(): UseLoginResult {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planoParam = searchParams.get("plano");
  const redirectParam = searchParams.get("redirect");

  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const formatCPF = useCallback((value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return value;
  }, []);

  const handleIdentifierChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (
        value.includes("@") ||
        /[a-zA-Z]/.test(value) ||
        value.includes(".")
      ) {
        setIdentifier(value);
      } else {
        const formatted = formatCPF(value);
        setIdentifier(formatted);
      }
      setError("");
    },
    [formatCPF]
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
      setError("");
    },
    []
  );

  const loginMutation = useMutation({
    mutationFn: loginService,
    onSuccess: (data) => {
      if (data.token?.token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("authToken", data.token.token);
          localStorage.setItem("userRole", data.token.role);

          const userData = {
            id: data.token.member?.id || "1",
            name: data.token.member?.name || "Usuário",
            email: data.token.member?.email || identifier,
            phone: data.token.member?.phone || "",
            role: data.token.role,
            accessLevel: data.token.role === "Admin" ? "admin" : "member",
            churchId: data.token.member?.churchId || null,
            isBaptized: data.token.member?.isBaptized || false,
            isTither: data.token.member?.isTither || false,
            isActive: data.token.member?.isActive || true,
          };

          localStorage.setItem("user", JSON.stringify(userData));
        }

        if (redirectParam === "checkout" && planoParam) {
          router.push(`/planos/checkout?plano=${planoParam}`);
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(
          data.message || "Erro na resposta do servidor. Tente novamente."
        );
      }
    },
    onError: (error: Error) => {
      setError(
        error.message ||
          "Erro de conexão. Verifique sua internet e tente novamente."
      );
    },
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      loginMutation.mutate({ identifier, password });
    },
    [identifier, password, loginMutation]
  );

  return {
    identifier,
    password,
    showPassword,
    error,
    isLoading: loginMutation.isPending,
    togglePasswordVisibility,
    handleIdentifierChange,
    handlePasswordChange,
    handleSubmit,
  };
}

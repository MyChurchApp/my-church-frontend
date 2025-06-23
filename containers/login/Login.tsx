"use client";

import LoginComponent from "@/components/Login/Login";
import { useLogin } from "./login.hook";

export default function LoginPageContainer() {
  const {
    identifier,
    password,
    showPassword,
    error,
    isLoading,
    togglePasswordVisibility,
    handleIdentifierChange,
    handlePasswordChange,
    handleSubmit,
  } = useLogin();

  return (
    <LoginComponent
      error={error}
      identifier={identifier}
      password={password}
      showPassword={showPassword}
      isLoading={isLoading}
      togglePasswordVisibility={togglePasswordVisibility}
      handleIdentifierChange={handleIdentifierChange}
      handlePasswordChange={handlePasswordChange}
      handleSubmit={handleSubmit}
    />
  );
}

export type LoginPageProps = {
  identifier: string;
  password: string;
  showPassword: boolean;
  isLoading: boolean;
  error: string;
  togglePasswordVisibility: () => void;
  handleIdentifierChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
};

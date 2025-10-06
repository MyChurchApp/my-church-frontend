"use client";

import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	ArrowRight,
	ArrowLeft,
	Eye,
	EyeOff,
	Loader2,
	Send,
} from "lucide-react";
import { useState, useEffect, useId } from "react";
import { getAddressFromCep } from "@/services/cep/cep";
import { InfoModal } from "../InfoModal/InfoModal";

export function Step3_InfoAdmin({
	formData,
	setFormData,
	nextStep,
	prevStep,
	handleFinalSubmit,
	isPending,
}: any) {
	const [showPassword, setShowPassword] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isCepLoading, setIsCepLoading] = useState(false);
	const [isTermsOpen, setIsTermsOpen] = useState(false);
	const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
	const [useSameAddress, setUseSameAddress] = useState(false);
	const isFreePlan = formData.planId === 1;

	const uid = useId();
	const ids = {
		adminName: `${uid}-admin-name`,
		adminCPF: `${uid}-admin-cpf`,
		ministry: `${uid}-admin-ministry`,
		zip: `${uid}-admin-zip`,
		street: `${uid}-admin-street`,
		number: `${uid}-admin-number`,
		neighborhood: `${uid}-admin-neighborhood`,
		city: `${uid}-admin-city`,
		state: `${uid}-admin-state`,
		email: `${uid}-admin-email`,
		phone: `${uid}-admin-phone`,
		password: `${uid}-admin-password`,
		confirm: `${uid}-admin-confirm`,
		terms: `${uid}-terms`,
		sameAddress: `${uid}-same-address`,
	};

	// Preenche/sincroniza endereço admin com o endereço da igreja quando marcado
	useEffect(() => {
		if (!useSameAddress) return;
		const copy = (k: string) => formData?.[k] ?? "";
		setFormData((prev: any) => ({
			...prev,
			adminZipCode: copy("churchZipCode"),
			adminStreet: copy("churchStreet"),
			adminNumber: copy("churchNumber"),
			adminNeighborhood: copy("churchNeighborhood"),
			adminCity: copy("churchCity"),
			adminState: copy("churchState"),
		}));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		useSameAddress,
		formData.churchZipCode,
		formData.churchStreet,
		formData.churchNumber,
		formData.churchNeighborhood,
		formData.churchCity,
		formData.churchState,
	]);

	// Busca CEP apenas quando NÃO estiver usando o endereço da igreja
	useEffect(() => {
		if (useSameAddress) return;
		const cep = formData.adminZipCode || "";
		if (cep.replace(/\D/g, "").length === 8) {
			(async () => {
				setIsCepLoading(true);
				const address = await getAddressFromCep(cep);
				if (address) {
					setFormData((prev: any) => ({
						...prev,
						adminStreet: address.logradouro,
						adminNeighborhood: address.bairro,
						adminCity: address.localidade,
						adminState: address.uf,
					}));
				}
				setIsCepLoading(false);
			})();
		}
	}, [formData.adminZipCode, setFormData, useSameAddress]);

	const validate = () => {
		const newErrors: Record<string, string> = {};

		// Obrigatórios
		if (!formData.adminName)
			newErrors.adminName = "Nome completo é obrigatório.";
		if (!formData.adminCPF) newErrors.adminCPF = "CPF é obrigatório.";
		if (!formData.ministry)
			newErrors.ministry = "Cargo na Igreja é obrigatório.";
		if (!formData.adminEmail)
			newErrors.adminEmail = "Email de acesso é obrigatório.";
		if (!formData.adminPhone)
			newErrors.adminPhone = "O telefone é obrigatório.";
		if (!formData.adminPassword)
			newErrors.adminPassword = "A senha é obrigatória.";
		if (formData.adminPassword !== formData.confirmarSenha)
			newErrors.confirmarSenha = "As senhas não coincidem.";
		if (!formData.aceitarTermos)
			newErrors.aceitarTermos = "Você deve aceitar os termos.";

		// Endereço obrigatório
		if (!formData.adminZipCode) newErrors.adminZipCode = "CEP é obrigatório.";
		if (!formData.adminStreet)
			newErrors.adminStreet = "Endereço é obrigatório.";
		if (!formData.adminNumber) newErrors.adminNumber = "Número é obrigatório.";
		if (!formData.adminNeighborhood)
			newErrors.adminNeighborhood = "Bairro é obrigatório.";
		if (!formData.adminCity) newErrors.adminCity = "Cidade é obrigatória.";
		if (!formData.adminState) newErrors.adminState = "Estado é obrigatório.";

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleNext = (e: React.FormEvent) => {
		e.preventDefault();
		if (!validate()) return;
		if (isFreePlan) handleFinalSubmit();
		else nextStep();
	};

	return (
		<>
			<Card className="shadow-lg">
				<form onSubmit={handleNext}>
					<CardHeader className="text-center">
						<CardTitle className="text-3xl font-bold">
							Dados do Administrador
						</CardTitle>
						<CardDescription className="text-base">
							Informações do responsável principal pela conta.
						</CardDescription>
					</CardHeader>

					<CardContent className="p-8 space-y-8">
						{/* Identificação */}
						<fieldset>
							<legend className="text-lg font-semibold mb-4">
								Identificação
							</legend>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="md:col-span-2">
									<Label htmlFor={ids.adminName}>Nome Completo *</Label>
									<Input
										id={ids.adminName}
										value={formData.adminName || ""}
										onChange={(e) =>
											setFormData({ ...formData, adminName: e.target.value })
										}
										required
										aria-invalid={!!errors.adminName}
										className={errors.adminName ? "border-destructive" : ""}
										autoComplete="name"
									/>
									{errors.adminName && (
										<p className="text-destructive text-sm mt-1">
											{errors.adminName}
										</p>
									)}
								</div>

								<div>
									<Label htmlFor={ids.adminCPF}>CPF *</Label>
									<Input
										id={ids.adminCPF}
										value={formData.adminCPF || ""}
										onChange={(e) =>
											setFormData({ ...formData, adminCPF: e.target.value })
										}
										required
										aria-invalid={!!errors.adminCPF}
										className={errors.adminCPF ? "border-destructive" : ""}
										inputMode="numeric"
										autoComplete="off"
									/>
									{errors.adminCPF && (
										<p className="text-destructive text-sm mt-1">
											{errors.adminCPF}
										</p>
									)}
								</div>

								<div>
									<Label htmlFor={ids.ministry}>Cargo na Igreja *</Label>
									<Input
										id={ids.ministry}
										value={formData.ministry || ""}
										onChange={(e) =>
											setFormData({ ...formData, ministry: e.target.value })
										}
										required
										aria-invalid={!!errors.ministry}
										className={errors.ministry ? "border-destructive" : ""}
										autoComplete="organization-title"
									/>
									{errors.ministry && (
										<p className="text-destructive text-sm mt-1">
											{errors.ministry}
										</p>
									)}
								</div>
							</div>
						</fieldset>

						{/* Endereço */}
						<fieldset>
							<legend className="text-lg font-semibold mb-2">
								Endereço Pessoal
							</legend>

							<div className="flex items-center gap-2 mb-4">
								<Checkbox
									id={ids.sameAddress}
									checked={useSameAddress}
									onCheckedChange={(c) => setUseSameAddress(!!c)}
								/>
								<Label htmlFor={ids.sameAddress} className="text-sm">
									Usar mesmo endereço da igreja
								</Label>
							</div>

							{/* fieldset interno desabilita todos os inputs e reduz opacidade */}
							<fieldset
								disabled={useSameAddress}
								className={useSameAddress ? "opacity-60" : ""}
							>
								<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
									<div className="md:col-span-1">
										<Label htmlFor={ids.zip}>CEP *</Label>
										<div className="relative">
											<Input
												id={ids.zip}
												value={formData.adminZipCode || ""}
												onChange={(e) =>
													setFormData({
														...formData,
														adminZipCode: e.target.value,
													})
												}
												required
												aria-invalid={!!errors.adminZipCode}
												inputMode="numeric"
												autoComplete="postal-code"
												className="disabled:opacity-60 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
											/>
											{isCepLoading && (
												<Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin" />
											)}
										</div>
										{errors.adminZipCode && (
											<p className="text-destructive text-sm mt-1">
												{errors.adminZipCode}
											</p>
										)}
									</div>

									<div className="md:col-span-3">
										<Label htmlFor={ids.street}>Endereço *</Label>
										<Input
											id={ids.street}
											value={formData.adminStreet || ""}
											onChange={(e) =>
												setFormData({
													...formData,
													adminStreet: e.target.value,
												})
											}
											required
											aria-invalid={!!errors.adminStreet}
											autoComplete="address-line1"
											className="disabled:opacity-60 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
										/>
										{errors.adminStreet && (
											<p className="text-destructive text-sm mt-1">
												{errors.adminStreet}
											</p>
										)}
									</div>

									<div className="md:col-span-1">
										<Label htmlFor={ids.number}>Número *</Label>
										<Input
											id={ids.number}
											value={formData.adminNumber || ""}
											onChange={(e) =>
												setFormData({
													...formData,
													adminNumber: e.target.value,
												})
											}
											required
											aria-invalid={!!errors.adminNumber}
											autoComplete="address-line2"
											className="disabled:opacity-60 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
										/>
										{errors.adminNumber && (
											<p className="text-destructive text-sm mt-1">
												{errors.adminNumber}
											</p>
										)}
									</div>

									<div className="md:col-span-3">
										<Label htmlFor={ids.neighborhood}>Bairro *</Label>
										<Input
											id={ids.neighborhood}
											value={formData.adminNeighborhood || ""}
											onChange={(e) =>
												setFormData({
													...formData,
													adminNeighborhood: e.target.value,
												})
											}
											required
											aria-invalid={!!errors.adminNeighborhood}
											autoComplete="address-level3"
											className="disabled:opacity-60 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
										/>
										{errors.adminNeighborhood && (
											<p className="text-destructive text-sm mt-1">
												{errors.adminNeighborhood}
											</p>
										)}
									</div>

									<div className="md:col-span-2">
										<Label htmlFor={ids.city}>Cidade *</Label>
										<Input
											id={ids.city}
											value={formData.adminCity || ""}
											onChange={(e) =>
												setFormData({ ...formData, adminCity: e.target.value })
											}
											required
											aria-invalid={!!errors.adminCity}
											autoComplete="address-level2"
											className="disabled:opacity-60 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
										/>
										{errors.adminCity && (
											<p className="text-destructive text-sm mt-1">
												{errors.adminCity}
											</p>
										)}
									</div>

									<div className="md:col-span-2">
										<Label htmlFor={ids.state}>Estado *</Label>
										<Input
											id={ids.state}
											value={formData.adminState || ""}
											onChange={(e) =>
												setFormData({ ...formData, adminState: e.target.value })
											}
											required
											aria-invalid={!!errors.adminState}
											autoComplete="address-level1"
											className="disabled:opacity-60 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
										/>
										{errors.adminState && (
											<p className="text-destructive text-sm mt-1">
												{errors.adminState}
											</p>
										)}
									</div>
								</div>
							</fieldset>
						</fieldset>

						{/* Credenciais */}
						<fieldset>
							<legend className="text-lg font-semibold mb-4">
								Credenciais de Acesso
							</legend>
							<div className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<Label htmlFor={ids.email}>Email de Acesso *</Label>
										<Input
											id={ids.email}
											type="email"
											value={formData.adminEmail || ""}
											onChange={(e) =>
												setFormData({ ...formData, adminEmail: e.target.value })
											}
											required
											aria-invalid={!!errors.adminEmail}
											className={errors.adminEmail ? "border-destructive" : ""}
											autoComplete="email"
										/>
										{errors.adminEmail && (
											<p className="text-destructive text-sm mt-1">
												{errors.adminEmail}
											</p>
										)}
									</div>
									<div>
										<Label htmlFor={ids.phone}>Telefone / WhatsApp *</Label>
										<Input
											id={ids.phone}
											value={formData.adminPhone || ""}
											onChange={(e) =>
												setFormData({ ...formData, adminPhone: e.target.value })
											}
											required
											aria-invalid={!!errors.adminPhone}
											className={errors.adminPhone ? "border-destructive" : ""}
											autoComplete="tel"
										/>
										{errors.adminPhone && (
											<p className="text-destructive text-sm mt-1">
												{errors.adminPhone}
											</p>
										)}
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<Label htmlFor={ids.password}>Senha *</Label>
										<div className="relative">
											<Input
												id={ids.password}
												type={showPassword ? "text" : "password"}
												value={formData.adminPassword || ""}
												onChange={(e) =>
													setFormData({
														...formData,
														adminPassword: e.target.value,
													})
												}
												required
												aria-invalid={!!errors.adminPassword}
												className={
													errors.adminPassword ? "border-destructive" : ""
												}
												autoComplete="new-password"
											/>
											<button
												type="button"
												onClick={() => setShowPassword(!showPassword)}
												className="absolute right-3 top-1/2 -translate-y-1/2"
												aria-label={
													showPassword ? "Ocultar senha" : "Mostrar senha"
												}
											>
												{showPassword ? <EyeOff /> : <Eye />}
											</button>
										</div>
										{errors.adminPassword && (
											<p className="text-destructive text-sm mt-1">
												{errors.adminPassword}
											</p>
										)}
									</div>

									<div>
										<Label htmlFor={ids.confirm}>Confirmar Senha *</Label>
										<div className="relative">
											<Input
												id={ids.confirm}
												type={showPassword ? "text" : "password"}
												value={formData.confirmarSenha || ""}
												onChange={(e) =>
													setFormData({
														...formData,
														confirmarSenha: e.target.value,
													})
												}
												required
												aria-invalid={!!errors.confirmarSenha}
												className={
													errors.confirmarSenha ? "border-destructive" : ""
												}
												autoComplete="new-password"
											/>
											<button
												type="button"
												onClick={() => setShowPassword(!showPassword)}
												className="absolute right-3 top-1/2 -translate-y-1/2"
												aria-label={
													showPassword ? "Ocultar senha" : "Mostrar senha"
												}
											>
												{showPassword ? <EyeOff /> : <Eye />}
											</button>
										</div>
										{errors.confirmarSenha && (
											<p className="text-destructive text-sm mt-1">
												{errors.confirmarSenha}
											</p>
										)}
									</div>
								</div>
							</div>
						</fieldset>

						<div className="flex items-start space-x-3 pt-4">
							<Checkbox
								id={ids.terms}
								checked={formData.aceitarTermos}
								onCheckedChange={(checked) =>
									setFormData({ ...formData, aceitarTermos: !!checked })
								}
								className={errors.aceitarTermos ? "border-destructive" : ""}
								aria-invalid={!!errors.aceitarTermos}
							/>
							<div className="grid gap-1.5 leading-none">
								<label
									htmlFor={ids.terms}
									className="text-sm font-medium leading-none"
								>
									Concordo com os{" "}
									<Button
										type="button"
										variant="link"
										className="p-0 h-auto text-base"
										onClick={() => setIsTermsOpen(true)}
									>
										Termos de Serviço
									</Button>{" "}
									e a{" "}
									<Button
										type="button"
										variant="link"
										className="p-0 h-auto text-base"
										onClick={() => setIsPrivacyOpen(true)}
									>
										Política de Privacidade
									</Button>
									.
								</label>
								{errors.aceitarTermos && (
									<p className="text-destructive text-sm">
										{errors.aceitarTermos}
									</p>
								)}
							</div>
						</div>
					</CardContent>

					<CardFooter className="bg-gray-50 dark:bg-gray-800/50 p-6 flex justify-between">
						<Button
							type="button"
							variant="outline"
							size="lg"
							onClick={prevStep}
						>
							<ArrowLeft className="mr-2" /> Anterior
						</Button>
						<Button
							type="submit"
							size="lg"
							disabled={isPending || !formData.aceitarTermos}
						>
							{isPending ? (
								<>
									<Loader2 className="animate-spin mr-2" /> Processando...
								</>
							) : isFreePlan ? (
								<>
									Finalizar Cadastro <Send className="ml-2" />
								</>
							) : (
								<>
									Próximo <ArrowRight className="ml-2" />
								</>
							)}
						</Button>
					</CardFooter>
				</form>
			</Card>

			<InfoModal
				isOpen={isTermsOpen}
				onClose={() => setIsTermsOpen(false)}
				title="Termos de Serviço"
			/>
			<InfoModal
				isOpen={isPrivacyOpen}
				onClose={() => setIsPrivacyOpen(false)}
				title="Política de Privacidade"
			/>
		</>
	);
}

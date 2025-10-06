"use client";

import { useEffect, useState } from "react";
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
import { ArrowRight } from "lucide-react";

export function Step1_PlanoContato({ formData, setFormData, nextStep }: any) {
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Sempre força plano 1 no estado
	useEffect(() => {
		setFormData((prev: any) => ({ ...prev, planId: 1 }));
	}, [setFormData]);

	const validate = () => {
		const newErrors: Record<string, string> = {};
		if (!formData.name) newErrors.name = "O nome da igreja é obrigatório.";
		if (!formData.email) newErrors.email = "O email principal é obrigatório.";
		if (!formData.phone)
			newErrors.phone = "O telefone principal é obrigatório.";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleNext = (e: React.FormEvent) => {
		e.preventDefault();
		if (validate()) nextStep();
	};

	return (
		<Card className="shadow-lg">
			<form onSubmit={handleNext}>
				{/* Plano fixo enviado escondido */}
				<input type="hidden" name="planId" value={1} />

				<CardHeader className="text-center">
					<CardTitle className="text-3xl font-bold">Comece por aqui</CardTitle>
					<CardDescription className="text-base">
						Informe os dados principais da sua igreja.
					</CardDescription>
				</CardHeader>

				<CardContent className="p-8 space-y-6">
					<Label className="text-lg font-semibold">
						Informações de Contato *
					</Label>
					<div className="space-y-4">
						<div>
							<Label htmlFor="nome">Nome da Igreja</Label>
							<Input
								id="nome"
								value={formData.name || ""}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								required
								className="h-11"
							/>
							{errors.name && (
								<p className="text-sm text-destructive mt-1">{errors.name}</p>
							)}
						</div>
						<div>
							<Label htmlFor="email">Email Principal</Label>
							<Input
								id="email"
								type="email"
								value={formData.email || ""}
								onChange={(e) =>
									setFormData({ ...formData, email: e.target.value })
								}
								required
								className="h-11"
							/>
							{errors.email && (
								<p className="text-sm text-destructive mt-1">{errors.email}</p>
							)}
						</div>
						<div>
							<Label htmlFor="telefone">Telefone Principal (WhatsApp)</Label>
							<Input
								id="telefone"
								value={formData.phone || ""}
								onChange={(e) =>
									setFormData({ ...formData, phone: e.target.value })
								}
								required
								className="h-11"
							/>
							{errors.phone && (
								<p className="text-sm text-destructive mt-1">{errors.phone}</p>
							)}
						</div>
					</div>
				</CardContent>

				<CardFooter className="bg-gray-50 dark:bg-gray-800/50 p-6">
					<Button
						type="submit"
						size="lg"
						className="w-full sm:w-auto sm:ml-auto"
					>
						Próximo <ArrowRight className="ml-2" />
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}

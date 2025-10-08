"use client";

import { useId } from "react";
import {
	Users,
	HandHeart,
	UsersRound,
	CalendarCheck,
	PersonStanding,
	BookOpen,
	Building,
} from "lucide-react";

const featureData = [
	{
		icon: Users,
		title: "Gestão de Membros",
		desc: "Organize perfis completos, famílias e aniversariantes.",
		color: "indigo",
	},
	{
		icon: HandHeart,
		title: "Doações Online",
		desc: "Receba dízimos e ofertas de forma segura e transparente.",
		color: "pink",
	},
	{
		icon: UsersRound,
		title: "Pequenos Grupos",
		desc: "Acompanhe frequência e relatórios de cada grupo.",
		color: "orange",
	},
	{
		icon: CalendarCheck,
		title: "Agenda e Eventos",
		desc: "Divulgue cultos, conferências e gere as inscrições.",
		color: "violet",
	},
	{
		icon: PersonStanding,
		title: "Gestor de Culto",
		desc: "Apresente a Bíblia, hinos e pedidos de oração em tempo real.",
		color: "rose",
	},
	{
		icon: BookOpen,
		title: "Bíblia Digital",
		desc: "Acesso a diversas versões da Bíblia diretamente no app.",
		color: "teal",
	},
	{
		icon: Building,
		title: "Gestão de Patrimônio",
		desc: "Controle os ativos da sua igreja de forma organizada.",
		color: "amber",
	},
];

const colorClasses: Record<string, string> = {
	indigo:
		"bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300",
	pink: "bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-300",
	orange:
		"bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-300",
	violet:
		"bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-300",
	rose: "bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300",
	teal: "bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-300",
	amber: "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300",
};

export default function FeaturesSection() {
	const rid = useId().replace(/[:.]/g, "");
	const sectionId = `features-${rid}`;

	return (
		<section
			id={sectionId}
			className="py-20 sm:py-24 bg-background-alt dark:bg-background"
		>
			<div className="container mx-auto px-6">
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-4xl font-extrabold text-primary mb-4">
						Funcionalidades Poderosas
					</h2>
					<p className="text-lg text-secondary max-w-3xl mx-auto">
						Do essencial para começar a ferramentas avançadas para crescer.
					</p>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{featureData.map(({ icon: Icon, title, desc, color }) => (
						<div
							key={title}
							className="bg-card p-6 rounded-xl border w-full h-full
                         flex flex-row items-start gap-4
                         transition-transform duration-300 hover:scale-105 hover:shadow-lg"
						>
							<div
								className={`${colorClasses[color]} rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0`}
							>
								<Icon className="w-8 h-8" />
							</div>

							<div className="flex-1 min-w-0 text-left">
								<h3 className="text-lg font-bold text-primary">{title}</h3>
								<p className="text-sm text-muted-foreground">{desc}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

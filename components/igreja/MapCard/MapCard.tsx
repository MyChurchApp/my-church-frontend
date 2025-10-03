"use client";
import type { ChurchItem } from "@/services/churchPublic/churchPublic";

function addressToText(addr?: {
	street?: string;
	neighborhood?: string;
	city?: string;
	state?: string;
	zipCode?: string;
}) {
	if (!addr) return "";
	return [addr.street, addr.neighborhood, addr.city, addr.state, addr.zipCode]
		.filter(Boolean)
		.join(", ");
}

export default function MapCard({
	church,
	addressText,
}: {
	church: ChurchItem;
	/** opcional: endereço vindo do serviço privado (se o user for da própria igreja) */
	addressText?: string;
}) {
	const hasCoords = church.latitude != null && church.longitude != null;
	const query = hasCoords
		? `${church.latitude},${church.longitude}`
		: addressText?.trim() ||
			[church.name, church.city, church.state].filter(Boolean).join(", ");

	const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(
		query,
	)}&z=15&output=embed`;

	const linkSearch = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
		query,
	)}`;
	const linkDirections = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
		query,
	)}`;

	return (
		<div className="bg-white rounded-2xl shadow p-6">
			<h3 className="font-semibold mb-3">Como chegar</h3>
			<div className="rounded-lg overflow-hidden border">
				<iframe
					title="Mapa"
					src={mapEmbed}
					className="w-full h-64"
					loading="lazy"
					referrerPolicy="no-referrer-when-downgrade"
				/>
			</div>

			<div className="mt-3 text-sm text-gray-700">
				{hasCoords ? (
					<div>
						Coordenadas: {church.latitude}, {church.longitude}
					</div>
				) : (
					<div>{query}</div>
				)}
			</div>

			<div className="mt-3 flex gap-2">
				<a
					href={linkDirections}
					target="_blank"
					rel="noreferrer"
					className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700"
				>
					Traçar rota
				</a>
				<a
					href={linkSearch}
					target="_blank"
					rel="noreferrer"
					className="px-3 py-2 rounded-lg bg-gray-100 text-gray-800 text-sm hover:bg-gray-200"
				>
					Abrir no Google Maps
				</a>
			</div>
		</div>
	);
}

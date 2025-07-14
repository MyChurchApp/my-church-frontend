export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export async function getAddressFromCep(
  cep: string
): Promise<ViaCepResponse | null> {
  const cleanedCep = cep.replace(/\D/g, "");

  if (cleanedCep.length !== 8) {
    return null;
  }

  try {
    const response = await fetch(
      `https://viacep.com.br/ws/${cleanedCep}/json/`
    );

    if (!response.ok) {
      throw new Error("Falha ao buscar o CEP.");
    }

    const data: ViaCepResponse = await response.json();

    if (data.erro) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro na API de CEP:", error);
    return null;
  }
}

export interface PreLaunchRegisterPayload {
  name: string;
  email: string;
  phone: string;
  churchName: string;
  churchRole: string;
  comments: string;
}

export async function preLaunchRegister(
  payload: PreLaunchRegisterPayload
): Promise<number> {
  const res = await fetch(
    "https://demoapp.top1soft.com.br/api/PreLaunch/register",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/plain",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    let errMsg = "Erro ao enviar inscrição";
    try {
      const err = await res.text();
      errMsg = err || errMsg;
    } catch {}
    throw new Error(errMsg);
  }

  const resultText = await res.text();
  return Number(resultText);
}

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("authToken");
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const getUser = (): any | null => {
  if (typeof window === "undefined") return null;

  try {
    const userString = localStorage.getItem("user");
    if (userString) {
      return JSON.parse(userString);
    }
    return null;
  } catch (error) {
    console.error(
      "Erro ao decodificar dados do usuário do localStorage:",
      error
    );

    logout();
    return null;
  }
};

export const getChurchInfo = (): any => {
  if (typeof window === "undefined") return null;

  const churchDataString = localStorage.getItem("churchData");
  if (churchDataString) {
    try {
      return JSON.parse(churchDataString);
    } catch (error) {
      console.error("Erro ao decodificar dados da igreja:", error);
    }
  }

  return {
    id: "1",
    name: "MyChurch",
    logo: "/mychurch-logo.png",
  };
};

const ROLE_HIERARCHY: { [key: string]: number } = {
  Admin: 4,
  Pastor: 3,
  Leader: 2,
  Member: 1,
};

export const hasPermission = (
  userRole: string,
  requiredRole: string
): boolean => {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;

  if (!userLevel || !requiredLevel) {
    return false;
  }

  return userLevel >= requiredLevel;
};

export const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("churchData");
    window.location.href = "/login";
  }
};
